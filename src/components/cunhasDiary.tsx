type DiaryItem = {
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  imageUrl: string;
};

const diaryItems: DiaryItem[] = [
  {
    date: "12 de setembro",
    readTime: "Leitura de 6 min",
    title: "Como funciona a propriedade de NFTs",
    excerpt: "Aprenda a colecionar, negociar e verificar ativos digitais.",
    imageUrl: "/macacos/neon-552-900.webp",
  },
  {
    date: "13 de setembro",
    readTime: "Leitura de 2 min",
    title: "10 artistas digitais para acompanhar",
    excerpt: "Conheça criadores que moldam a cultura digital.",
    imageUrl: "/macacos/emerald-042-900.webp",
  },
  {
    date: "15 de setembro",
    readTime: "Leitura de 3 min",
    title: "Raridade, atributos e procedência",
    excerpt: "Entenda raridade, procedência, direitos autorais e utilidade.",
    imageUrl: "/macacos/sage-009-900.webp",
  },
  {
    date: "15 de setembro",
    readTime: "Leitura de 2 min",
    title: "Como proteger sua carteira",
    excerpt: "Proteja sua carteira, seus ativos e sua identidade.",
    imageUrl: "/macacos/golden-207-900.webp",
  },
];

export function CunhasDiary() {
  return (
    <section className="flex w-full max-w-[1200px] flex-col gap-10">
      <div className="flex w-full flex-col gap-3">
        <h2 className="text-center font-['Roboto_Mono'] text-[28px] font-bold text-[#F5F1EB]">
          Diário da Cunhagem
        </h2>
        <p className="text-center font-['Roboto_Mono'] text-[14px] font-normal text-[#CFB28C]">
          Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
        </p>
      </div>

      <div className="flex w-full flex-wrap justify-between gap-y-6">
        {diaryItems.map((item) => (
          <article key={item.title} className="w-[268px] overflow-hidden rounded-[8px] bg-[#241612]">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-[195px] w-[268px] object-cover"
            />

            <div className="flex min-h-[174px] flex-col gap-2 px-4 pt-3 pb-4">
              <p className="text-[12px] font-medium leading-4 text-[#CFB28C]">
                {item.date} | {item.readTime}
              </p>

              <h3 className="text-[16px] font-bold leading-tight text-[#F5F1EB]">
                {item.title}
              </h3>

              <p className="text-[12px] font-medium leading-4 text-[#CFB28C]">
                {item.excerpt}
              </p>

              <button type="button" className="mt-auto w-fit text-[12px] font-bold leading-[14px] text-[#E89B55]">
                Ler mais →
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
