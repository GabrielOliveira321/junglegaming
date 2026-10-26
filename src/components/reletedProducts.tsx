export default function ReletedProducts() {
  const produtos = [
    { nome: "Cosmic Bloom #118", preco: "1.29 ETH", imagem: "/macacos/sage-009-300.webp" },
    { nome: "Violet Nomad #314", preco: "1.39 ETH", imagem: "/macacos/sage-009-300.webp" },
    { nome: "Ivory Baron #088", preco: "1.79 ETH", imagem: "/macacos/neon-552-300.webp" },
    { nome: "Golden Beat #207", preco: "0.99 ETH", imagem: "/macacos/golden-207-300.webp" },
    { nome: "Golden Signal #160", preco: "0.39 ETH", imagem: "/macacos/golden-207-300.webp" },
  ];

  return (
    <section className="flex h-[407.0000915527344px] w-[1200px] max-w-full flex-col gap-8 opacity-100">
      <div className="flex h-[28.000104904174805px] w-full items-center gap-3 opacity-100">
        <h3 className="h-4 w-full text-[17px] font-bold leading-4 text-[#E89B55]">
          Mais dessa coleção
        </h3>
      </div>

      <div className="flex h-[347px] w-full flex-col gap-8 opacity-100">
        <div className="flex h-[303px] w-full justify-between opacity-100">
          {produtos.map((item) => (
            <article
              key={item.nome}
              className="flex h-[303px] w-[219px] flex-col gap-3 opacity-100"
            >
              <div className="flex h-[255px] w-[219px] items-center justify-center bg-[#241612] opacity-100">
                <img
                  src={item.imagem}
                  alt={item.nome}
                  className="h-[243px] w-[190px] rounded-[11px] object-cover"
                />
              </div>

              <div className="flex h-9 w-[154px] flex-col opacity-100">
                <p className="h-5 w-[154px] text-[15px] font-normal leading-[100%] text-[#F5F1EB]">
                  {item.nome}
                </p>
                <p className="h-4 w-[154px] text-[16px] font-bold leading-4 text-[#E89B55]">
                  {item.preco}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#D28A4C]" />
          <span className="h-2 w-2 rounded-full border border-[#D28A4C]" />
          <span className="h-2 w-2 rounded-full border border-[#D28A4C]" />
        </div>
      </div>
    </section>



);
}
