import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "reports", "lighthouse");
const chromeFlags = "--headless=new --no-sandbox --disable-dev-shm-usage";

const profiles = [
  { id: "mobile", configPath: path.join(projectRoot, "lighthouse", "config.mobile.json") },
  { id: "desktop", configPath: path.join(projectRoot, "lighthouse", "config.desktop.json") },
];

const pages = [
  { id: "home", path: "/" },
  { id: "nft-detail", path: "/nft/nft-emerald-042" },
];

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

function round(num, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(num * factor) / factor;
}

async function runCommand(command, args, options = {}) {
  const { cwd = projectRoot, capture = false } = options;
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    if (capture) {
      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });
    }

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      } else {
        reject(new Error(`Command failed (${command} ${args.join(" ")}): ${stderr || stdout}`));
      }
    });
  });
}

async function findFreePort(start = 4173, attempts = 50) {
  for (let port = start; port < start + attempts; port += 1) {
    const available = await new Promise((resolve) => {
      const server = net.createServer();
      server.once("error", () => resolve(false));
      server.once("listening", () => {
        server.close(() => resolve(true));
      });
      server.listen(port, "127.0.0.1");
    });

    if (available) {
      return port;
    }
  }

  throw new Error("No free TCP port found for Vite preview.");
}

async function waitForServer(baseUrl, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/`);
      if (response.ok) {
        return;
      }
    } catch {
      // Wait for server readiness.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Vite preview server did not start in time.");
}

async function runLighthouseSet(baseUrl, chromePath) {
  const reports = [];

  for (const profile of profiles) {
    for (const pageDef of pages) {
      for (let run = 1; run <= 3; run += 1) {
        const outputBase = path.join(outputDir, `${profile.id}-${pageDef.id}-run${run}`);
        const targetUrl = `${baseUrl}${pageDef.path}`;
        let completed = false;
        let attempt = 0;

        while (!completed && attempt < 3) {
          attempt += 1;
          try {
            await runCommand("npx", [
              "lighthouse",
              targetUrl,
              "--config-path",
              profile.configPath,
              "--chrome-path",
              chromePath,
              "--chrome-flags",
              chromeFlags,
              "--max-wait-for-load",
              "45000",
              "--output",
              "json",
              "--output",
              "html",
              "--output-path",
              outputBase,
              "--quiet",
            ]);
            completed = true;
          } catch (error) {
            if (attempt >= 3) {
              throw error;
            }
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }
        }

        const jsonPath = `${outputBase}.report.json`;
        const lhrRaw = await readFile(jsonPath, "utf8");
        const lhr = JSON.parse(lhrRaw);
        const perf = lhr.categories.performance.score * 100;
        const a11y = lhr.categories.accessibility.score * 100;
        const best = lhr.categories["best-practices"].score * 100;
        const seo = lhr.categories.seo.score * 100;
        const lcp = lhr.audits["largest-contentful-paint"].numericValue;
        const cls = lhr.audits["cumulative-layout-shift"].numericValue;
        const tbt = lhr.audits["total-blocking-time"].numericValue;

        const opportunities = Object.values(lhr.audits)
          .filter((audit) => audit.details?.type === "opportunity" && typeof audit.numericValue === "number")
          .sort((a, b) => b.numericValue - a.numericValue)
          .slice(0, 3)
          .map((audit) => ({
            id: audit.id,
            title: audit.title,
            displayValue: audit.displayValue ?? null,
          }));

        reports.push({
          profile: profile.id,
          page: pageDef.id,
          run,
          url: targetUrl,
          reportHtml: path.relative(projectRoot, `${outputBase}.report.html`),
          reportJson: path.relative(projectRoot, jsonPath),
          scores: {
            performance: round(perf, 2),
            accessibility: round(a11y, 2),
            bestPractices: round(best, 2),
            seo: round(seo, 2),
          },
          vitals: {
            lcpMs: round(lcp, 2),
            cls: round(cls, 4),
            tbtMs: round(tbt, 2),
          },
          topOpportunities: opportunities,
        });
      }
    }
  }

  return reports;
}

function buildMedianSummary(reports) {
  const targets = {
    performance: 90,
    accessibility: 95,
    bestPractices: 95,
    seo: 90,
  };

  const grouped = new Map();

  for (const report of reports) {
    const key = `${report.profile}::${report.page}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(report);
  }

  const medians = [];
  for (const [key, entries] of grouped.entries()) {
    const [profile, page] = key.split("::");
    const performanceValues = entries.map((entry) => entry.scores.performance);
    const accessibilityValues = entries.map((entry) => entry.scores.accessibility);
    const bestValues = entries.map((entry) => entry.scores.bestPractices);
    const seoValues = entries.map((entry) => entry.scores.seo);
    const lcpValues = entries.map((entry) => entry.vitals.lcpMs);
    const clsValues = entries.map((entry) => entry.vitals.cls);
    const tbtValues = entries.map((entry) => entry.vitals.tbtMs);

    const medianEntry = {
      profile,
      page,
      runs: entries.length,
      medianScores: {
        performance: round(median(performanceValues), 2),
        accessibility: round(median(accessibilityValues), 2),
        bestPractices: round(median(bestValues), 2),
        seo: round(median(seoValues), 2),
      },
      medianVitals: {
        lcpMs: round(median(lcpValues), 2),
        cls: round(median(clsValues), 4),
        tbtMs: round(median(tbtValues), 2),
      },
      belowTarget: [],
      likelyCauses: [],
    };

    if (medianEntry.medianScores.performance < targets.performance) {
      medianEntry.belowTarget.push("performance");
    }
    if (medianEntry.medianScores.accessibility < targets.accessibility) {
      medianEntry.belowTarget.push("accessibility");
    }
    if (medianEntry.medianScores.bestPractices < targets.bestPractices) {
      medianEntry.belowTarget.push("bestPractices");
    }
    if (medianEntry.medianScores.seo < targets.seo) {
      medianEntry.belowTarget.push("seo");
    }

    const causeCounts = new Map();
    for (const entry of entries) {
      for (const cause of entry.topOpportunities) {
        const label = `${cause.title}${cause.displayValue ? ` (${cause.displayValue})` : ""}`;
        causeCounts.set(label, (causeCounts.get(label) ?? 0) + 1);
      }
    }

    medianEntry.likelyCauses = [...causeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cause]) => cause);

    medians.push(medianEntry);
  }

  return { targets, medians };
}

