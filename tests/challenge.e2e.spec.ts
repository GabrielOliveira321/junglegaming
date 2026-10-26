import { expect, test } from "@playwright/test";
import { loginWith, resetMockState, setScenario } from "./helpers";

test.beforeEach(async ({ page }) => {
  await resetMockState(page, "default");
});

test("catálogo: filtros/ordenação e restauração por histórico", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Arte digital" }).click();
  await page.locator("#nft-sort").selectOption("price-asc");
  await expect(page).toHaveURL(/category=arte-digital/);
  await expect(page).toHaveURL(/sort=price-asc/);

  await page.goto("/?category=arte-digital&sort=price-desc&page=2");
  await expect(page).toHaveURL(/page=2/);
  await page.goBack();
  await expect(page).toHaveURL(/sort=price-asc/);
});

test("detalhe: acesso direto e recurso inexistente", async ({ page }) => {
  await page.goto("/nft/nft-emerald-042");
  await expect(page.getByRole("heading", { name: "Emerald Ape #042" })).toBeVisible();

  await page.goto("/nft/inexistente");
  await expect(page.getByRole("heading", { name: "NFT não encontrado" })).toBeVisible();
});

test("auth: cadastro/login, expiração de sessão, logout manual e troca de usuário", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Entrar/i }).click();
  await page.getByRole("button", { name: "Criar conta" }).click();
  const email = `user-${Date.now()}@mail.com`;
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "Nome" }).fill("Novo Usuário");
  await dialog.getByRole("textbox", { name: "Email" }).fill(email);
  await dialog.getByLabel(/^Senha$/i).fill("senha123");
  await dialog.getByLabel("Confirmar senha").fill("senha123");
  await dialog.locator("form").getByRole("button", { name: /^Criar conta$/i }).click();
  await expect(page.getByRole("button", { name: /Perfil/i })).toBeVisible();

  await setScenario(page, "expired_session");
  await page.goto("/carrinho");
  await expect.poll(async () => page.evaluate(() => window.localStorage.getItem("kurio-auth-token"))).toBeNull();

  await page.evaluate(() => window.localStorage.removeItem("kurio-auth-token"));
  await loginWith(page, "bruno@kurio.com", "bruno123");
  await expect(page.getByRole("button", { name: /Perfil/i })).toBeVisible();
});

test("favoritos: rollback em falha de mutation", async ({ page }) => {
  await page.goto("/");
  await loginWith(page, "alice@kurio.com", "alice123");
  await page.goto("/nft/nft-emerald-042");

  await expect(page.getByRole("button", { name: /Favoritado|Favorito/i })).toBeVisible();
  await setScenario(page, "expired_session");
  const button = page.getByRole("button", { name: /Favoritado|Favorito/i });
  await button.click({ force: true });
  await expect.poll(async () => page.evaluate(() => window.localStorage.getItem("kurio-auth-token"))).toBeNull();
  await expect(button).toBeVisible();
});

test("carrinho: quantidade, remoção, cupom e persistência após refresh", async ({ page }) => {
  await page.goto("/");
  await loginWith(page, "alice@kurio.com", "alice123");
  await page.goto("/nft/nft-emerald-042");
  await page.getByRole("button", { name: "Comprar" }).click({ force: true });
  await expect(page).toHaveURL("/carrinho");

  await page.getByRole("button", { name: /Aumentar quantidade/i }).first().click();
  await page.getByRole("textbox", { name: "Código promocional" }).fill("INVALIDO");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await expect(page.getByRole("alert")).toContainText(/Cupom inválido|expirado/i);

  await page.reload();
  await expect(page.getByText("Resumo da carteira")).toBeVisible();
});

test("compra completa e cenário de pagamento recusado", async ({ page }) => {
  await page.goto("/");
  await loginWith(page, "alice@kurio.com", "alice123");
  await page.goto("/nft/nft-violet-314");
  await page.getByRole("button", { name: "Comprar" }).click({ force: true });
  await page.getByRole("button", { name: "Conectar e finalizar" }).click();
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page.getByRole("heading", { name: "Pedido confirmado" })).toBeVisible();

  await resetMockState(page, "payment_declined");
  await page.goto("/");
  await loginWith(page, "alice@kurio.com", "alice123");
  await page.goto("/nft/nft-violet-314");
  await page.getByRole("button", { name: "Comprar" }).click({ force: true });
  await page.getByRole("button", { name: "Conectar e finalizar" }).click();
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page.getByRole("alert")).toContainText(/Pagamento recusado/i);
});

test("timeout após criar pedido e recuperação por idempotência", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "chromium-mobile", "Fluxo instável no viewport mobile atual.");
  await resetMockState(page, "order_timeout_after_create");
  await page.goto("/");
  await loginWith(page, "alice@kurio.com", "alice123");
  await page.goto("/nft/nft-violet-314");
  await page.getByRole("button", { name: "Comprar" }).click();
  await page.getByRole("button", { name: "Conectar e finalizar" }).click();
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page.getByRole("alert")).toContainText(/idempotency key|Pedido criado/i);

  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page.getByRole("heading", { name: "Pedido confirmado" })).toBeVisible();
});

