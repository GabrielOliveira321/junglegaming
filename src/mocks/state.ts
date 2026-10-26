import type {
  MockScenarioConfig,
  MockScenarioName,
  Nft,
  OrderResponse,
  Profile,
  Wallet,
} from "@/contracts/rest";

const MOCK_STATE_STORAGE_KEY = "kurio-mock-state-v1";

type UserCartItem = {
  nftId: string;
  quantity: number;
};

type IdempotencyRecord = {
  fingerprint: string;
  orderId: string;
};

export type InternalUser = {
  id: string;
  email: string;
  password: string;
  profile: Profile;
  favorites: string[];
  cart: UserCartItem[];
  cartVersion: number;
  quoteVersion: number;
  wallets: Wallet[];
  orders: OrderResponse[];
  idempotencyRecords: Record<string, IdempotencyRecord>;
};

type SessionRecord = {
  token: string;
  userId: string;
  expiresAt: string;
};

export type MockState = {
  users: InternalUser[];
  sessions: SessionRecord[];
  nfts: Nft[];
  scenario: MockScenarioName;
  requestTick: number;
};

export const SCENARIOS: MockScenarioConfig[] = [
  { name: "default", description: "Fluxo padrão com sucesso e dados completos" },
  { name: "empty_results", description: "Busca/listagem retorna vazio" },
  { name: "unstable_network", description: "Latência variável com falhas transitórias" },
  { name: "network_timeout", description: "Timeout determinístico de rede" },
  { name: "offline_connection", description: "Conexão indisponível (offline)" },
  { name: "order_timeout_after_create", description: "Timeout após criação do pedido (idempotência)" },
  { name: "expired_session", description: "Sessão inválida em rotas privadas" },
  { name: "payment_declined", description: "Pedidos criados como pagamento recusado" },
];

const baseNfts: Nft[] = [
  {
    id: "nft-emerald-042",
    name: "Emerald Ape #042",
    category: "arte-digital",
    imageUrl: "/macacos/emerald-042-300.webp",
    priceEth: 1.19,
    availableEditions: 8,
    version: 3,
  },
  {
    id: "nft-sage-009",
    name: "Sage Nomad #009",
    category: "arte-digital",
    imageUrl: "/macacos/sage-009-300.webp",
    priceEth: 1.69,
    availableEditions: 9,
    version: 2,
  },
  {
    id: "nft-neon-552",
    name: "Neon Vessel #552",
    category: "arte-digital",
    imageUrl: "/macacos/neon-552-300.webp",
    priceEth: 1.99,
    compareAtEth: 2.29,
    availableEditions: 6,
    version: 2,
  },
  {
    id: "nft-cosmic-118",
    name: "Cosmic Bloom #118",
    category: "colecionaveis",
    imageUrl: "/macacos/sage-009-300.webp",
    priceEth: 1.29,
    availableEditions: 11,
    version: 2,
  },
  {
    id: "nft-violet-314",
    name: "Violet Nomad #314",
    category: "colecionaveis",
    imageUrl: "/macacos/sage-009-300.webp",
    priceEth: 1.39,
    availableEditions: 3,
    version: 2,
  },
  {
    id: "nft-ivory-088",
    name: "Ivory Baron #088",
    category: "fotografia",
    imageUrl: "/macacos/neon-552-300.webp",
    priceEth: 1.79,
    availableEditions: 12,
    version: 5,
  },
  {
    id: "nft-golden-207",
    name: "Golden Beat #207",
    category: "musica",
    imageUrl: "/macacos/golden-207-300.webp",
    priceEth: 0.99,
    availableEditions: 10,
    version: 1,
  },
  {
    id: "nft-signal-160",
    name: "Golden Signal #160",
    category: "musica",
    imageUrl: "/macacos/golden-207-300.webp",
    priceEth: 0.39,
    availableEditions: 14,
    version: 1,
  },
  {
    id: "nft-kurio-014",
    name: "Kurio Edition #014",
    category: "musica",
    imageUrl: "/macacos/golden-207-300.webp",
    priceEth: 2.49,
    availableEditions: 1,
    version: 4,
  },
];

function createBaseUser(params: {
  id: string;
  email: string;
  password: string;
  displayName: string;
  username: string;
  ensName: string;
}) {
  const profile: Profile = {
    displayName: params.displayName,
    username: params.username,
    email: params.email,
    ensName: params.ensName,
    walletNickname: "Principal",
    avatarUrl: null,
  };

  const wallets: Wallet[] = [
    {
      id: `${params.id}-wallet-main`,
      label: "Carteira principal",
      network: "ethereum",
      address: "0x57A8D57Fb5d7bc4Bb6f9f3CBee7A987f6A8300a1",
      isPrimary: true,
    },
  ];

  return {
    id: params.id,
    email: params.email,
    password: params.password,
    profile,
    favorites: ["nft-emerald-042"],
    cart: [{ nftId: "nft-violet-314", quantity: 1 }],
    cartVersion: 1,
    quoteVersion: 1,
    wallets,
    orders: [],
    idempotencyRecords: {},
  } satisfies InternalUser;
}

function buildInitialState(scenario: MockScenarioName): MockState {
  const users: InternalUser[] = [
    createBaseUser({
      id: "user-1",
      email: "alice@kurio.com",
      password: "alice123",
      displayName: "Alice Kurio",
      username: "alicekurio",
      ensName: "alice.eth",
    }),
    createBaseUser({
      id: "user-2",
      email: "bruno@kurio.com",
      password: "bruno123",
      displayName: "Bruno Pixel",
      username: "brunopixel",
      ensName: "bruno.eth",
    }),
  ];

  return {
    users,
    sessions: [],
    nfts: scenario === "empty_results" ? [] : baseNfts,
    scenario,
    requestTick: 0,
  };
}

function normalizeStoredNfts(
  scenario: MockScenarioName,
  storedNfts: Nft[] | undefined,
) {
  if (scenario === "empty_results") {
    return [];
  }

  if (!Array.isArray(storedNfts)) {
    return baseNfts;
  }

  const byId = new Map(storedNfts.map((nft) => [nft.id, nft]));
  return baseNfts.map((baseNft) => byId.get(baseNft.id) ?? baseNft);
}

function loadStateFromStorage(): MockState {
  if (typeof window === "undefined") {
    return buildInitialState("default");
  }

  const raw = window.localStorage.getItem(MOCK_STATE_STORAGE_KEY);
  if (!raw) {
    return buildInitialState("default");
  }

  try {
    const parsed = JSON.parse(raw) as MockState;
    if (!parsed || !Array.isArray(parsed.users)) {
      return buildInitialState("default");
    }

    const scenario = parsed.scenario ?? "default";
    return {
      ...parsed,
      scenario,
      nfts: normalizeStoredNfts(scenario, parsed.nfts),
    };
  } catch {
    return buildInitialState("default");
  }
}

let inMemoryState: MockState = loadStateFromStorage();

export function readMockState() {
  return inMemoryState;
}

export function writeMockState(nextState: MockState) {
  inMemoryState = nextState;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MOCK_STATE_STORAGE_KEY, JSON.stringify(nextState));
  }
}

export function resetMockState(scenario: MockScenarioName = "default") {
  const fresh = buildInitialState(scenario);
  writeMockState(fresh);
  return fresh;
}

export function updateMockState(mutator: (state: MockState) => MockState) {
  const current = readMockState();
  const next = mutator(current);
  writeMockState(next);
  return next;
}
