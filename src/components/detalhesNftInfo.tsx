import ReletedProducts from "./reletedProducts";

export default function DetalhesNftInfo() {
  return (
    <>
      <div className="mt-3 h-[340.0001220703125px] w-[1200px] max-w-full rounded-[10px] bg-transparent p-4 text-[#F5F1EB] opacity-100">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#D28A4C]/20 pb-2 text-[14px] md:text-[17px]">
          <h3 className="font-bold text-[#F5F1EB]">Detalhes do NFT</h3>
          <span className="text-[#F5F1EB] opacity-90">
            Avaliações de colecionadores (19)
          </span>
        </div>

        <div className="space-y-3 text-[14px] leading-6 text-[#CFB28C]">
          <p>
            Emerald Ape #042 é uma obra digital à 1/50 finalizada à mão da
            coleção Kurio Editions. Cada atributo fica armazenado nos metadados
            do token e verificado na Ethereum. A obra explora identidade,
            movimento e luz em um mundo digital sem fronteiras.
          </p>

          <p>
            A propriedade inclui a arte em alta resolução, lançamentos
            exclusivos para colecionadores e um registro permanente de
            procedência registrada na rede. Nova Sato recebe 5% de direitos
            autorais nas vendas secundárias, apoiando novos trabalhos e
            lançamentos da comunidade.
          </p>

          <p>
            <span className="font-bold text-[#F5F1EB]">Rede:</span> Ethereum com
            procedência imutável e metadados armazenados no IPFS.
          </p>

          <p>
            <span className="font-bold text-[#F5F1EB]">Contrato:</span> Direitos
            autorais do criador: 5% nas vendas secundárias, pagos
            automaticamente pelos mercados compatíveis.
          </p>

          <p>
            <span className="font-bold text-[#F5F1EB]">Direitos autorais:</span>{" "}
            0x7A42...3F1C · Contrato inteligente ERC-721 verificado.
          </p>
        </div>
      </div>

      <ReletedProducts />
    </>
  );
}
