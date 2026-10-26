type FooterFeature = {
  badge: string;
  title: string;
  description: string;
};

const features: FooterFeature[] = [
  {
    badge: "W",
    title: "Segurança da carteira",
    description: "Proteja sua carteira e colecione arte digital verificada com confiança.",
  },
  {
    badge: "C",
    title: "Criadores em destaque",
    description: "Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.",
  },
  {
    badge: "D",
    title: "Alertas de lançamentos",
    description: "Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.",
  },
];

const socialIcons = [
  { label: "Facebook", src: "/icons/Frame 108.png" },
  { label: "Instagram", src: "/icons/Instagram.png" },
  { label: "Twitter", src: "/icons/Twitter.png" },
  { label: "LinkedIn", src: "/icons/Linkedin.png" },
  { label: "YouTube", src: "/icons/Vector.png" },
];

const wallets = ["METAMASK", "WALLETCONNECT", "COINBASE"];

export function Footer() {
  return (
    <footer className="w-full max-w-[1200px] border border-[#D28A4C]/45 bg-[#2C1A15] text-[#F5F1EB]">
      <div className="grid border-b border-[#D28A4C]/35 md:grid-cols-4">
        {features.map((feature) => (
          <article key={feature.title} className="space-y-3 border-r border-[#D28A4C]/35 px-8 py-6">
            <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#D28A4C] text-xl font-bold text-[#140D0A]">
              {feature.badge}
            </span>
            <h3 className="text-[34px] font-bold leading-8">{feature.title}</h3>
            <p className="max-w-[250px] text-[14px] leading-6 text-[#CFB28C]">{feature.description}</p>
          </article>
        ))}

        <div className="space-y-3 px-4 py-6">
          <h3 className="text-[34px] font-bold leading-8">Antecipe-se ao próximo lançamento</h3>
          <div className="flex h-10 w-full overflow-hidden bg-[#3A2417]">
            <input
              type="email"
              placeholder="digite seu e-mail..."
              className="w-full bg-transparent px-3 text-[14px] text-[#CFB28C] placeholder:text-[#9D7B58] focus:outline-none"
            />
            <button type="button" className="w-[92px] bg-[#D28A4C] text-[14px] font-bold text-[#140D0A]">
              Enviar
            </button>
          </div>
          <p className="text-[14px] leading-6 text-[#CFB28C]">
            Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
          </p>
        </div>
      </div>

      <div className="flex min-h-[72px] flex-wrap items-center justify-between gap-4 bg-[#503214] px-8 py-4 text-[14px] leading-6">
        <span className="font-bold tracking-[0.16em]">KURIO</span>
        <span>Feito para colecionadores, criadores e cultura</span>
        <a href="mailto:contato@email.com" className="hover:opacity-80">contato@email.com</a>
        <span>+55 11 4002 8922</span>
      </div>

      <div className="grid gap-8 px-8 py-7 md:grid-cols-4">
        <div>
          <h4 className="text-[34px] font-bold leading-8">Meu perfil</h4>
          <ul className="mt-3 space-y-2 text-[14px] leading-6 text-[#F5F1EB]">
            <li>Meu perfil</li>
            <li>Minha coleção</li>
            <li>Atividade</li>
            <li>Estúdio do criador</li>
            <li>Lista de interesse</li>
          </ul>
        </div>

        <div>
          <h4 className="text-[34px] font-bold leading-8">Central de ajuda</h4>
          <ul className="mt-3 space-y-2 text-[14px] leading-6 text-[#F5F1EB]">
            <li>Central de ajuda</li>
            <li>Como comprar NFTs</li>
            <li>Carteira e segurança</li>
            <li>Política do mercado</li>
            <li>Denunciar item</li>
          </ul>
        </div>

        <div>
          <h4 className="text-[34px] font-bold leading-8">Coleções</h4>
          <ul className="mt-3 space-y-2 text-[14px] leading-6 text-[#F5F1EB]">
            <li>Arte digital</li>
            <li>Fotografia</li>
            <li>Música</li>
            <li>Arte 3D</li>
            <li>Utilidade</li>
          </ul>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-[34px] font-bold leading-8">Redes sociais</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {socialIcons.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D28A4C]"
                >
                  <img src={social.src} alt="" className="h-4 w-4 object-contain" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[34px] font-bold leading-8">Carteiras compatíveis</h4>
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[6px] bg-[#3A2417] px-3 py-2">
              {wallets.map((wallet, index) => (
                <span key={wallet} className="text-[10px] font-semibold text-[#E89B55]">
                  {wallet}
                  {index < wallets.length - 1 ? "  •" : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D28A4C]/35 py-2 text-center text-[14px] leading-[30px]">
        © 2026 Kurio. Propriedade digital para todos.
      </div>
    </footer>
  );
}
