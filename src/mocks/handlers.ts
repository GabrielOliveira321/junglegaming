import { delay, http, HttpResponse } from "msw";
import type {
  AddCartItemRequest,
  AddFavoriteRequest,
  ApiErrorCode,
  ApiErrorResponse,
  AuthResponse,
  CartItem,
  CartResponse,
  ChangePasswordRequest,
  CreateWalletRequest,
  LoginRequest,
  MockScenarioName,
  MockScenarioResponse,
  Nft,
  NftListResponse,
  OrderCreateRequest,
  OrderResponse,
  QuoteRequest,
  QuoteResponse,
  RegisterRequest,
  SessionResponse,
  UpdateCartItemRequest,
  UpdateProfileRequest,
  UpdateWalletRequest,
  Wallet,
} from "@/contracts/rest";
import { readMockState, resetMockState, SCENARIOS, updateMockState } from "@/mocks/state";
import { emitMockEvent } from "@/mocks/socketHandlers";

const API_BASE = "/api";
const NETWORK_FEE_ETH = 0.016;

function jsonError(
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: ApiErrorResponse["error"]["details"],
  retryable = false,
) {
  const payload: ApiErrorResponse = {
    error: {
      code,
      message,
      details,
      retryable,
    },
  };
  return HttpResponse.json(payload, { status });
}

async function applyNetworkProfile() {
  const current = readMockState();
  const nextTick = current.requestTick + 1;

  updateMockState((state) => ({
    ...state,
    requestTick: nextTick,
  }));

  if (current.scenario === "offline_connection") {
    await delay(80);
    return jsonError(503, "TRANSIENT_FAILURE", "Sem conexão com a rede.", undefined, true);
  }

  if (current.scenario === "network_timeout") {
    await delay(2200);
    return jsonError(504, "TRANSIENT_FAILURE", "Tempo limite de resposta excedido.", undefined, true);
  }

  if (current.scenario === "order_timeout_after_create") {
    await delay(180);
    return null;
  }

  if (current.scenario === "unstable_network") {
    const deterministicDelays = [120, 900, 250, 1400];
    await delay(deterministicDelays[nextTick % deterministicDelays.length]);
    if (nextTick % 5 === 0) {
      return jsonError(503, "TRANSIENT_FAILURE", "Serviço temporariamente indisponível.", undefined, true);
    }
    return null;
  }

  await delay(120);
  return null;
}

function normalizeFloat(value: number) {
  return Number.parseFloat(value.toFixed(3));
}

function buildRealtimeEventId(resourceType: string, resourceId: string, version: number) {
  return `${resourceType}:${resourceId}:${version}`;
}

function getTokenFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.replace("Bearer ", "").trim();
}

function getCurrentUser(request: Request) {
  const state = readMockState();

  if (state.scenario === "expired_session") {
    return null;
  }

  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  const session = state.sessions.find((entry) => entry.token === token);
  if (!session) {
    return null;
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    return null;
  }

  return state.users.find((user) => user.id === session.userId) ?? null;
}

function requireUser(request: Request) {
  const user = getCurrentUser(request);
  if (!user) {
    return {
      user: null,
      error: jsonError(401, "SESSION_INVALID", "Sessão inválida ou expirada."),
    };
  }

  return { user, error: null };
}

function getNftById(nftId: string): Nft | null {
  const state = readMockState();
  return state.nfts.find((nft) => nft.id === nftId) ?? null;
}

