type SideBarProps = {
    selectedCategory?: string;
    onChangeCategory: (value?: string) => void;
};

const categoryOptions = [
    { label: "Arte digital", value: "arte-digital", count: 33 },
    { label: "Fotografia", value: "fotografia", count: 12 },
    { label: "Música", value: "musica", count: 65 },
    { label: "Arte 3D", value: undefined, count: 39 },
    { label: "Colecionáveis", value: "colecionaveis", count: 23 },
    { label: "Generativa", value: undefined, count: 17 },
    { label: "Jogos", value: undefined, count: 19 },
    { label: "Assinaturas", value: undefined, count: 13 },
    { label: "Utilidade", value: undefined, count: 18 },
];

export function SideBar({ selectedCategory, onChangeCategory }: SideBarProps) {
    const coins = [
        { name: "Ethereum", count: 119 },
        { name: "Polygon", count: 78 },
        { name: "Solana", count: 86 },
    ];

    return (
        <aside className="flex w-full shrink-0 flex-col gap-8 lg:w-[310px]">
            {/* Filtros */}
            <div className="flex flex-col gap-8 bg-[#241612] p-5">
                {/* Coleção */}
                <section className="flex flex-col gap-3">
                    <h2 className="text-[18px] font-bold leading-[16px]">
                        Coleção
                    </h2>

                    <div className="flex flex-col px-3">
                        {categoryOptions.map((option) => (
                            <button
                                key={option.label}
                                type="button"
                                onClick={() => {
                                    if (option.value) {
                                        onChangeCategory(selectedCategory === option.value ? undefined : option.value);
                                    }
                                }}
                                className="flex h-[30px] w-full cursor-pointer items-center justify-between text-[13px] text-[#CFB28C] transition-colors hover:text-[#E89B55]"
                            >
                                <span className={option.value && selectedCategory === option.value ? "text-[#E89B55]" : ""}>
                                    {option.label}
                                </span>
                                <span>({option.count})</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Faixa de preço */}
                <section className="flex flex-col gap-3">
                    <h3 className="text-[18px] font-bold leading-[16px]">
                        Faixa de preço
                    </h3>

                    <div className="flex flex-col items-start gap-3 pl-3">
                        <div className="flex h-[30px] w-full items-center pr-2">
                            <div className="relative h-[10px] w-full">
                                <span className="absolute left-0 top-1/2 h-[6px] w-[30px] -translate-y-1/2 rounded-full bg-[#D28A4C]" />
                                <span className="absolute left-[30px] right-[74px] top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-[#D28A4C]" />
                                <span className="absolute right-0 top-1/2 h-[6px] w-[64px] -translate-y-1/2 rounded-full bg-[#D28A4C]" />

                                <span className="absolute left-[20px] top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border-[5px] border-[#140D0A] bg-[#D28A4C]" />
                                <span className="absolute right-[52px] top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border-[5px] border-[#140D0A] bg-[#D28A4C]" />
                            </div>
                        </div>

                        <span className="text-[15px] font-normal leading-[20px]">
                            Preço: 0,02 - 12,30 ETH
                        </span>

                        <button
                            type="button"
                            className="cursor-pointer rounded-[6px] bg-[#D28A4C] px-3 py-2 text-[15px] leading-[20px] text-[#140D0A]"
                        >
                            Aplicar
                        </button>
                    </div>
                </section>

                {/* Rede */}
                <section className="flex flex-col gap-3">
                    <h3 className="text-[18px] font-bold leading-[16px]">
                        Rede
                    </h3>

                    <div className="flex flex-col pl-3">
                        {coins.map((coin) => (
                            <button
                                key={coin.name}
                                type="button"
                                className="flex h-[30px] w-full cursor-pointer items-center justify-between text-left text-[13px] text-[#CFB28C] transition-colors hover:text-[#E89B55]"
                            >
                                <span>{coin.name}</span>
                                <span>({coin.count})</span>
                            </button>
                        ))}
                    </div>
                </section>
            </div>

            {/* NFT em destaque */}
            <section className="flex min-h-[470px] flex-col gap-4 bg-[linear-gradient(180deg,rgba(210,138,76,0.1)_0%,rgba(210,138,76,0.03)_100%)] pt-6 pb-1">
                <div className="flex flex-col gap-4 px-5">
                    <h2 className="text-[24px] font-bold leading-[32px] text-[#E89B55]">
                        NFT EM DESTAQUE
                    </h2>

                    <p className="text-center text-[22px] font-bold leading-[24px] text-[#F5F1EB]">
                        OFERTA LIMITADA
                    </p>
                </div>

                <div className="mt-2 px-3">
                    <img
                        src="/macacos/sage-009-900.webp"
                        alt="Sage Nomad #009 em destaque"
                        className="h-[260px] w-full rounded-[10px] object-cover"
                    />
                </div>
            </section>
        </aside>
    );
}