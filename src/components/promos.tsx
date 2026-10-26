type PromoCard = {
  title: string;
  description: string;
  imageUrl: string;
};

const promoCards: PromoCard[] = [
  {
    title: "Lançamentos gênesis de edição limitada",
    description:
      "Colecione edições escassas diretamente dos criadores antes da revelação pública.",
    imageUrl: "/macacos/emerald-042-900.webp",
  },
  {
    title: "Arte digital selecionada e muito mais",
    description:
      "Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.",
    imageUrl: "/macacos/neon-552-900.webp",
  },
];

export function PromosCard() {
  return (
    <section className="flex h-[250px] w-full max-w-[1200px] justify-between gap-7">
      {promoCards.map((card) => (
        <article
          key={card.title}
          className="relative h-[250px] w-[586px] overflow-hidden rounded-[8px] bg-[#2A1A15]"
        >
          <img
            src={card.imageUrl}
            alt={card.title}
            className="absolute top-0 left-0 h-[250px] w-[287px] object-cover"
          />

          <p className="absolute top-[37px] left-[291px] h-[48px] w-[260px] text-right text-[18px] font-bold leading-6 text-[#F5F1EB]">
            {card.title}
          </p>

          <p className="absolute top-[94px] left-[295px] w-[252px] text-right text-[14px] font-normal leading-6 text-[#CFB28C]">
            {card.description}
          </p>

          <button className="absolute top-[164px] left-[411px] h-[40px] w-[140px] rounded bg-[#D28A4C] text-[#140D0A]">
            Explorar →
          </button>
        </article>
      ))}
    </section>
  );
}