function buildCartResponse(userId: string): CartResponse {
  const state = readMockState();
  const user = state.users.find((item) => item.id === userId);

  if (!user) {
    return {
      items: [],
      subtotalEth: 0,
      discountEth: 0,
      networkFeeEth: NETWORK_FEE_ETH,
      totalEth: NETWORK_FEE_ETH,
      cartVersion: 1,
    };
  }

  const items: CartItem[] = user.cart
    .map((entry) => {
      const nft = state.nfts.find((item) => item.id === entry.nftId);
      if (!nft) {
        return null;
      }

      return {
        nftId: nft.id,
        name: nft.name,
        quantity: entry.quantity,
        unitPriceEth: nft.priceEth,
        availableEditions: nft.availableEditions,
        lineTotalEth: normalizeFloat(nft.priceEth * entry.quantity),
        version: nft.version,
      } satisfies CartItem;
    })
    .filter((item): item is CartItem => item !== null);

  const subtotalEth = normalizeFloat(
    items.reduce((accumulator, item) => accumulator + item.lineTotalEth, 0),
  );
  const discountEth = 0;
  const totalEth = normalizeFloat(subtotalEth - discountEth + NETWORK_FEE_ETH);

  return {
    items,
    subtotalEth,
    discountEth,
    networkFeeEth: NETWORK_FEE_ETH,
    totalEth,
    cartVersion: user.cartVersion,
  };
}

function buildQuote(userId: string, couponCode?: string): QuoteResponse {
  const cart = buildCartResponse(userId);
  const normalizedCoupon = couponCode?.trim().toUpperCase() || undefined;

  if (!normalizedCoupon) {
    return {
      validCoupon: false,
      couponDiscountEth: 0,
      subtotalEth: cart.subtotalEth,
      networkFeeEth: cart.networkFeeEth,
      totalEth: cart.totalEth,
      quoteVersion: cart.cartVersion,
    };
  }

  const discountEth = normalizeFloat(cart.subtotalEth * 0.1);
  const totalEth = normalizeFloat(cart.subtotalEth - discountEth + cart.networkFeeEth);

  return {
    validCoupon: true,
    couponCode: normalizedCoupon,
    couponDiscountEth: discountEth,
    subtotalEth: cart.subtotalEth,
    networkFeeEth: cart.networkFeeEth,
    totalEth,
    quoteVersion: cart.cartVersion,
  };
}

function parseBody<T>(input: unknown): T {
  return input as T;
}

