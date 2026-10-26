import { useState } from "react";
import { ArrowLeft, Heart, Mail, Search, ShoppingCart, Star } from "lucide-react";
import DetalhesNftInfo from "./detalhesNftInfo";
import type { Nft } from "@/contracts/rest";

const nft = {
  nome: "Kurio Edition #014",
  preco: 2.49,
  descricao:
    "Um colecionável digital finalizado à mão da coleção Kurio Editions, verificado na Ethereum, com arte desbloqueável e acesso exclusivo para colecionadores.",
};

type DetalhesNftProps = {
  nft?: Nft;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onBuy?: (quantity: number) => void;
  isSubmittingBuy?: boolean;
};

export default function DetalhesNft({
  nft: nftFromApi,
  isFavorite = false,
  onToggleFavorite,
  onBuy,
  isSubmittingBuy = false,
}: DetalhesNftProps) {
  const [quantidade, setQuantidade] = useState(1);
  const fallbackNft: Nft = {
    id: "fallback",
    name: nft.nome,
    category: "arte-digital",
    imageUrl: "/macacos/emerald-042-900.webp",
    priceEth: nft.preco,
    availableEditions: 1,
    version: 1,
  };
  const nftData: Nft = {
    ...fallbackNft,
    ...nftFromApi,
    imageUrl: nftFromApi?.imageUrl || fallbackNft.imageUrl,
  };
  const detailImageUrl = nftData.imageUrl.includes("-300.webp")
    ? nftData.imageUrl.replace("-300.webp", "-900.webp")
    : nftData.imageUrl;
  const tokenSuffix = (nftData.name.match(/#(\d+)/)?.[1] ?? "000").padStart(4, "0");
  const collectionName = "Kurio Apes";
  const thumbnailImages = [
    detailImageUrl,
    "/macacos/emerald-042-900.webp",
    "/macacos/sage-009-900.webp",
    "/macacos/neon-552-900.webp",
  ];
  const formatEth = (value: number) => `${value.toFixed(2)} ETH`;
  const nftDescription = nft.descricao;

  return (
    <div className="w-full bg-[#140D0A]">
      <div className="mx-auto w-full max-w-[1200px] text-[#F5F1EB]">
        <section className="mx-auto block w-full max-w-[414px] overflow-hidden rounded-[40px] bg-[#140D0A] md:hidden">
          <div className="h-[506px] w-full bg-[linear-gradient(143.28deg,#241612_-12%,#2F1D15_106.59%)] px-6 pb-6 pt-6">
            <div className="mx-auto flex w-full max-w-[361px] flex-col gap-2">
              <div className="flex h-[35px] items-center justify-between">
                <button
                  type="button"
                  aria-label="Voltar"
                  onClick={() => window.history.back()}
                  className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#3F2319] bg-[#2F1D15] text-[#CFB28C]"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Favoritar"
                  onClick={onToggleFavorite}
                  className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#3F2319] bg-[#2F1D15]"
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? "fill-[#D28A4C] text-[#D28A4C]" : "text-[#D28A4C]"}`} />
                </button>
              </div>
              <img
                src={detailImageUrl}
                alt={`NFT ${nftData.name}`}
                width={361}
                height={356}
                loading="eager"
                fetchPriority="high"
                className="h-[356px] w-full rounded-[24px] object-cover"
              />
            </div>
          </div>

          <div className="rounded-t-[31px] bg-[#140D0A] px-6 pb-6 pt-8">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-[20px] font-bold leading-4 text-[#F5F1EB]">{nftData.name}</h1>
              <span className="inline-flex h-[27px] items-center gap-1 rounded-[32px] border border-[#D28A4C] px-2.5 text-[14px] text-[#E89B55]">
                <Star className="h-3 w-3 fill-current" />
                4.8(19)
              </span>
            </div>

            <p className="mt-4 text-[14px] leading-6 text-[#CFB28C]">{nftDescription}</p>

            <div className="mt-4 flex w-[232px] flex-col gap-2">
              <span className="text-[15px] font-bold leading-4 text-[#F5F1EB]">Edição:</span>
              <div className="flex flex-wrap gap-3 text-[14px] leading-4">
                <span className="text-[#CFB28C]">1/10</span>
                <span className="text-[#CFB28C]">1/10</span>
                <span className="font-medium text-[#E89B55]">1/50</span>
                <span className="text-[#CFB28C]">ABERTA</span>
              </div>
            </div>

            <div id="atributos" className="mt-4 flex w-[307px] flex-col gap-3 text-[14px] leading-5 text-[#B39463]">
              <p>ID do token: #{tokenSuffix}</p>
              <p>Coleção: {collectionName}</p>
              <p>Atributos: Óculos, Esmeralda, Raro</p>
            </div>
          </div>

          <div className="rounded-t-[40px] bg-[#241612] px-6 pb-9 pt-5">
            <div className="flex h-[30px] items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-medium leading-4 text-[#CFB28C]">Qtd.</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Diminuir quantidade"
                    onClick={() => setQuantidade((valor) => Math.max(1, valor - 1))}
                    className="flex h-[30px] w-[20px] items-center justify-center rounded-[20px] border border-[#140D0A] bg-[#D28A4C] text-[18px] font-medium text-[#140D0A] shadow-[0_4px_12px_-2px_rgba(20,13,10,0.15)]"
                  >
                    -
                  </button>
                  <span aria-live="polite" className="min-w-[11px] text-center text-[18px] font-medium leading-[25px] text-[#F5F1EB]">
                    {quantidade}
                  </span>
                  <button
                    type="button"
                    aria-label="Aumentar quantidade"
                    onClick={() => setQuantidade((valor) => valor + 1)}
                    className="flex h-[30px] w-[20px] items-center justify-center rounded-[20px] border border-[#140D0A] bg-[#D28A4C] text-[18px] font-medium text-[#140D0A] shadow-[0_4px_12px_-2px_rgba(20,13,10,0.15)]"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-right text-[20px] font-bold leading-4 text-[#E89B55]">{formatEth(nftData.priceEth)}</p>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => onBuy?.(quantidade)}
                disabled={isSubmittingBuy || quantidade > nftData.availableEditions}
                className="h-[60px] w-[268px] rounded-[40px] bg-[linear-gradient(93.21deg,#D28A4C_-3.96%,rgba(210,138,76,0.8)_121.97%)] px-6 text-[16px] font-bold text-[#140D0A]"
              >
                {isSubmittingBuy ? "Enviando..." : "Comprar NFT"}
              </button>
              <button
                type="button"
                onClick={() => onBuy?.(quantidade)}
                disabled={isSubmittingBuy || quantidade > nftData.availableEditions}
                aria-label="Adicionar ao carrinho"
                className="flex h-[60px] w-[60px] items-center justify-center rounded-[40px] border border-[#3F2319] bg-[#2F1D15] text-[#D28A4C]"
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        <div className="hidden w-full flex-col gap-5 px-4 py-6 md:flex">
          <nav className="flex items-center gap-2 text-sm text-[#F5F1EB]/80">
            <span>Início</span>
            <span>/</span>
            <span className="text-[#D28A4C]">Mercado</span>
          </nav>

          <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
            <div className="flex w-full max-w-[590px] gap-5">
              <div className="hidden w-[84px] flex-col gap-3 md:flex">
                {thumbnailImages.map((thumb, index) => (
                  <img
                    key={`${thumb}-${index}`}
                    src={thumb}
                    alt={`Miniatura ${index + 1} de ${nftData.name}`}
                    className="h-[84px] w-[84px] rounded-[8px] border border-[#D28A4C]/35 object-cover"
                  />
                ))}
              </div>

              <div className="relative flex h-[444px] w-full items-center justify-center rounded-[6px] border border-[#D28A4C]/20 bg-[radial-gradient(circle_at_top,_#3d251d,_#241612_58%)] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
                <img
                  src={detailImageUrl}
                  alt={`NFT ${nftData.name}`}
                  width={540}
                  height={444}
                  loading="eager"
                  fetchPriority="high"
                  className="h-full w-full rounded-[8px] border border-[#D28A4C]/25 object-cover"
                />
                <button
                  type="button"
                  aria-label="Ampliar imagem do NFT"
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#241612]/70 text-[#F5F1EB]"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex w-full max-w-[595px] flex-col gap-5">
              <h1 className="text-3xl font-bold leading-none text-[#F5F1EB] md:text-[42px]">
                {nftData.name}
              </h1>

              <div className="flex items-center justify-between gap-3 border-b border-[#D28A4C]/20 pb-4">
                <span className="text-[35px] font-bold text-[#E89B55]">{formatEth(nftData.priceEth)}</span>
                <div className="flex items-center gap-1 text-[#E89B55]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" />
                  ))}
                  <span className="ml-1 text-[14px] text-[#CFB28C]">19 avaliações de colecionadores</span>
                </div>
              </div>

              <section className="flex flex-col gap-3">
                <h2 className="text-base font-bold text-[#F5F1EB]">Sobre este NFT:</h2>
                <p className="text-[14px] leading-8 text-[#CFB28C]">{nftDescription}</p>
              </section>

              <div className="flex flex-col gap-3">
                <h3 className="text-[30px] font-bold leading-8 text-[#F5F1EB]">Edição:</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#D28A4C]/45 px-2.5 py-1 text-[14px] text-[#CFB28C]">1/1</span>
                  <span className="rounded-full border border-[#D28A4C]/45 px-2.5 py-1 text-[14px] text-[#CFB28C]">1/10</span>
                  <span className="rounded-full border border-[#D28A4C] px-2.5 py-1 text-[14px] font-bold text-[#E89B55]">1/50</span>
                  <span className="rounded-full border border-[#D28A4C]/45 px-2.5 py-1 text-[14px] text-[#CFB28C]">ABERTA</span>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    aria-label="Diminuir quantidade"
                    onClick={() => setQuantidade((valor) => Math.max(1, valor - 1))}
                    className="flex h-[38px] w-[38px] items-center justify-center rounded-[50%] border border-[#D28A4C] bg-[#D28A4C] text-2xl font-medium text-[#1B120F] transition hover:opacity-90"
                  >
                    -
                  </button>

                  <span
                    aria-live="polite"
                    className="min-w-[18px] text-center text-[28px] font-medium text-[#F5F1EB]"
                  >
                    {quantidade}
                  </span>

                  <button
                    type="button"
                    aria-label="Aumentar quantidade"
                    onClick={() => setQuantidade((valor) => valor + 1)}
                    className="flex h-[38px] w-[38px] items-center justify-center rounded-[50%] border border-[#D28A4C] bg-[#D28A4C] text-2xl font-medium text-[#1B120F] transition hover:opacity-90"
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onBuy?.(quantidade)}
                    disabled={isSubmittingBuy || quantidade > nftData.availableEditions}
                    className="flex h-[40px] w-[140px] items-center justify-center rounded-[6px] border border-[#D28A4C] bg-[#D28A4C] px-5 text-sm font-semibold text-[#1B120F] transition hover:opacity-90"
                  >
                    {isSubmittingBuy ? "Enviando..." : "COMPRAR"}
                  </button>

                  <button
                    type="button"
                    onClick={onToggleFavorite}
                    className="flex h-[40px] w-[140px] items-center justify-center gap-2 rounded-[6px] border border-[#D28A4C] bg-transparent px-5 text-sm font-semibold text-[#D28A4C] transition hover:bg-[#D28A4C]/10"
                  >
                    <span aria-hidden="true">♡</span>
                    {isFavorite ? "Favoritado" : "Favoritar"}
                  </button>
                </div>
              </div>

              <div id="atributos" className="flex w-[308px] flex-col gap-1 pt-2 text-[14px] leading-5 text-[#B39463]">
                <p className="h-5 w-[308px]">ID do token: #{tokenSuffix}</p>
                <p className="h-5 w-[308px]">Coleção: {collectionName}</p>
                <p className="h-5 w-[308px]">Atributos: Óculos, Esmeralda, Raro</p>
              </div>

              <div className="flex h-4 w-[199px] items-center gap-2 text-[14px] font-bold leading-4">
                <span>Compartilhar este NFT:</span>
                <a href="#" aria-label="Compartilhar por e-mail" className="text-[#F5F1EB] hover:text-[#D28A4C]">
                  <Mail className="h-4 w-4" />
                </a>
                <a href="#" aria-label="Compartilhar no Twitter" className="text-[#F5F1EB] hover:text-[#D28A4C]">
                  <img src="/icons/Twitter.png" alt="" className="h-4 w-4 object-contain" />
                </a>
              </div>
            </div>
          </div>

          <DetalhesNftInfo />
        </div>
      </div>
    </div>
  );
}
