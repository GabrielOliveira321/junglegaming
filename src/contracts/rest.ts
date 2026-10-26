export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "SESSION_INVALID"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "TRANSIENT_FAILURE"
  | "IDEMPOTENCY_CONFLICT";

export type ApiErrorResponse = {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, string | number | boolean>;
    retryable?: boolean;
  };
};

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  displayName: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  sessionExpiresAt: string;
  user: SessionUser;
};

export type SessionResponse = {
  authenticated: boolean;
  user: SessionUser | null;
  sessionExpiresAt: string | null;
};

export type Nft = {
  id: string;
  name: string;
  category: "arte-digital" | "fotografia" | "musica" | "colecionaveis";
  imageUrl: string;
  priceEth: number;
  compareAtEth?: number;
  availableEditions: number;
  version: number;
};

export type NftListResponse = {
  items: Nft[];
  page: number;
  perPage: number;
  total: number;
};

export type FavoriteListResponse = {
  nftIds: string[];
};

export type AddFavoriteRequest = {
  nftId: string;
};

export type CartItem = {
  nftId: string;
  name: string;
  quantity: number;
  unitPriceEth: number;
  availableEditions: number;
  lineTotalEth: number;
  version: number;
};

export type CartResponse = {
  items: CartItem[];
  subtotalEth: number;
  discountEth: number;
  networkFeeEth: number;
  totalEth: number;
  cartVersion: number;
};

export type AddCartItemRequest = {
  nftId: string;
  quantity: number;
};

export type UpdateCartItemRequest = {
  quantity: number;
};

export type QuoteRequest = {
  couponCode?: string;
};

export type QuoteResponse = {
  validCoupon: boolean;
  couponCode?: string;
  couponDiscountEth: number;
  subtotalEth: number;
  networkFeeEth: number;
  totalEth: number;
  quoteVersion: number;
};

export type OrderCreateRequest = {
  cartVersion: number;
  quoteVersion: number;
  paymentMethod: "metamask" | "coinbase";
};

export type OrderStatus = "pending" | "confirmed" | "declined";

export type OrderResponse = {
  id: string;
  status: OrderStatus;
  subtotalEth: number;
  networkFeeEth: number;
  totalEth: number;
  receiptUrl: string | null;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
};

export type Profile = {
  displayName: string;
  username: string;
  email: string;
  ensName: string;
  walletNickname: string;
  avatarUrl: string | null;
};

export type UpdateProfileRequest = Partial<Profile>;

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type Wallet = {
  id: string;
  label: string;
  network: "ethereum" | "polygon" | "solana";
  address: string;
  isPrimary: boolean;
};

export type CreateWalletRequest = Omit<Wallet, "id">;
export type UpdateWalletRequest = Partial<Omit<Wallet, "id">>;

export type MockScenarioName =
  | "default"
  | "empty_results"
  | "unstable_network"
  | "network_timeout"
  | "offline_connection"
  | "order_timeout_after_create"
  | "expired_session"
  | "payment_declined";

export type MockScenarioConfig = {
  name: MockScenarioName;
  description: string;
};

export type MockScenarioResponse = {
  active: MockScenarioConfig;
  available: MockScenarioConfig[];
};