export const handlers = [
  http.get(`${API_BASE}/health`, async () => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const state = readMockState();
    return HttpResponse.json({
      status: "ok",
      service: "junglegaming-msw",
      mode: "mock",
      scenario: state.scenario,
      timestamp: new Date().toISOString(),
    });
  }),

  http.get(`${API_BASE}/mocks/scenario`, async () => {
    const current = readMockState();
    const active = SCENARIOS.find((item) => item.name === current.scenario) ?? SCENARIOS[0];
    const payload: MockScenarioResponse = {
      active,
      available: SCENARIOS,
    };
    return HttpResponse.json(payload);
  }),

  http.post(`${API_BASE}/mocks/scenario`, async ({ request }) => {
    const body = parseBody<{ name?: MockScenarioName }>(await request.json());
    if (!body.name || !SCENARIOS.some((item) => item.name === body.name)) {
      return jsonError(422, "VALIDATION_ERROR", "Cenário inválido.");
    }

    const state = resetMockState(body.name);
    const active = SCENARIOS.find((item) => item.name === state.scenario) ?? SCENARIOS[0];
    return HttpResponse.json({
      active,
      available: SCENARIOS,
    } satisfies MockScenarioResponse);
  }),

  http.post(`${API_BASE}/mocks/reset`, async ({ request }) => {
    const body = parseBody<{ scenario?: MockScenarioName }>(await request.json().catch(() => ({})));
    const scenario = body.scenario && SCENARIOS.some((item) => item.name === body.scenario)
      ? body.scenario
      : "default";
    const state = resetMockState(scenario);
    return HttpResponse.json({
      status: "reset",
      scenario: state.scenario,
    });
  }),

  http.post(`${API_BASE}/auth/register`, async ({ request }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const body = parseBody<RegisterRequest>(await request.json());
    if (!body.email || !body.password || !body.displayName) {
      return jsonError(422, "VALIDATION_ERROR", "Campos obrigatórios ausentes.");
    }

    const state = readMockState();
    const existing = state.users.find((user) => user.email.toLowerCase() === body.email.toLowerCase());
    if (existing) {
      return jsonError(409, "CONFLICT", "Já existe uma conta com esse e-mail.");
    }

    const newId = `user-${state.users.length + 1}`;
    updateMockState((current) => ({
      ...current,
      users: [
        ...current.users,
        {
          id: newId,
          email: body.email,
          password: body.password,
          profile: {
            displayName: body.displayName,
            username: body.displayName.toLowerCase().replace(/\s+/g, ""),
            email: body.email,
            ensName: "",
            walletNickname: "",
            avatarUrl: null,
          },
          favorites: [],
          cart: [],
          cartVersion: 1,
          quoteVersion: 1,
          wallets: [],
          orders: [],
          idempotencyRecords: {},
        },
      ],
    }));

    return HttpResponse.json({ status: "created" }, { status: 201 });
  }),

  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const body = parseBody<LoginRequest>(await request.json());
    const state = readMockState();
    const user = state.users.find(
      (item) => item.email.toLowerCase() === body.email.toLowerCase() && item.password === body.password,
    );

    if (!user) {
      return jsonError(401, "SESSION_INVALID", "Credenciais inválidas.");
    }

    const token = `token-${user.id}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    updateMockState((current) => ({
      ...current,
      sessions: [
        ...current.sessions.filter((session) => session.userId !== user.id),
        { token, userId: user.id, expiresAt },
      ],
    }));

    const response: AuthResponse = {
      token,
      sessionExpiresAt: expiresAt,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.profile.displayName,
      },
    };

    return HttpResponse.json(response);
  }),

  http.get(`${API_BASE}/auth/session`, async ({ request }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const user = getCurrentUser(request);
    if (!user) {
      const payload: SessionResponse = {
        authenticated: false,
        user: null,
        sessionExpiresAt: null,
      };
      return HttpResponse.json(payload, { status: 401 });
    }

    const token = getTokenFromRequest(request);
    const session = readMockState().sessions.find((entry) => entry.token === token);
    const payload: SessionResponse = {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.profile.displayName,
      },
      sessionExpiresAt: session?.expiresAt ?? null,
    };
    return HttpResponse.json(payload);
  }),

  http.post(`${API_BASE}/auth/logout`, async ({ request }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const token = getTokenFromRequest(request);
    if (token) {
      updateMockState((state) => ({
        ...state,
        sessions: state.sessions.filter((entry) => entry.token !== token),
      }));
    }
    return HttpResponse.json({ status: "ok" });
  }),

  http.get(`${API_BASE}/nfts`, async ({ request }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const state = readMockState();
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase().trim() ?? "";
    const category = url.searchParams.get("category")?.toLowerCase().trim() ?? "";
    const sort = url.searchParams.get("sort") ?? "recent";
    const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
    const perPage = Number.parseInt(url.searchParams.get("perPage") ?? "12", 10);

    let filtered = state.nfts.filter((item) => {
      const byQuery = !q || item.name.toLowerCase().includes(q);
      const byCategory = !category || item.category === category;
      return byQuery && byCategory;
    });

    if (sort === "price-asc") {
      filtered = [...filtered].sort((a, b) => a.priceEth - b.priceEth);
    } else if (sort === "price-desc") {
      filtered = [...filtered].sort((a, b) => b.priceEth - a.priceEth);
    }

    const safePage = Number.isFinite(page) && page >= 1 ? page : 1;
    const safePerPage = Number.isFinite(perPage) && perPage >= 1 ? perPage : 12;
    const start = (safePage - 1) * safePerPage;
    const items = filtered.slice(start, start + safePerPage);

    const payload: NftListResponse = {
      items,
      page: safePage,
      perPage: safePerPage,
      total: filtered.length,
    };
    return HttpResponse.json(payload);
  }),

  http.get(`${API_BASE}/nfts/:nftId`, async ({ params }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const nft = getNftById(String(params.nftId));
    if (!nft) {
      return jsonError(404, "NOT_FOUND", "NFT não encontrado.");
    }
    return HttpResponse.json(nft);
  }),

  http.get(`${API_BASE}/favorites`, async ({ request }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const { user, error } = requireUser(request);
    if (error) {
      return error;
    }
    return HttpResponse.json({ nftIds: user.favorites });
  }),

  http.post(`${API_BASE}/favorites`, async ({ request }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const { user, error } = requireUser(request);
    if (error) {
      return error;
    }

    const body = parseBody<AddFavoriteRequest>(await request.json());
    if (!body.nftId || !getNftById(body.nftId)) {
      return jsonError(404, "NOT_FOUND", "NFT não encontrado para favoritar.");
    }

    updateMockState((state) => ({
      ...state,
      users: state.users.map((entry) => {
        if (entry.id !== user.id) {
          return entry;
        }
        if (entry.favorites.includes(body.nftId)) {
          return entry;
        }
        return { ...entry, favorites: [...entry.favorites, body.nftId] };
      }),
    }));

    const updated = readMockState().users.find((entry) => entry.id === user.id);
    return HttpResponse.json({ nftIds: updated?.favorites ?? [] });
  }),

  http.delete(`${API_BASE}/favorites/:nftId`, async ({ request, params }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const { user, error } = requireUser(request);
    if (error) {
      return error;
    }

    const nftId = String(params.nftId);
    updateMockState((state) => ({
      ...state,
      users: state.users.map((entry) =>
        entry.id === user.id
          ? { ...entry, favorites: entry.favorites.filter((id) => id !== nftId) }
          : entry,
      ),
    }));

    const updated = readMockState().users.find((entry) => entry.id === user.id);
    return HttpResponse.json({ nftIds: updated?.favorites ?? [] });
  }),

  http.get(`${API_BASE}/cart`, async ({ request }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const { user, error } = requireUser(request);
    if (error) {
      return error;
    }

    return HttpResponse.json(buildCartResponse(user.id));
  }),

  http.post(`${API_BASE}/cart/items`, async ({ request }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const { user, error } = requireUser(request);
    if (error) {
      return error;
    }

    const body = parseBody<AddCartItemRequest>(await request.json());
    if (!body.nftId || !Number.isFinite(body.quantity) || body.quantity < 1) {
      return jsonError(422, "VALIDATION_ERROR", "Dados inválidos para carrinho.");
    }

    const nft = getNftById(body.nftId);
    if (!nft) {
      return jsonError(404, "NOT_FOUND", "NFT não encontrado.");
    }

    if (body.quantity > nft.availableEditions) {
      return jsonError(409, "CONFLICT", "Quantidade indisponível.");
    }

    updateMockState((state) => ({
      ...state,
      users: state.users.map((entry) => {
        if (entry.id !== user.id) {
          return entry;
        }

        const existing = entry.cart.find((item) => item.nftId === body.nftId);
        const nextCart = existing
          ? entry.cart.map((item) =>
            item.nftId === body.nftId
              ? { ...item, quantity: Math.min(nft.availableEditions, item.quantity + body.quantity) }
              : item,
          )
          : [...entry.cart, { nftId: body.nftId, quantity: body.quantity }];

        return {
          ...entry,
          cart: nextCart,
          cartVersion: entry.cartVersion + 1,
          quoteVersion: entry.quoteVersion + 1,
        };
      }),
    }));

    const nextCart = buildCartResponse(user.id);
    emitMockEvent("order.updated", {
      eventId: buildRealtimeEventId("cart", user.id, nextCart.cartVersion),
      eventType: "order.updated",
      action: "cart.changed",
      userId: user.id,
      resourceType: "cart",
      resourceId: user.id,
      version: nextCart.cartVersion,
      occurredAt: new Date().toISOString(),
    });

    return HttpResponse.json(nextCart, { status: 201 });
  }),

  http.patch(`${API_BASE}/cart/items/:nftId`, async ({ request, params }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const { user, error } = requireUser(request);
    if (error) {
      return error;
    }

    const body = parseBody<UpdateCartItemRequest>(await request.json());
    if (!Number.isFinite(body.quantity) || body.quantity < 1) {
      return jsonError(422, "VALIDATION_ERROR", "Quantidade inválida.");
    }

    const nftId = String(params.nftId);
    const nft = getNftById(nftId);
    if (!nft) {
      return jsonError(404, "NOT_FOUND", "NFT não encontrado.");
    }

    if (body.quantity > nft.availableEditions) {
      return jsonError(409, "CONFLICT", "Quantidade indisponível para este NFT.");
    }

    updateMockState((state) => ({
      ...state,
      users: state.users.map((entry) => {
        if (entry.id !== user.id) {
          return entry;
        }
        return {
          ...entry,
          cart: entry.cart.map((item) =>
            item.nftId === nftId ? { ...item, quantity: body.quantity } : item,
          ),
          cartVersion: entry.cartVersion + 1,
          quoteVersion: entry.quoteVersion + 1,
        };
      }),
    }));


    const nextCart = buildCartResponse(user.id);
    emitMockEvent("order.updated", {
      eventId: buildRealtimeEventId("cart", user.id, nextCart.cartVersion),
      eventType: "order.updated",
      action: "cart.changed",
      userId: user.id,
      resourceType: "cart",
      resourceId: user.id,
      version: nextCart.cartVersion,
      occurredAt: new Date().toISOString(),
    });
    return HttpResponse.json(nextCart);
  }),

  http.delete(`${API_BASE}/cart/items/:nftId`, async ({ request, params }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const { user, error } = requireUser(request);
    if (error) {
      return error;
    }

    const nftId = String(params.nftId);
    updateMockState((state) => ({
      ...state,
      users: state.users.map((entry) => {
        if (entry.id !== user.id) {
          return entry;
        }
        return {
          ...entry,
          cart: entry.cart.filter((item) => item.nftId !== nftId),
          cartVersion: entry.cartVersion + 1,
          quoteVersion: entry.quoteVersion + 1,
        };
      }),
    }));

    const nextCart = buildCartResponse(user.id);
    emitMockEvent("order.updated", {
      eventId: buildRealtimeEventId("cart", user.id, nextCart.cartVersion),
      eventType: "order.updated",
      action: "cart.changed",
      userId: user.id,
      resourceType: "cart",
      resourceId: user.id,
      version: nextCart.cartVersion,
      occurredAt: new Date().toISOString(),
    });
    return HttpResponse.json(nextCart);
  }),

  http.post(`${API_BASE}/quote`, async ({ request }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const { user, error } = requireUser(request);
    if (error) {
      return error;
    }

    const body = parseBody<QuoteRequest>(await request.json().catch(() => ({})));
    const cart = buildCartResponse(user.id);
    const unavailable = cart.items.find((item) => item.quantity > item.availableEditions);
    if (unavailable) {
      return jsonError(409, "CONFLICT", "Item esgotado ou preço alterado durante a compra.", {
        nftId: unavailable.nftId,
      });
    }

    const normalizedCoupon = body.couponCode?.trim().toUpperCase();
    if (normalizedCoupon && normalizedCoupon !== "KURIO10") {
      return jsonError(422, "VALIDATION_ERROR", "Cupom inválido ou expirado.", {
        couponCode: normalizedCoupon,
      });
    }

    return HttpResponse.json(buildQuote(user.id, normalizedCoupon));
  }),

  http.post(`${API_BASE}/orders`, async ({ request }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const { user, error } = requireUser(request);
    if (error) {
      return error;
    }

    const idempotencyKey =
      request.headers.get("idempotency-key") ?? request.headers.get("x-idempotency-key");
    if (!idempotencyKey) {
      return jsonError(422, "VALIDATION_ERROR", "Cabeçalho de idempotência obrigatório.");
    }

    const body = parseBody<OrderCreateRequest>(await request.json());
    const state = readMockState();
    const currentUser = state.users.find((entry) => entry.id === user.id);
    if (!currentUser) {
      return jsonError(401, "SESSION_INVALID", "Sessão inválida.");
    }

    const fingerprint = JSON.stringify(body);
    const existingRecord = currentUser.idempotencyRecords[idempotencyKey];
    if (existingRecord) {
      if (existingRecord.fingerprint !== fingerprint) {
        return jsonError(
          409,
          "IDEMPOTENCY_CONFLICT",
          "Chave de idempotência reutilizada com payload diferente.",
        );
      }

      const existingOrder = currentUser.orders.find((order) => order.id === existingRecord.orderId);
      if (!existingOrder) {
        return jsonError(409, "CONFLICT", "Registro de idempotência inconsistente.");
      }
      return HttpResponse.json(existingOrder);
    }

    if (body.cartVersion !== currentUser.cartVersion || body.quoteVersion !== currentUser.quoteVersion) {
      return jsonError(409, "CONFLICT", "Cotação desatualizada. Atualize o resumo e tente novamente.");
    }

    const cart = buildCartResponse(currentUser.id);
    if (cart.items.length === 0) {
      return jsonError(422, "VALIDATION_ERROR", "Carrinho vazio para criação de pedido.");
    }
    const purchasedItems = cart.items.map((item) => ({
      nftId: item.nftId,
      quantity: item.quantity,
    }));

    const now = new Date().toISOString();
    const orderId = `order-${Date.now()}`;
    const scenario = state.scenario;
    const status = scenario === "payment_declined" ? "declined" : "confirmed";

    const order: OrderResponse = {
      id: orderId,
      status,
      subtotalEth: cart.subtotalEth,
      networkFeeEth: cart.networkFeeEth,
      totalEth: cart.totalEth,
      receiptUrl: status === "confirmed" ? `/api/orders/${orderId}/receipt` : null,
      idempotencyKey,
      createdAt: now,
      updatedAt: now,
    };

    updateMockState((current) => ({
      ...current,
      nfts:
        status === "confirmed"
          ? current.nfts.map((nft) => {
            const purchased = purchasedItems.find((item) => item.nftId === nft.id);
            if (!purchased) {
              return nft;
            }

            return {
              ...nft,
              availableEditions: Math.max(0, nft.availableEditions - purchased.quantity),
              version: nft.version + 1,
            };
          })
          : current.nfts,
      users: current.users.map((entry) => {
        if (entry.id !== currentUser.id) {
          return entry;
        }
        return {
          ...entry,
          orders: [order, ...entry.orders],
          cart: status === "confirmed" ? [] : entry.cart,
          cartVersion: entry.cartVersion + 1,
          quoteVersion: entry.quoteVersion + 1,
          idempotencyRecords: {
            ...entry.idempotencyRecords,
            [idempotencyKey]: {
              fingerprint,
              orderId,
            },
          },
        };
      }),
    }));

    emitMockEvent("order.updated", {
      eventId: buildRealtimeEventId("order", order.id, Date.parse(order.updatedAt)),
      eventType: "order.updated",
      action: "order.created",
      userId: currentUser.id,
      resourceType: "order",
      resourceId: order.id,
      version: Date.parse(order.updatedAt),
      status: order.status,
      occurredAt: order.updatedAt,
    });

    if (status === "confirmed") {
      const stateAfterOrder = readMockState();

      for (const purchased of purchasedItems) {
        const updatedNft = stateAfterOrder.nfts.find((nft) => nft.id === purchased.nftId);
        if (!updatedNft) {
          continue;
        }

        emitMockEvent("nft.updated", {
          eventId: buildRealtimeEventId("nft", updatedNft.id, updatedNft.version),
          eventType: "nft.updated",
          action: "nft.updated",
          resourceType: "nft",
          resourceId: updatedNft.id,
          version: updatedNft.version,
          priceEth: updatedNft.priceEth,
          availableEditions: updatedNft.availableEditions,
          occurredAt: new Date().toISOString(),
        });
      }
    }

    if (scenario === "order_timeout_after_create") {
      return jsonError(
        504,
        "TRANSIENT_FAILURE",
        "Pedido criado, mas a confirmação expirou. Reenvie com a mesma idempotency key.",
        {
          orderId: order.id,
        },
        true,
      );
    }

    return HttpResponse.json(order, { status: 201 });
  }),

  http.get(`${API_BASE}/orders/:orderId`, async ({ request, params }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const { user, error } = requireUser(request);
    if (error) {
      return error;
    }

    const order = user.orders.find((item) => item.id === String(params.orderId));
    if (!order) {
      return jsonError(404, "NOT_FOUND", "Pedido não encontrado.");
    }
    return HttpResponse.json(order);
  }),

  http.get(`${API_BASE}/profile`, async ({ request }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const { user, error } = requireUser(request);
    if (error) {
      return error;
    }
    return HttpResponse.json(user.profile);
  }),

  http.patch(`${API_BASE}/profile`, async ({ request }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const { user, error } = requireUser(request);
    if (error) {
      return error;
    }

    const body = parseBody<UpdateProfileRequest>(await request.json());
    updateMockState((state) => ({
      ...state,
      users: state.users.map((entry) =>
        entry.id === user.id
          ? {
            ...entry,
            profile: {
              ...entry.profile,
              ...body,
            },
          }
          : entry,
      ),
    }));

    const updated = readMockState().users.find((entry) => entry.id === user.id);
    return HttpResponse.json(updated?.profile ?? user.profile);
  }),

  http.post(`${API_BASE}/profile/password`, async ({ request }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const { user, error } = requireUser(request);
    if (error) {
      return error;
    }

    const body = parseBody<ChangePasswordRequest>(await request.json());
    if (!body.currentPassword || !body.newPassword || !body.confirmPassword) {
      return jsonError(422, "VALIDATION_ERROR", "Preencha todos os campos de senha.");
    }
    if (body.newPassword !== body.confirmPassword) {
      return jsonError(422, "VALIDATION_ERROR", "A confirmação de senha não confere.");
    }

    if (user.password !== body.currentPassword) {
      return jsonError(422, "VALIDATION_ERROR", "Senha atual inválida.");
    }

    updateMockState((state) => ({
      ...state,
      users: state.users.map((entry) =>
        entry.id === user.id ? { ...entry, password: body.newPassword } : entry,
      ),
    }));

    return HttpResponse.json({ status: "ok" });
  }),

  http.get(`${API_BASE}/wallets`, async ({ request }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const { user, error } = requireUser(request);
    if (error) {
      return error;
    }

    return HttpResponse.json(user.wallets);
  }),

  http.post(`${API_BASE}/wallets`, async ({ request }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const { user, error } = requireUser(request);
    if (error) {
      return error;
    }

    const body = parseBody<CreateWalletRequest>(await request.json());
    if (!body.address || !body.label || !body.network) {
      return jsonError(422, "VALIDATION_ERROR", "Campos obrigatórios de carteira ausentes.");
    }

    const newWallet: Wallet = {
      ...body,
      id: `wallet-${Date.now()}`,
    };

    updateMockState((state) => ({
      ...state,
      users: state.users.map((entry) =>
        entry.id === user.id ? { ...entry, wallets: [...entry.wallets, newWallet] } : entry,
      ),
    }));

    return HttpResponse.json(newWallet, { status: 201 });
  }),

  http.patch(`${API_BASE}/wallets/:walletId`, async ({ request, params }) => {
    const transientError = await applyNetworkProfile();
    if (transientError) {
      return transientError;
    }

    const { user, error } = requireUser(request);
    if (error) {
      return error;
    }

    const body = parseBody<UpdateWalletRequest>(await request.json());
    const walletId = String(params.walletId);

    let updatedWallet: Wallet | null = null;
    updateMockState((state) => ({
      ...state,
      users: state.users.map((entry) => {
        if (entry.id !== user.id) {
          return entry;
        }
        const nextWallets = entry.wallets.map((wallet) => {
          if (wallet.id !== walletId) {
            return wallet;
          }
          updatedWallet = { ...wallet, ...body };
          return updatedWallet;
        });
        return { ...entry, wallets: nextWallets };
      }),
    }));

    if (!updatedWallet) {
      return jsonError(404, "NOT_FOUND", "Carteira não encontrada.");
    }

    return HttpResponse.json(updatedWallet);
  }),
];
