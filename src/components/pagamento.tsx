import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { TopHeaderNav } from "./topHeaderNav";
import { useCartQuery, useCreateOrderMutation, useQuoteQuery } from "@/hooks/useCart";
import type { ApiErrorResponse, CartItem, OrderResponse } from "@/contracts/rest";
import { getAuthUserId } from "@/lib/authToken";
import { Skeleton } from "@/components/ui/skeleton";

type PagamentoProps = {
  onOpenLogin?: () => void;
  onOpenCart?: () => void;
};

const formatEth2 = (value: number) => `${value.toFixed(2)} ETH`;
const formatEth3 = (value: number) => `${value.toFixed(3)} ETH`;
const NFT_THUMB_BY_ID: Record<string, string> = {
  "nft-emerald-042": "/macacos/emerald-042-300.webp",
  "nft-sage-009": "/macacos/sage-009-300.webp",
  "nft-neon-552": "/macacos/neon-552-300.webp",
  "nft-cosmic-118": "/macacos/sage-009-300.webp",
  "nft-violet-314": "/macacos/sage-009-300.webp",
  "nft-ivory-088": "/macacos/neon-552-300.webp",
  "nft-golden-207": "/macacos/golden-207-300.webp",
  "nft-signal-160": "/macacos/golden-207-300.webp",
  "nft-kurio-014": "/macacos/golden-207-300.webp",
};

type ConfirmacaoPagamentoProps = {
  order: OrderResponse;
  items: CartItem[];
  networkFee: number;
  paidAt: string;
  carteira: string;
  onClose: () => void;
};

