import type { Nft } from "@/contracts/rest";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";

type NftGridProps = {
    nfts: Nft[];
    page: number;
    perPage: number;
    total: number;
    sort: "recent" | "price-asc" | "price-desc";
    isLoading: boolean;
    isError: boolean;
    onChangeSort: (sort: "recent" | "price-asc" | "price-desc") => void;
    onChangePage: (page: number) => void;
    onOpenNftDetails: (nftId: string) => void;
};

const sortOptions: Array<{ label: string; value: "recent" | "price-asc" | "price-desc" }> = [
    { label: "Listados recentemente", value: "recent" },
    { label: "Menor preço", value: "price-asc" },
    { label: "Maior preço", value: "price-desc" },
];

const formatEth = (value: number) => `${value.toFixed(2)} ETH`;

export function NftGrid({
    nfts,
    page,
    perPage,
    total,
    sort,
    isLoading,
    isError,
    onChangeSort,
    onChangePage,
    onOpenNftDetails,
}: NftGridProps) {
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
          <div className="flex w-full min-w-0 flex-col gap-6 lg:max-w-[842px]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-5 text-[14px] font-medium leading-[16px]">
                    <p className="border-b border-[#E89B55] pb-1 text-[#E89B55]">Todos os NFTs</p>
                      <p className="text-[#CFB28C]">Novos lançamentos</p>
                      <p className="text-[#CFB28C]">Em alta</p>
                  </div>

                <div className="hidden items-center gap-2 text-[15px] leading-none sm:flex">
                      <label htmlFor="nft-sort">Ordenar por:</label>
                    <select
                          id="nft-sort"
                          value={sort}
                          onChange={(event) => onChangeSort(event.target.value as "recent" | "price-asc" | "price-desc")}
                          className="border border-[#3F2319] bg-transparent px-2 py-1 text-[#F5F1EB]"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-[#241612]">
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div aria-busy={isLoading} aria-live="polite" className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-3">
                {isLoading && Array.from({ length: 6 }).map((_, index) => (
                    <div key={`skeleton-${index}`} className="flex w-full flex-col gap-3">
                        <Skeleton className="h-[200px] w-full rounded-[20px]" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-5 w-1/2" />
                    </div>
                ))}
                {isError && <p role="status" className="text-[#F0805F]">Falha ao carregar catálogo. Tente novamente.</p>}
                {!isLoading && !isError && nfts.length === 0 && (
                    <p role="status" className="text-[#CFB28C]">Nenhum NFT encontrado para os filtros atuais.</p>
                )}
                {!isLoading && !isError && nfts.map((nft, index) => (
                    <button
                        key={nft.id}
                        type="button"
                        onClick={() => onOpenNftDetails(nft.id)}
                        className={`flex w-full cursor-pointer flex-col gap-2 text-left ${index % 2 === 1 ? "pt-8 sm:pt-0" : ""}`}
                    >
                        <div className="relative rounded-[20px] bg-[linear-gradient(143.28deg,#241612_-12%,#2F1D15_106.59%)] px-1 pb-3 pt-3">
                            <img
                                src={nft.imageUrl}
                                alt={nft.name}
                                width={168}
                                height={168}
                                loading="lazy"
                                decoding="async"
                                className="h-[168px] w-full rounded-[16px] object-cover"
                            />
                            <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#2A1812] text-[#D28A4C]">
                                <Heart aria-hidden="true" className="h-4 w-4" />
                            </span>
                        </div>

                        <p className="truncate pl-2 text-[16px] font-normal leading-[18px]">
                            {nft.name}
                        </p>

                        <div className="flex items-center gap-2 pl-2">
                            <p className="text-[14px] font-bold leading-4 text-[#E89B55]">
                                {formatEth(nft.priceEth)}
                            </p>
                            {typeof nft.compareAtEth === "number" ? (
                                <p className="text-[14px] leading-[16px] text-[#9D7B58] line-through">
                                    {formatEth(nft.compareAtEth)}
                                </p>
                            ) : null}
                        </div>
                        <span className="pl-2 text-[16px] font-bold leading-4 text-[#E89B55]">detalhes</span>
                    </button>
                ))}
            </div>

            <div className="hidden flex-wrap justify-end gap-2 sm:flex">
                {pages.map((pagina) => (
                    <button
                        key={pagina}
                        type="button"
                        onClick={() => onChangePage(pagina)}
                        className={`flex h-[35px] w-[35px] items-center justify-center rounded-[4px] border border-[#3F2319] transition-colors hover:text-[#E89B55] ${
                            pagina === page ? "text-[#E89B55]" : ""
                        }`}
                    >
                        {pagina}
                    </button>
                ))}
            </div>
        </div>
    );
}