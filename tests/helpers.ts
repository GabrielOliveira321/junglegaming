import { expect, type Page } from "@playwright/test";

export async function resetMockState(page: Page, scenario = "default") {
  await page.goto("/");
  await expect(page.getByText(/API \(mock\) ativa/i)).toBeVisible({ timeout: 15000 });
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  const ok = await page.evaluate(async (nextScenario) => {
    const response = await fetch("/api/mocks/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scenario: nextScenario }),
    });
    return response.ok;
  }, scenario);
  expect(ok).toBeTruthy();
}

export async function setScenario(page: Page, scenario: string) {
  const ok = await page.evaluate(async (name) => {
    const response = await fetch("/api/mocks/scenario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    return response.ok;
  }, scenario);
  expect(ok).toBeTruthy();
}

export async function openLogin(page: Page) {
  await page.getByRole("button", { name: /Entrar|Perfil/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

export async function loginWith(page: Page, email: string, password: string) {
  await openLogin(page);
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "Email" }).fill(email);
  await dialog.getByLabel(/^Senha$/i).fill(password);
  await dialog.locator("form").getByRole("button", { name: /^Entrar$/i }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
}