function ConfirmacaoPagamento({
  order,
  items,
  networkFee,
  paidAt,
  carteira,
  onClose,
}: ConfirmacaoPagamentoProps) {
  const transactionLabel = `${order.id.slice(0, 8)}...${order.id.slice(-4)}`;
  const firstItemThumb = items[0]
    ? NFT_THUMB_BY_ID[items[0].nftId] ?? "/macacos/emerald-042-300.webp"
    : "/macacos/emerald-042-300.webp";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <section className="relative w-full max-w-[578px] overflow-hidden border border-[#D28A4C]/35 bg-[#2B1914] font-mono">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-[28px] leading-none text-[#CFB28C]"
        >
          ×
        </button>
        <div className="px-6 pb-0 pt-7 sm:px-11">
          <div className="relative mx-auto h-20 w-20">
            <img src="/icons/thank-you 1.png" alt="" className="h-20 w-20 object-contain" />
            <img
              src={firstItemThumb}
              alt=""
              className="absolute -bottom-1 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full border border-[#D28A4C]/70 object-cover"
            />
          </div>
          <h2 className="mt-5 text-center text-[20px] font-bold leading-[28px] text-[#E8D7BF]">
            Seus NFTs agora estão na sua carteira
          </h2>
        </div>

        <div className="mt-5 grid grid-cols-2 border-y border-[#D28A4C]/60 px-6 py-3 text-[13px] text-[#C8A377] sm:grid-cols-4 sm:px-9">
          <div className="border-[#D28A4C]/50 sm:border-r sm:pr-4">
            <p>ID da transação</p>
            <p className="text-[16px] font-bold text-[#E8D7BF]">{transactionLabel}</p>
          </div>
          <div className="border-[#D28A4C]/50 sm:border-r sm:px-4">
            <p>Data</p>
            <p className="text-[16px] font-bold text-[#E8D7BF]">{paidAt}</p>
          </div>
          <div className="mt-3 sm:mt-0 sm:border-r sm:border-[#D28A4C]/50 sm:px-4">
            <p>Total</p>
            <p className="text-[16px] font-bold text-[#E9A860]">{formatEth3(order.totalEth)}</p>
          </div>
          <div className="mt-3 sm:mt-0 sm:pl-4">
            <p>Carteira</p>
            <p className="text-[16px] font-bold text-[#E8D7BF]">{carteira}</p>
          </div>
        </div>

        <div className="px-6 pb-8 pt-5 sm:px-11">
          <h3 className="text-[18px] font-bold leading-6 text-[#F5F1EB]">Detalhes da transação</h3>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_92px_120px] items-center gap-2 border-b border-[#D28A4C]/35 pb-2 text-[14px] font-bold leading-6 text-[#F5F1EB]">
            <span className="min-w-0">NFTs</span>
            <span className="text-center">Edições</span>
            <span className="text-right">Subtotal</span>
          </div>
          <div className="mt-3 space-y-4">
            {items.map((item) => (
              <article key={item.nftId} className="grid grid-cols-[minmax(0,1fr)_92px_120px] items-center gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={NFT_THUMB_BY_ID[item.nftId] ?? "/macacos/emerald-042-300.webp"}
                    alt={item.name}
                    className="h-16 w-16 rounded-[8px] object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-[16px] font-bold leading-6 text-[#F5F1EB]">{item.name}</p>
                    <p className="truncate text-[16px] text-[#B39463]">
                      ID do token: #{item.nftId.replace("nft-", "").split("-").slice(1).join("") || item.nftId}
                    </p>
                  </div>
                </div>
                <p className="text-center text-[16px] leading-6 text-[#CFB28C]">(x {item.quantity})</p>
                <p className="text-right text-[18px] font-bold leading-6 text-[#E89B55]">{formatEth2(item.lineTotalEth)}</p>
              </article>
            ))}
          </div>

          <div className="mt-3 border-t border-[#D28A4C]/35 pt-3 text-[16px] leading-6">
            <div className="flex items-center justify-between text-[#CFB28C]">
              <span>Taxa de rede</span>
              <span>{formatEth3(networkFee)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between font-bold text-[#E89B55]">
              <span className="text-[#F5F1EB]">Total</span>
              <span>{formatEth3(order.totalEth)}</span>
            </div>
          </div>

          <p className="mt-5 text-center text-[16px] leading-8 text-[#CFB28C]">
            Transação confirmada na Ethereum. A propriedade foi transferida para sua carteira conectada e registrada na rede.
          </p>
          <button type="button" className="mx-auto mt-5 block h-12 rounded-[6px] bg-[#D28A4C] px-8 text-[16px] font-bold text-[#140D0A]">
            Ver no Etherscan
          </button>
        </div>
        <div className="h-[8px] w-full bg-[#D28A4C]" />
      </section>
    </div>
  );
}

type ConfirmedPayment = {
  order: OrderResponse;
  items: CartItem[];
  networkFee: number;
  paidAt: string;
};

export function Pagamento({
  onOpenLogin = () => {},
  onOpenCart = () => {},
}: PagamentoProps) {
  const [confirmedPayment, setConfirmedPayment] = useState<ConfirmedPayment | null>(null);
  const [selectedWalletProvider, setSelectedWalletProvider] = useState<"walletconnect" | "metamask" | "coinbase">("coinbase");
  const [couponCode] = useState<string | undefined>(undefined);
  const [paymentError, setPaymentError] = useState("");

  const cartQuery = useCartQuery();
  const quoteQuery = useQuoteQuery(couponCode);
  const createOrderMutation = useCreateOrderMutation();

  const cart = cartQuery.data;
  const quote = quoteQuery.data;

  const quoteVersion = quote?.quoteVersion ?? cart?.cartVersion ?? 1;
  const subtotal = quote?.subtotalEth ?? cart?.subtotalEth ?? 0;
  const total = quote?.totalEth ?? cart?.totalEth ?? 0;
  const networkFee = quote?.networkFeeEth ?? cart?.networkFeeEth ?? 0.016;
  const userId = getAuthUserId() ?? "guest";
  const idempotencyStorageKey = `kurio:payment-idempotency:${userId}:${cart?.cartVersion ?? 0}:${quoteVersion}`;

  const idempotencyKey = useMemo(() => {
    if (typeof window === "undefined") {
      return `payment-${Date.now()}`;
    }

    const existing = window.sessionStorage.getItem(idempotencyStorageKey);
    if (existing) {
      return existing;
    }

    const next = `payment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    window.sessionStorage.setItem(idempotencyStorageKey, next);
    return next;
  }, [idempotencyStorageKey]);

  async function confirmarCompra() {
    if (!cart) {
      return;
    }

    setPaymentError("");

    try {
      const order = await createOrderMutation.mutateAsync({
        cartVersion: cart.cartVersion,
        quoteVersion,
        paymentMethod: "metamask",
        idempotencyKey,
      });

      if (order.status !== "confirmed") {
        setPaymentError("Pagamento recusado na simulação. Revise os dados e tente novamente.");
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(idempotencyStorageKey);
        }
        return;
      }

      const now = new Date();
      const paidAt = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      setConfirmedPayment({
        order,
        items: cart.items.map((item) => ({ ...item })),
        networkFee,
        paidAt,
      });
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(idempotencyStorageKey);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiMessage = (error.response?.data as ApiErrorResponse | undefined)?.error?.message;
        if (apiMessage) {
          setPaymentError(apiMessage);
          return;
        }
      }

      setPaymentError("Não foi possível concluir o pedido. Atualize a cotação e tente novamente.");
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-2 sm:px-0">
      <div className="mx-auto h-[896px] w-full max-w-[414px] rounded-[40px] bg-[#140D0A] pt-8 md:hidden">
        <div className="flex h-[832px] flex-col justify-between px-7 pb-6">
          <div>
            <div className="flex h-[44px] items-center justify-between">
              <button
                type="button"
                aria-label="Voltar"
                onClick={() => window.history.back()}
                className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#3F2319] bg-[#2F1D15] text-[#CFB28C]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h3 className="text-[20px] font-bold leading-4 text-[#F5F1EB]">Pagamento com carteira</h3>
              <span className="h-[35px] w-[35px]" aria-hidden="true" />
            </div>

            <div className="mt-4 flex h-4 items-center justify-between">
              <p className="text-[16px] font-bold leading-4 text-[#F5F1EB]">Carteira conectada</p>
              <button type="button" className="text-[14px] font-bold leading-4 text-[#E89B55]">Trocar carteira</button>
            </div>

            <div className="mt-5 space-y-5">
              <article className="h-[93px] rounded-[14px] bg-[#241612] px-4 py-3 shadow-[0_20px_20px_0_rgba(10,6,4,0.45)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-4 w-4 rounded-full border border-[#E89B55]" />
                    <p className="text-[16px] font-bold leading-5 text-[#F5F1EB]">Reserva</p>
                  </div>
                  <MoreVertical className="h-4 w-4 text-[#B39463]" />
                </div>
                <p className="mt-2 pl-7 text-[14px] leading-4 text-[#CFB28C]">nova.kurio.eth</p>
                <p className="mt-3 pl-7 text-[14px] leading-4 text-[#CFB28C]">Rede Polygon</p>
              </article>

              <article className="h-[93px] rounded-[14px] bg-[#241612] px-4 py-3 shadow-[0_20px_20px_0_rgba(10,6,4,0.45)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-4 w-4 rounded-full border border-[#55321F]" />
                    <p className="text-[16px] font-bold leading-5 text-[#F5F1EB]">Principal</p>
                  </div>
                  <MoreVertical className="h-4 w-4 text-[#B39463]" />
                </div>
                <p className="mt-2 pl-7 text-[14px] leading-4 text-[#CFB28C]">0xA91F...E82C</p>
                <p className="mt-3 pl-7 text-[14px] leading-4 text-[#CFB28C]">Rede principal Ethereum</p>
              </article>
            </div>

            <div className="mt-4">
              <h4 className="text-[16px] font-bold leading-4 text-[#F5F1EB]">Carteira e rede</h4>
              <div className="mt-4 space-y-4">
                {[
                  { key: "walletconnect" as const, icon: "W", label: "WalletConnect" },
                  { key: "metamask" as const, icon: "M", label: "MetaMask" },
                  { key: "coinbase" as const, icon: "C", label: "Coinbase Wallet" },
                ].map((provider) => {
                  const selected = selectedWalletProvider === provider.key;
                  return (
                    <button
                      key={provider.key}
                      type="button"
                      onClick={() => setSelectedWalletProvider(provider.key)}
                      className="flex h-[65px] w-full items-center justify-between rounded-[15px] bg-[#241612] px-4 shadow-[0_0_20px_0_rgba(10,6,4,0.45)]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3F2319] bg-[#2F1D15] text-[14px] font-bold text-[#D28A4C]">
                          {provider.icon}
                        </span>
                        <span className="text-[14px] leading-4 text-[#F5F1EB]">{provider.label}</span>
                      </div>
                      <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${selected ? "border-[#D28A4C]" : "border-[#55321F]"}`}>
                        <span className={`block h-[7px] w-[7px] rounded-full ${selected ? "bg-[#D28A4C]" : "bg-transparent"}`} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex h-4 items-center justify-end gap-7">
              <span className="text-[16px] font-bold leading-4 text-[#F5F1EB]">Total:</span>
              <span className="text-right text-[18px] font-bold leading-4 text-[#E89B55]">{formatEth3(total)}</span>
            </div>
          </div>

          <div>
            {paymentError && <p role="alert" className="mb-3 text-sm text-[#F0805F]">{paymentError}</p>}
            <button
              type="button"
              onClick={confirmarCompra}
              disabled={createOrderMutation.isPending || !cart || cart.items.length === 0}
              className="h-[60px] w-full rounded-[40px] bg-[linear-gradient(93.21deg,#D28A4C_-3.96%,rgba(210,138,76,0.8)_121.97%)] text-center text-[15px] font-bold leading-4 text-[#140D0A] disabled:opacity-50"
            >
              {createOrderMutation.isPending ? "Confirmando..." : "Confirmar compra"}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <TopHeaderNav onOpenLogin={onOpenLogin} onOpenCart={onOpenCart} />
      </div>

      <div className="hidden text-[15px] font-bold leading-4 text-[#F5F1EB] md:block">Início / Mercado / Pagamento</div>

      <div className="hidden w-full flex-col items-start gap-6 xl:flex-row xl:justify-between md:flex">
        <div className="flex w-full flex-col gap-4 xl:max-w-[680px]">
          <h2 className="text-[18px] font-bold text-[#F5F1EB]">Perfil do colecionador</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="sr-only" htmlFor="displayName">Nome de exibição</label>
            <input id="displayName" placeholder="Nome de exibição*" className="h-10 border border-[#3F2319] bg-transparent px-3 text-[13px]" />
            <label className="sr-only" htmlFor="username">Nome de usuário</label>
            <input id="username" placeholder="Nome de usuário*" className="h-10 border border-[#3F2319] bg-transparent px-3 text-[13px]" />
            <label className="sr-only" htmlFor="network">Rede</label>
            <input id="network" placeholder="Rede*" className="h-10 border border-[#3F2319] bg-transparent px-3 text-[13px]" />
            <label className="sr-only" htmlFor="profileName">Nome do perfil</label>
            <input id="profileName" placeholder="Nome do perfil*" className="h-10 border border-[#3F2319] bg-transparent px-3 text-[13px]" />
            <label className="sr-only" htmlFor="walletAddress">Endereço da carteira</label>
            <input id="walletAddress" placeholder="Endereço da carteira*" className="h-10 border border-[#3F2319] bg-transparent px-3 text-[13px]" />
            <label className="sr-only" htmlFor="ensName">Nome ENS</label>
            <input id="ensName" placeholder="Nome ENS*" className="h-10 border border-[#3F2319] bg-transparent px-3 text-[13px]" />
          </div>
        </div>

        <aside className="flex w-full flex-col gap-3 xl:w-[405px]">
          <h3 className="text-[18px] font-bold text-[#F5F1EB]">Seus NFTs</h3>
          {cartQuery.isLoading && (
            <div aria-busy="true" className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}
          {cartQuery.isError && <p className="text-[#F0805F]">Erro ao carregar pedido.</p>}

          <div className="flex flex-col gap-2">
            {cart?.items.map((item) => (
              <article key={item.nftId} className="flex items-center justify-between bg-[#241612] px-2 py-1">
                <div className="flex items-center gap-2">
                  <img
                    src={NFT_THUMB_BY_ID[item.nftId] ?? "/macacos/emerald-042-300.webp"}
                    alt={item.name}
                    className="h-10 w-10 rounded-[4px] object-cover"
                  />
                  <div>
                    <p className="text-[14px] font-bold">{item.name}</p>
                    <p className="text-[12px] text-[#9D7B58]">ID do token: {item.nftId}</p>
                  </div>
                </div>
                <p className="text-[14px] text-[#E89B55]">
                  x {item.quantity} {formatEth2(item.lineTotalEth)}
                </p>
              </article>
            ))}
          </div>

          <div className="space-y-2 text-[15px] text-[#F5F1EB]">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="text-[18px] leading-4">{formatEth2(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Taxa de rede</span>
              <span className="text-[18px] leading-4">{formatEth3(networkFee)}</span>
            </div>
          </div>

          <div className="h-0 border-b border-[#3F2319]" />

          <div className="flex items-center justify-between">
            <span className="text-[16px] font-bold leading-4 text-[#F5F1EB]">Total</span>
            <span className="text-[18px] font-bold leading-4 text-[#E89B55]">{formatEth3(total)}</span>
          </div>

          {paymentError && <p role="alert" className="text-sm text-[#F0805F]">{paymentError}</p>}

          <button
            type="button"
            onClick={confirmarCompra}
            disabled={createOrderMutation.isPending || !cart || cart.items.length === 0}
            className="h-[45px] w-full rounded-[8px] bg-[#D28A4C] px-4 py-3 text-center text-[15px] font-bold leading-4 text-[#140D0A] disabled:opacity-50"
          >
            {createOrderMutation.isPending ? "Confirmando..." : "Confirmar compra"}
          </button>
        </aside>
      </div>

      {confirmedPayment && (
        <ConfirmacaoPagamento
          order={confirmedPayment.order}
          items={confirmedPayment.items}
          networkFee={confirmedPayment.networkFee}
          paidAt={confirmedPayment.paidAt}
          carteira="MetaMask"
          onClose={() => setConfirmedPayment(null)}
        />
      )}
    </section>
  );
}
