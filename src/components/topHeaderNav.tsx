import { getAuthToken } from "@/lib/authToken";
import { useCartQuery } from "@/hooks/useCart";
import { LogOut, Search, ShoppingCart } from "lucide-react";

type TopHeaderNavProps = {
  onOpenLogin: () => void;
  onOpenCart?: () => void;
};

export function TopHeaderNav({ onOpenLogin, onOpenCart }: TopHeaderNavProps) {
  const authenticated = Boolean(getAuthToken());
  const cartQuery = useCartQuery();
  const cartItemsCount = cartQuery.data?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  return (
    <div className="flex min-h-[45px] w-full flex-wrap items-center justify-between gap-3 border-b-[0.3px] border-[#D28A4C] py-2">
      <div className="flex h-[18px] w-[48px] items-center">
        <h2 className="font-bold text-[14px] leading-none tracking-[0.1em]">KURIO</h2>
      </div>

      <nav className="hidden h-[45px] items-center gap-6 md:flex">
        <a href="/" className="flex h-[45px] w-[58px] items-center font-bold text-[16px] leading-none tracking-normal">
          Início
        </a>
        <a href="/" className="flex h-[45px] w-[58px] items-center font-bold text-[16px] leading-none tracking-normal">
          Mercado
        </a>
        <a href="/" className="flex h-[45px] w-[58px] items-center font-bold text-[16px] leading-none tracking-normal">
          Criadores
        </a>
        <a href="/" className="flex h-[45px] w-[58px] items-center font-bold text-[16px] leading-none tracking-normal">
          Aprenda
        </a>
      </nav>

      <div className="flex h-[35px] items-center gap-3">
        <button type="button" className="flex h-5 w-5 cursor-pointer items-center justify-center">
          <Search aria-hidden="true" className="h-5 w-5" />
          <span className="sr-only">Pesquisar</span>
        </button>
        <button
          type="button"
          onClick={onOpenCart}
          className="relative flex h-6 w-6 cursor-pointer items-center justify-center"
        >
          <ShoppingCart aria-hidden="true" className="h-6 w-6" />
          {cartItemsCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D28A4C] px-1 text-[10px] font-bold leading-none text-[#140D0A]">
              {cartItemsCount}
            </span>
          )}
          <span className="sr-only">Carrinho</span>
        </button>
        <button
          type="button"
          onClick={onOpenLogin}
          className="flex h-[35px] w-[100px] cursor-pointer items-center justify-center rounded-[6px] bg-[#D28A4C] text-[#140D0A]"
        >
          <div className="flex h-[21px] w-[82px] items-center justify-center gap-1">
            <LogOut aria-hidden="true" className="h-4 w-4" />
            {authenticated ? "Perfil" : "Entrar"}
          </div>
        </button>
      </div>
    </div>
  );
}
