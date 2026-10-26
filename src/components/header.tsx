import { TopHeaderNav } from "./topHeaderNav";
import { Search, SlidersHorizontal } from "lucide-react";

type HeaderProps = {
  onOpenLogin: () => void;
  onOpenCart: () => void;
};

export function Header({ onOpenLogin, onOpenCart }: HeaderProps) {
  return (
    <header className="flex w-full max-w-[1200px] flex-col gap-8">
      <div className="hidden md:block">
        <TopHeaderNav onOpenLogin={onOpenLogin} onOpenCart={onOpenCart} />
      </div>

      <div className="flex w-full flex-col gap-4 md:hidden">
        <div className="flex h-[45px] w-full items-center gap-2">
          <label htmlFor="mobile-home-search" className="sr-only">Explorar coleções</label>
          <div className="flex h-[45px] w-full items-center gap-[10px] rounded-[10px] bg-[#2A1812] px-3">
            <Search aria-hidden="true" className="h-[22px] w-[22px] text-[#CFB28C]" />
            <input
              id="mobile-home-search"
              value="Explorar coleções"
              readOnly
              className="w-full bg-transparent text-[20px] font-semibold leading-[20px] text-[#CFB28C] outline-none"
            />
          </div>
          <button
            type="button"
            className="flex h-[45px] w-[45px] items-center justify-center rounded-[14px] bg-[#D28A4C] text-[#140D0A]"
            aria-label="Filtrar coleção"
          >
            <SlidersHorizontal aria-hidden="true" className="h-[22px] w-[22px]" />
          </button>
        </div>

        <div className="rounded-[12px] bg-[linear-gradient(143.28deg,#241612_-12%,#2F1D15_106.59%)] p-4">
          <div className="flex gap-4">
            <div className="flex w-[188px] flex-col gap-[6px]">
              <span className="text-[12px] font-medium leading-4 text-[#F5F1EB]">Bem-vindo à Kurio</span>
              <h1 className="text-[18px] font-bold leading-[29px] text-[#F5F1EB]">SEJA DONO DA CULTURA DIGITAL</h1>
              <p className="text-[12px] font-normal leading-[18px] text-[#CFB28C]">
                Descubra NFTs selecionados de criadores do mundo todo.
              </p>
              <button className="mt-1 w-fit text-[14px] font-bold leading-4 text-[#E89B55]">EXPLORAR</button>
            </div>

            <div className="relative h-[156px] w-[146px]">
              <img
                src="/macacos/emerald-042-300.webp"
                alt="NFT em destaque"
                width={146}
                height={156}
                loading="eager"
                fetchPriority="high"
                className="h-[140px] w-[146px] rounded-[16px] object-cover"
              />
              <img
                src="/macacos/sage-009-300.webp"
                alt=""
                className="absolute bottom-0 left-2 h-[54px] w-[54px] rounded-[12px] border border-[#D28A4C]/50 object-cover"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#D28A4C]" />
            <span className="h-2 w-2 rounded-full bg-[#D28A4C]/70" />
            <span className="h-2 w-2 rounded-full bg-[#D28A4C]/70" />
          </div>
        </div>
      </div>

      <div className="hidden w-full flex-col justify-between gap-6 md:flex lg:h-[450px] lg:flex-row">

        <div className="flex max-w-[600px] flex-col gap-[44px]">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-2">
                <span className="font-medium text-[14px] leading-[16px] tracking-[0.1em]">Bem-vindo à Kurio</span>

                <h1 className="font-bold text-[32px] leading-[44px] tracking-normal sm:text-[43px] sm:leading-[70px]">SEJA DONO DO FUTURO
                  DA ARTE DIGITAL</h1>
              </div>
              <p className="font-normal text-[14px] leading-[24px] tracking-normal text-[#CFB28C]">Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.</p>
            </div>
            <button className="flex items-center w-[140px] h-[40px] py-[10px] pr-[36px] pl-[28px] gap-[10px] rounded-[6px] bg-[#D28A4C] text-[#140D0A] font-bold text-[16px] leading-[20px] tracking-normal">
              EXPLORAR
            </button>
          </div>
        </div>
        <div className="hidden h-[8px] w-[40px] lg:flex">
          {/* Três pontinhos */}
        </div>
        <img
          src="/macacos/emerald-042-900.webp"
          srcSet="/macacos/emerald-042-300.webp 300w, /macacos/emerald-042-900.webp 900w"
          sizes="(max-width: 1024px) 100vw, 450px"
          alt="NFT em destaque"
          width={450}
          height={450}
          loading="eager"
          fetchPriority="high"
          className="h-auto w-full max-w-[450px] rounded-[24px] object-cover"
        />

      </div>
    </header>
  )
}
