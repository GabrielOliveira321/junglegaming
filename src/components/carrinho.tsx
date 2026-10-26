import { useState } from "react";
import { AxiosError } from "axios";
import { ArrowLeft, Trash2 } from "lucide-react";
import { TopHeaderNav } from "./topHeaderNav";
import { ColecionadoresTambemViram } from "./colecionadoresTambemViram";
import {
  useCartQuery,
  useQuoteQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/hooks/useCart";
import type { ApiErrorResponse } from "@/contracts/rest";
import { Skeleton } from "@/components/ui/skeleton";

type CarrinhoProps = {
  onOpenLogin?: () => void;
  onOpenCart?: () => void;
  onOpenPagamento?: () => void;
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

export function Carrinho({
  onOpenLogin = () => {},
  onOpenCart = () => {},
  onOpenPagamento = () => {},
}: CarrinhoProps) {
  const [couponCode, setCouponCode] = useState("");
  const [activeCoupon, setActiveCoupon] = useState<string | undefined>(undefined);
  const [couponError, setCouponError] = useState("");

  const cartQuery = useCartQuery();
  const quoteQuery = useQuoteQuery(activeCoupon);
  const updateItemMutation = useUpdateCartItemMutation();
  const removeItemMutation = useRemoveCartItemMutation();

  const cart = cartQuery.data;
  const quote = quoteQuery.data;
  const quoteErrorMessage = quoteQuery.error instanceof AxiosError
    ? ((quoteQuery.error.response?.data as ApiErrorResponse | undefined)?.error?.message ?? "Cupom inválido ou expirado.")
    : "Cupom inválido ou expirado.";

  function changeQuantity(nftId: string, quantity: number) {
    if (!cart) {
      return;
    }
    const item = cart.items.find((entry) => entry.nftId === nftId);
    if (!item || quantity < 1) {
      return;
    }
    if (quantity > item.availableEditions) {
      setCouponError("Quantidade maior que a disponibilidade desta edição.");
      return;
    }
    setCouponError("");
    updateItemMutation.mutate({ nftId, quantity });
  }

  function applyCoupon() {
    if (!couponCode.trim()) {
      setActiveCoupon(undefined);
      setCouponError("");
      return;
    }
    setCouponError("");
    setActiveCoupon(couponCode.trim());
  }

  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 opacity-100 px-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-[414px] flex-col gap-1 rounded-[40px] bg-[#140D0A] pt-8 md:hidden">
        <div className="flex flex-col gap-3 px-7">
          <div className="flex h-[44px] items-center justify-between">
            <button
              type="button"
              aria-label="Voltar"
              onClick={() => window.history.back()}
              className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#3F2319] bg-[#2F1D15] text-[#CFB28C]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-[20px] font-bold leading-4 text-[#F5F1EB]">Carrinho de NFTs</h1>
            <span className="h-[35px] w-[35px]" aria-hidden="true" />
          </div>

          {cartQuery.isLoading && (
            <div aria-busy="true" className="space-y-3">
              <Skeleton className="h-[100px] w-full rounded-[14px]" />
              <Skeleton className="h-[100px] w-full rounded-[14px]" />
            </div>
          )}
          {cartQuery.isError && (
            <p role="status" className="text-[#F0805F]">Falha ao carregar carrinho. Faça login novamente.</p>
          )}
          {!cartQuery.isLoading && !cartQuery.isError && cart?.items.length === 0 && (
            <p className="text-[#CFB28C]">Seu carrinho está vazio.</p>
          )}

          <div className="flex flex-col gap-3">
            {cart?.items.map((item) => (
              <article key={item.nftId} className="flex h-[100px] rounded-[14px] bg-[#241612]">
                <img
                  src={NFT_THUMB_BY_ID[item.nftId] ?? "/macacos/emerald-042-300.webp"}
                  alt={item.name}
                  className="h-[100px] w-[100px] rounded-[14px] object-cover"
                />
                <div className="flex min-w-0 flex-1 items-center justify-between px-2">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold leading-4 text-[#F5F1EB]">{item.name}</p>
                    <p className="mt-1 text-[14px] leading-4 text-[#CFB28C]">Edição: 1/{Math.max(item.availableEditions, item.quantity)}</p>
                    <p className="mt-4 text-[18px] font-bold leading-4 text-[#E89B55]">{formatEth2(item.unitPriceEth)}</p>
                  </div>

                  <div className="flex h-[29px] items-center gap-3">
                    <button
                      type="button"
                      aria-label={`Diminuir quantidade de ${item.name}`}
                      onClick={() => changeQuantity(item.nftId, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2F1D15] text-[#D28A4C]"
                    >
                      -
                    </button>
                    <span className="w-[10px] text-center text-[16px] leading-[22px] text-[#F5F1EB]">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Aumentar quantidade de ${item.name}`}
                      onClick={() => changeQuantity(item.nftId, item.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2F1D15] text-[#D28A4C]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-t-[40px] bg-[#241612] px-6 pb-9 pt-6">
          <div className="rounded-[40px] border border-[#3F2319] bg-[#241612] p-1 shadow-[0_6px_20px_0_rgba(10,6,4,0.45)]">
            <div className="relative h-[50px]">
              <input
                type="text"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="Digite o código promocional..."
                aria-label="Código promocional"
                className="h-[50px] w-full rounded-[40px] bg-transparent pl-4 pr-[110px] text-[15px] text-[#CFB28C] outline-none placeholder:text-[#8D6F4D]"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="absolute right-0 top-0 h-[50px] w-[97px] rounded-[40px] bg-[linear-gradient(93.11deg,rgba(210,138,76,0.54)_-0.94%,#D28A4C_105.02%)] text-[16px] font-bold text-[#F5F1EB]"
              >
                Aplicar
              </button>
            </div>
          </div>

          {(couponError || quoteQuery.isError) && (
            <p role="alert" className="mt-2 text-[12px] text-[#F0805F]">
              {couponError || quoteErrorMessage}
            </p>
          )}

          <div className="mt-4 space-y-3">
            <div className="flex h-5 items-center justify-between">
              <p className="text-[15px] text-[#F5F1EB]">Subtotal</p>
              <p className="text-right text-[18px] text-[#F5F1EB]">{formatEth2(quote?.subtotalEth ?? cart?.subtotalEth ?? 0)}</p>
            </div>
            <div className="flex h-5 items-center justify-between">
              <p className="text-[15px] text-[#F5F1EB]">Desconto do lançamento</p>
              <p className="text-right text-[15px] text-[#F5F1EB]">(-) {formatEth2(quote?.couponDiscountEth ?? 0)}</p>
            </div>
            <div className="flex h-5 items-center justify-between">
              <p className="text-[15px] text-[#F5F1EB]">Taxa de rede</p>
              <p className="text-right text-[18px] text-[#F5F1EB]">{formatEth3(quote?.networkFeeEth ?? cart?.networkFeeEth ?? 0.016)}</p>
            </div>
            <div className="flex h-5 items-center justify-between">
              <p className="text-[16px] font-bold text-[#F5F1EB]">Total</p>
              <p className="text-right text-[35px] font-bold leading-5 text-[#E89B55]">{formatEth3(quote?.totalEth ?? cart?.totalEth ?? 0)}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenPagamento}
            className="mt-7 h-[60px] w-full rounded-[40px] bg-[linear-gradient(93.21deg,#D28A4C_-3.96%,rgba(210,138,76,0.8)_121.97%)] text-[16px] font-bold text-[#140D0A]"
          >
            Conectar e finalizar
          </button>
        </div>
      </div>

      <div className="hidden w-full flex-col gap-3 opacity-100 md:flex">
        <TopHeaderNav onOpenLogin={onOpenLogin} onOpenCart={onOpenCart} />

        <div className="flex w-full flex-wrap items-center gap-[10px] text-[15px] font-bold leading-4 text-[#F5F1EB]">
          <span>Início</span>
          <span>/</span>
          <span>Mercado</span>
          <span>/</span>
          <span>Carrinho</span>
        </div>

        <div className="flex w-full flex-col gap-6 opacity-100 xl:flex-row xl:justify-between">
          <div className="flex w-full min-w-0 flex-col gap-3 opacity-100 xl:max-w-[782px]">
            <div className="hidden h-4 w-full items-center justify-between pr-6 opacity-100 md:flex">
              <span className="text-[15px] font-bold leading-4 text-[#F5F1EB]">NFTs</span>
              <div className="flex h-4 w-[300px] items-center gap-[10px]">
                <span className="h-4 w-[77px] text-[15px] font-bold leading-4 text-[#F5F1EB]">
                  Preço
                </span>
                <span className="h-4 w-[77px] text-[15px] font-bold leading-4 text-[#F5F1EB]">
                  Edições
                </span>
                <span className="h-4 w-[77px] text-[15px] font-bold leading-4 text-[#F5F1EB]">
                  Total
                </span>
              </div>
            </div>

            <div className="h-0 w-full border-b-[0.3px] border-[#D28A4C]" />

            {cartQuery.isLoading && (
              <div aria-busy="true" className="space-y-3">
                <Skeleton className="h-[70px] w-full" />
                <Skeleton className="h-[70px] w-full" />
                <Skeleton className="h-[70px] w-full" />
              </div>
            )}
            {cartQuery.isError && (
              <p role="status" className="text-[#F0805F]">Falha ao carregar carrinho. Faça login novamente.</p>
            )}
            {!cartQuery.isLoading && !cartQuery.isError && cart?.items.length === 0 && (
              <p className="text-[#CFB28C]">Seu carrinho está vazio.</p>
            )}

            <div className="flex w-full flex-col gap-3 opacity-100">
              {cart?.items.map((item) => (
                <article
                  key={item.nftId}
                  className="flex min-h-[70px] w-full items-center justify-between bg-[#241612] pr-4"
                >
                  <div className="flex min-h-[70px] w-full flex-wrap items-center justify-between gap-4">
                    <div className="flex min-h-[70px] min-w-0 flex-1 items-center gap-4">
                      <img
                        src={NFT_THUMB_BY_ID[item.nftId] ?? "/macacos/emerald-042-300.webp"}
                        alt={item.name}
                        className="h-[70px] w-[70px] rounded-[6px] object-cover"
                      />

                      <div className="flex min-w-0 flex-col gap-[6px]">
                        <p className="truncate text-[15px] font-normal leading-[16px] text-[#F5F1EB]">
                          {item.name}
                        </p>
                        <p className="h-4 text-[14px] font-normal leading-4 text-[#9D7B58]">
                          ID do token: {item.nftId}
                        </p>
                      </div>
                    </div>

                    <p className="h-4 w-[77px] text-[16px] font-normal leading-4 text-[#F5F1EB]">
                      {formatEth2(item.unitPriceEth)}
                    </p>

                    <div className="flex h-[30px] w-[95px] items-center gap-3">
                      <button
                        type="button"
                        aria-label={`Diminuir quantidade de ${item.name}`}
                        onClick={() => changeQuantity(item.nftId, item.quantity - 1)}
                        className="h-[30px] w-[20px] rounded-[20px] bg-[#D28A4C] text-[17px] leading-6 text-[#140D0A]"
                      >
                        -
                      </button>

                      <span className="h-6 min-w-[14px] text-center text-[17px] font-normal leading-6 text-[#F5F1EB]">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        aria-label={`Aumentar quantidade de ${item.name}`}
                        onClick={() => changeQuantity(item.nftId, item.quantity + 1)}
                        className="h-[30px] w-[20px] rounded-[20px] bg-[#D28A4C] text-[17px] leading-6 text-[#140D0A]"
                      >
                        +
                      </button>
                    </div>

                    <p className="h-4 w-[77px] text-[16px] font-bold leading-4 text-[#E89B55]">
                      {formatEth2(item.lineTotalEth)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItemMutation.mutate(item.nftId)}
                    aria-label={`Remover ${item.name} do carrinho`}
                    className="flex h-6 w-6 items-center justify-center"
                  >
                    <Trash2 aria-hidden="true" className="h-5 w-5 text-[#D28A4C]" />
                  </button>
                </article>
              ))}
            </div>
          </div>

          <aside className="flex w-full flex-col opacity-100 xl:w-[332px]">
            <div className="flex h-[28px] w-full items-start border-b border-[#3F2319] pb-3">
              <h1 className="h-4 text-[18px] font-bold leading-4 text-[#F5F1EB]">
                Resumo da carteira
              </h1>
            </div>

            <div className="mt-4 flex h-16 w-full flex-col gap-2 opacity-100">
              <h3 className="h-4 text-[14px] font-bold leading-4 text-[#F5F1EB]">
                Código promocional
              </h3>
              <div className="relative h-10 w-full">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="Digite o código promocional..."
                  aria-label="Código promocional"
                  className="h-10 w-full rounded-[3px] border border-[#D28A4C] bg-transparent px-2 text-[14px] text-[#F5F1EB] placeholder:text-[#CFB28C]"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="absolute right-0 top-0 h-10 w-[102px] rounded-r-[3px] bg-[#D28A4C] text-[14px] font-bold text-[#140D0A]"
                >
                  Aplicar
                </button>
              </div>
            </div>

            {(couponError || quoteQuery.isError) && (
              <p role="alert" className="mt-2 text-[12px] text-[#F0805F]">
                {couponError || quoteErrorMessage}
              </p>
            )}

            <div className="mt-5 flex h-28 w-full flex-col gap-3 opacity-100">
              <div className="flex h-5 w-full items-center justify-between">
                <p className="h-5 w-[73px] text-[15px] font-normal leading-[100%] text-[#F5F1EB]">
                  Subtotal
                </p>
                <p className="h-4 w-[98px] text-right text-[18px] font-normal leading-4 text-[#F5F1EB]">
                  {formatEth2(quote?.subtotalEth ?? cart?.subtotalEth ?? 0)}
                </p>
              </div>

              <div className="flex h-5 w-full items-center justify-between">
                <p className="h-5 w-[199px] text-[15px] font-normal leading-[100%] text-[#F5F1EB]">
                  Desconto do lançamento
                </p>
                <p className="h-5 w-[82px] text-right text-[15px] font-normal leading-[100%] text-[#F5F1EB]">
                  (-) {formatEth2(quote?.couponDiscountEth ?? 0)}
                </p>
              </div>

              <div className="flex h-12 w-full flex-col gap-3 opacity-100">
                <div className="flex h-5 w-full items-center justify-between">
                  <p className="h-5 w-[109px] text-[15px] font-normal leading-[100%] text-[#F5F1EB]">
                    Taxa de rede
                  </p>
                  <p className="h-4 w-[98px] text-right text-[18px] font-normal leading-4 text-[#F5F1EB]">
                    {formatEth3(quote?.networkFeeEth ?? cart?.networkFeeEth ?? 0.016)}
                  </p>
                </div>
                <p className="h-4 w-full text-right text-[12px] font-normal leading-4 text-[#E89B55]">
                  taxa estimada
                </p>
              </div>
            </div>

            <div className="mt-6 flex h-4 w-full items-center justify-between opacity-100">
              <p className="h-4 w-[49px] text-[16px] font-bold leading-4 text-[#F5F1EB]">Total</p>
              <p className="h-4 w-[109px] text-right text-[18px] font-bold leading-4 text-[#E89B55]">
                {formatEth3(quote?.totalEth ?? cart?.totalEth ?? 0)}
              </p>
            </div>

            <div className="mt-6 flex h-[72px] w-full flex-col gap-3 opacity-100">
              <button
                type="button"
                onClick={onOpenPagamento}
                className="h-10 w-full rounded-[3px] bg-[#D28A4C] text-[15px] font-bold text-[#140D0A] transition hover:opacity-90"
              >
                Conectar e finalizar
              </button>
              <a
                href="/"
                className="h-5 w-full text-center text-[15px] font-normal leading-[100%] text-[#E89B55]"
              >
                Continuar explorando
              </a>
            </div>
          </aside>
        </div>
      </div>

      <div className="hidden md:block">
        <ColecionadoresTambemViram />
      </div>
    </section>
  );
}
