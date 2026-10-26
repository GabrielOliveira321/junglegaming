import type { Nft } from "@/contracts/rest";
import { SideBar } from "./sideBar";
import { NftGrid } from "./nftGrid";

type MainProps = {
    nfts: Nft[];
    page: number;
    perPage: number;
    total: number;
    sort: "recent" | "price-asc" | "price-desc";
    selectedCategory?: string;
    isLoading: boolean;
    isError: boolean;
    onChangeSort: (sort: "recent" | "price-asc" | "price-desc") => void;
    onChangePage: (page: number) => void;
    onChangeCategory: (value?: string) => void;
    onOpenNftDetails: (nftId: string) => void;
};

export function Main({
    nfts,
    page,
    perPage,
    total,
    sort,
    selectedCategory,
    isLoading,
    isError,
    onChangeSort,
    onChangePage,
    onChangeCategory,
    onOpenNftDetails,
}: MainProps) {
    return (
        <main className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-8 lg:flex-row lg:gap-12">
            <div className="hidden lg:block">
                <SideBar selectedCategory={selectedCategory} onChangeCategory={onChangeCategory} />
            </div>
            <NftGrid
                nfts={nfts}
                page={page}
                perPage={perPage}
                total={total}
                sort={sort}
                isLoading={isLoading}
                isError={isError}
                onChangeSort={onChangeSort}
                onChangePage={onChangePage}
                onOpenNftDetails={onOpenNftDetails}
            />
        </main>
    );
}