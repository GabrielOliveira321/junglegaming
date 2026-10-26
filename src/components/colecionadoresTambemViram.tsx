const recomendacoes = [
  { nome: "Cosmic Bloom #118", preco: "1.29 ETH", imagem: "/macacos/sage-009-300.webp" },
  { nome: "Violet Nomad #314", preco: "1.39 ETH", imagem: "/macacos/sage-009-300.webp" },
  { nome: "Ivory Baron #088", preco: "1.79 ETH", imagem: "/macacos/neon-552-300.webp" },
  { nome: "Golden Beat #207", preco: "0.99 ETH", imagem: "/macacos/golden-207-300.webp" },
  { nome: "Golden Signal #160", preco: "0.39 ETH", imagem: "/macacos/golden-207-300.webp" },
];

export function ColecionadoresTambemViram() {
  return (
    <section className="flex w-[1200px] max-w-full flex-col gap-5">
      <div className="flex flex-col gap-3">
        <h2 className="text-[22px] font-bold leading-4 text-[#E89B55]">
          Colecionadores também viram
        </h2>
        <div className="h-0 border-b border-[#3F2319]" />
      </div>

      <div className="flex items-start justify-between gap-4">
        {recomendacoes.map((item) => (
          <article
            key={item.nome}
            className="flex w-[219px] flex-col gap-3 bg-[#241612] p-2"
          >
            <img
              src={item.imagem}
              alt={item.nome}
              className="h-[190px] w-full rounded-[11px] object-cover"
            />

            <div className="space-y-2">
              <p className="text-[15px] font-normal leading-4 text-[#F5F1EB]">
                {item.nome}
              </p>
              <p className="text-[22px] font-bold leading-4 text-[#E89B55]">
                {item.preco}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2">
        <span className="h-2 w-2 rounded-full border border-[#E89B55]" />
        <span className="h-2 w-2 rounded-full bg-[#E89B55]" />
        <span className="h-2 w-2 rounded-full border border-[#E89B55]" />
      </div>
    </section>
  );
}