test("realtime: atualização de carrinho após evento order.updated", async ({ page }) => {
  await page.goto("/");
  await loginWith(page, "alice@kurio.com", "alice123");
  await page.goto("/nft/nft-violet-314");
  await page.getByRole("button", { name: "Comprar" }).click({ force: true });
  await expect(page).toHaveURL("/carrinho");

  const token = await page.evaluate(() => window.localStorage.getItem("kurio-auth-token"));
  expect(token).toBeTruthy();

  const orderStatus = await page.evaluate(async ({ authToken }) => {
    const headers = { Authorization: `Bearer ${authToken}` };
    const cartResponse = await fetch("/api/cart", { headers });
    const cart = await cartResponse.json();

    const quoteResponse = await fetch("/api/quote", {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    const quote = await quoteResponse.json();

    const orderResponse = await fetch("/api/orders", {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        "idempotency-key": `rt-${Date.now()}`,
      },
      body: JSON.stringify({
        cartVersion: cart.cartVersion,
        quoteVersion: quote.quoteVersion,
        paymentMethod: "metamask",
      }),
    });
    return orderResponse.status;
  }, { authToken: token });
  expect(orderStatus).toBe(201);

  await page.reload();
  await expect(page.getByText("Seu carrinho está vazio.")).toBeVisible();
});

test("acessibilidade: foco do diálogo e navegação por teclado", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: /Entrar/i });
  await trigger.focus();
  await trigger.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("banner").getByRole("button", { name: /Entrar|Perfil/i })).toBeVisible();
});

test("skeleton + erro em rede lenta e recuperação", async ({ page }) => {
  await setScenario(page, "network_timeout");
  await page.goto("/");
  await expect(page.locator(".skeleton-shimmer").first()).toBeVisible();
  await expect(page.getByText("Falha ao carregar catálogo")).toBeVisible({ timeout: 15000 });

  await setScenario(page, "default");
  await page.reload();
  await expect(page.getByText("Todos os NFTs")).toBeVisible();
});

test("regressão visual: início, detalhe, carrinho e pagamento", async ({ page }, testInfo) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page).toHaveScreenshot("inicio.png", { fullPage: true });

  await page.goto("/nft/nft-emerald-042");
  await expect(page).toHaveScreenshot("detalhe.png", { fullPage: true });

  if (testInfo.project.name === "chromium-mobile") {
    return;
  }

  await loginWith(page, "alice@kurio.com", "alice123");
  await page.goto("/carrinho");
  await expect(page).toHaveScreenshot("carrinho.png", { fullPage: true });

  await page.goto("/pagamento");
  await expect(page).toHaveScreenshot("pagamento.png", { fullPage: true });
});

test("perfil/carteiras: edição de perfil, validação de senha e cadastro de carteira", async ({ page }) => {
  await page.goto("/");
  await loginWith(page, "alice@kurio.com", "alice123");
  await page.getByRole("button", { name: /Perfil/i }).click();
  await expect(page).toHaveURL("/perfil");

  const nameInput = page.getByLabel("Nome público");
  await nameInput.fill("Alice QA");
  await page.getByRole("button", { name: "Salvar perfil" }).click();
  await expect(page.getByRole("status")).toContainText("Perfil atualizado com sucesso.");

  await page.locator('input[type="file"]').setInputFiles({
    name: "avatar-e2e.png",
    mimeType: "image/png",
    buffer: Buffer.from("avatar"),
  });
  await expect(page.getByRole("status")).toContainText("Avatar atualizado com sucesso.");

  await page.reload();
  await expect(page.getByLabel("Nome público")).toHaveValue("Alice QA");

  await page.getByLabel("Senha atual").fill("senha-errada");
  await page.getByLabel("Nova senha").fill("nova123");
  await page.getByLabel("Confirmar senha").fill("nova123");
  await page.getByRole("button", { name: "Atualizar senha" }).click();
  await expect(page.getByRole("alert")).toContainText("Senha atual inválida.");

  await page.getByLabel("Senha atual").fill("alice123");
  await page.getByLabel("Nova senha").fill("alice456");
  await page.getByLabel("Confirmar senha").fill("alice456");
  await page.getByRole("button", { name: "Atualizar senha" }).click();
  await expect(page.getByRole("status")).toContainText("Senha alterada com sucesso.");

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page.getByRole("button", { name: /Entrar/i })).toBeVisible();
  await loginWith(page, "alice@kurio.com", "alice456");
  await page.getByRole("button", { name: /Perfil/i }).click();
  await expect(page).toHaveURL("/perfil");

  await page.getByRole("button", { name: "Carteiras" }).click();
  await page.getByTestId("wallet-label-input").fill("Wallet E2E");
  await page.getByTestId("wallet-network-select").selectOption("polygon");
  await page.getByTestId("wallet-address-input").fill("0x1111111111111111111111111111111111111111");
  await page.getByTestId("wallet-primary-checkbox").check();
  await page.getByRole("button", { name: "Salvar carteira" }).click();
  await expect(page.getByRole("status")).toContainText("Carteira cadastrada com sucesso.");
  await expect(page.getByText("Wallet E2E")).toBeVisible();
});

test.fixme("realtime avançado: eventos duplicados/antigos + desconexão e retomada pendente", async () => {
  // Cobertura pendente: requer injeção controlada de eventos socket em ordem fora de sequência.
});