async function main() {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  const previewPort = await findFreePort();
  const baseUrl = `http://127.0.0.1:${previewPort}`;

  await runCommand("npm", ["run", "build"]);

  const preview = spawn(
    "npm",
    ["run", "preview", "--", "--host", "127.0.0.1", "--port", String(previewPort), "--strictPort"],
    {
      cwd: projectRoot,
      stdio: "inherit",
      env: process.env,
    },
  );

  try {
    await waitForServer(baseUrl);
    const chromePath = chromium.executablePath();
    const reports = await runLighthouseSet(baseUrl, chromePath);
    const summary = buildMedianSummary(reports);
    const lighthouseVersion = (await runCommand("npx", ["lighthouse", "--version"], { capture: true })).stdout;
    const npmVersion = (await runCommand("npm", ["--version"], { capture: true })).stdout;

    const payload = {
      generatedAt: new Date().toISOString(),
      execution: {
        baseUrl,
        scenario: "default (fresh browser profile with empty localStorage per run)",
        runsPerPageProfile: 3,
        pages,
        profiles: profiles.map((profile) => ({
          id: profile.id,
          configPath: path.relative(projectRoot, profile.configPath),
        })),
        chromeFlags,
      },
      environment: {
        os: `${os.platform()} ${os.release()}`,
        cpu: os.cpus()[0]?.model ?? "unknown",
        node: process.version,
        npm: npmVersion,
        lighthouse: lighthouseVersion,
      },
      reports,
      summary,
    };

    await writeFile(path.join(outputDir, "summary.json"), JSON.stringify(payload, null, 2), "utf8");
  } finally {
    preview.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
