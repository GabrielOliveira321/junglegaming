import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useLocation,
  useNavigate,
  useParams,
  useRouterState,
  useSearch,
} from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useRef } from "react";
import { Header } from "@/components/header";
import { Main } from "@/components/main";
import { PromosCard } from "@/components/promos";
import { CunhasDiary } from "@/components/cunhasDiary";
import { Footer } from "@/components/footer";
import { Login } from "@/components/login";
import { TopHeaderNav } from "@/components/topHeaderNav";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiHealthQuery } from "@/hooks/useApiHealthQuery";
import { getAuthToken } from "@/lib/authToken";
import {
  useFavoritesQuery,
  useNftDetailsQuery,
  useNftListQuery,
  useToggleFavoriteMutation,
} from "@/hooks/useCatalog";
import { useAddCartItemMutation } from "@/hooks/useCart";
const AUTH_REDIRECT_KEY = "kurio-auth-redirect";
const DetalhesNft = lazy(() => import("@/components/detalhesNft"));
const Carrinho = lazy(() => import("@/components/carrinho").then((module) => ({ default: module.Carrinho })));
const Pagamento = lazy(() => import("@/components/pagamento").then((module) => ({ default: module.Pagamento })));
const PerfilColecionador = lazy(() =>
  import("@/components/perfilColecionador").then((module) => ({ default: module.PerfilColecionador })),
);

type ProtectedPath = "/carrinho" | "/pagamento" | "/perfil";

type HomeSearch = {
  q?: string;
  category?: string;
  sort?: "recent" | "price-asc" | "price-desc";
  page?: number;
};

type DetailsSearch = {
  tab?: "sobre" | "atributos" | "historico";
};

function parseText(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function parsePositivePage(value: unknown, fallback = 1) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 1) {
    return Math.floor(value);
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed >= 1) {
      return parsed;
    }
  }

  return fallback;
}

function parseHomeSearch(search: Record<string, unknown>): HomeSearch {
  const sort = parseText(search.sort, "recent");
  const allowedSort: HomeSearch["sort"][] = ["recent", "price-asc", "price-desc"];

  return {
    q: parseText(search.q) || undefined,
    category: parseText(search.category) || undefined,
    sort: allowedSort.includes(sort as HomeSearch["sort"])
      ? (sort as HomeSearch["sort"])
      : "recent",
    page: parsePositivePage(search.page, 1),
  };
}

function parseDetailsSearch(search: Record<string, unknown>): DetailsSearch {
  const tab = parseText(search.tab, "sobre");
  const allowedTabs: DetailsSearch["tab"][] = ["sobre", "atributos", "historico"];

  return {
    tab: allowedTabs.includes(tab as DetailsSearch["tab"])
      ? (tab as DetailsSearch["tab"])
      : "sobre",
  };
}

function isAuthenticated() {
  return Boolean(getAuthToken());
}

function setPostLoginRedirect(path: string) {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(AUTH_REDIRECT_KEY, path);
  }
}

function getPostLoginRedirect(): ProtectedPath | null {
  if (typeof window === "undefined") {
    return null;
  }

  const redirectPath = window.sessionStorage.getItem(AUTH_REDIRECT_KEY);
  window.sessionStorage.removeItem(AUTH_REDIRECT_KEY);

  if (
    redirectPath === "/carrinho" ||
    redirectPath === "/pagamento" ||
    redirectPath === "/perfil"
  ) {
    return redirectPath;
  }

  return null;
}

function guardPrivateRoute(path: string) {
  if (isAuthenticated()) {
    return;
  }

  setPostLoginRedirect(path);
  throw redirect({ to: "/", hash: "login" });
}

function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const isLoginOpen = location.hash === "login";
  const isNotFoundRoute = useRouterState({
    select: (state) =>
      state.matches.some((match) => String(match.routeId) === "__notFound__"),
  });
  const is404Page = location.pathname === "/404" || isNotFoundRoute;
  const isImmersiveMobilePage =
    location.pathname === "/pagamento" ||
    location.pathname === "/carrinho" ||
    location.pathname.startsWith("/nft/");

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (isLoginOpen) {
      const activeElement = document.activeElement;
      previouslyFocusedElement.current = activeElement instanceof HTMLElement ? activeElement : null;
      return;
    }

    previouslyFocusedElement.current?.focus();
    previouslyFocusedElement.current = null;
  }, [isLoginOpen]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col gap-8 px-2 py-6 sm:px-4 max-md:max-w-[414px] max-md:gap-4 max-md:rounded-[40px] max-md:bg-[#140D0A] max-md:px-6 max-md:pb-6 max-md:pt-10">
      <Outlet />
      {!is404Page && (
        <>
          <div className={isImmersiveMobilePage ? "hidden md:block" : ""}>
            <Footer />
          </div>
        </>
      )}

      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
          <Login
            initialMode="entrar"
            onClose={() => navigate({ to: location.pathname, hash: "" })}
            onSuccess={() => {
              const redirectPath = getPostLoginRedirect();
              if (redirectPath) {
                navigate({ to: redirectPath, hash: "" });
                return;
              }

              navigate({ to: location.pathname, hash: "" });
            }}
          />
        </div>
      )}
    </div>
  );
}

function useAppNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    openLogin: () => {
      if (isAuthenticated()) {
        navigate({ to: "/perfil", hash: "" });
        return;
      }

      navigate({ to: location.pathname, hash: "login" });
    },
    toggleCart: () => navigate({ to: location.pathname === "/carrinho" ? "/" : "/carrinho" }),
    openPayment: () => navigate({ to: "/pagamento" }),
    openNftDetails: (nftId: string) =>
      navigate({
        to: "/nft/$nftId",
        params: { nftId },
        search: { tab: "sobre" },
      }),
  };
}

function HomePage() {
  const { openLogin, toggleCart, openNftDetails } = useAppNavigation();
  const healthQuery = useApiHealthQuery();
  const search = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const nftListQuery = useNftListQuery({
    q: search.q,
    category: search.category,
    sort: search.sort ?? "recent",
    page: search.page ?? 1,
    perPage: 9,
  });

  return (
    <>
      <Header onOpenLogin={openLogin} onOpenCart={toggleCart} />
      {healthQuery.data && (
        <p className="w-full max-w-[1200px] text-right text-xs text-[#CFB28C]">
          API ({healthQuery.data.mode}) ativa • {healthQuery.data.service}
        </p>
      )}
      <Main
        nfts={nftListQuery.data?.items ?? []}
        page={nftListQuery.data?.page ?? 1}
        perPage={nftListQuery.data?.perPage ?? 9}
        total={nftListQuery.data?.total ?? 0}
        sort={search.sort ?? "recent"}
        selectedCategory={search.category}
        isLoading={nftListQuery.isLoading}
        isError={nftListQuery.isError}
        onChangeSort={(sort) =>
          navigate({
            search: (previous) => ({
              ...previous,
              sort,
              page: 1,
            }),
          })
        }
        onChangePage={(page) =>
          navigate({
            search: (previous) => ({
              ...previous,
              page,
            }),
          })
        }
        onChangeCategory={(category) =>
          navigate({
            search: (previous) => ({
              ...previous,
              category,
              page: 1,
            }),
          })
        }
        onOpenNftDetails={openNftDetails}
      />
      <PromosCard />
      <CunhasDiary />
    </>
  );
}

function DetailsPage() {
  const { openLogin, toggleCart } = useAppNavigation();
  const { nftId } = useParams({ from: "/nft/$nftId" });
  const nftQuery = useNftDetailsQuery(nftId);
  const favoritesQuery = useFavoritesQuery();
  const toggleFavoriteMutation = useToggleFavoriteMutation();
  const addToCartMutation = useAddCartItemMutation();
  const isFavorite = Boolean(favoritesQuery.data?.nftIds.includes(nftId));

  if (nftQuery.isLoading) {
    return (
      <>
        <div className="hidden md:block">
          <TopHeaderNav onOpenLogin={openLogin} onOpenCart={toggleCart} />
        </div>
        <section aria-busy="true" aria-live="polite" className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 py-6">
          <Skeleton className="h-5 w-52" />
          <div className="flex flex-col gap-8 xl:flex-row">
            <Skeleton className="h-[444px] w-full max-w-[573px] rounded-[8px]" />
            <div className="flex w-full max-w-[595px] flex-col gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-4/5" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-56" />
            </div>
          </div>
        </section>
      </>
    );
  }

  if (nftQuery.isError || !nftQuery.data) {
    return (
      <>
        <div className="hidden md:block">
          <TopHeaderNav onOpenLogin={openLogin} onOpenCart={toggleCart} />
        </div>
        <section className="flex w-full max-w-[1200px] flex-col gap-3 rounded-lg border border-[#3F2319] bg-[#241612] p-8">
          <h1 className="text-[22px] font-bold text-[#F5F1EB]">NFT não encontrado</h1>
          <p className="text-[#CFB28C]">Este item não existe ou não está mais disponível.</p>
        </section>
      </>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <TopHeaderNav onOpenLogin={openLogin} onOpenCart={toggleCart} />
      </div>
      <Suspense fallback={<Skeleton className="h-[560px] w-full rounded-xl" />}>
        <DetalhesNft
          nft={nftQuery.data}
          isFavorite={isFavorite}
          isSubmittingBuy={addToCartMutation.isPending}
          onToggleFavorite={() => {
            if (!isAuthenticated()) {
              openLogin();
              return;
            }
            toggleFavoriteMutation.mutate({ nftId, isFavorite });
          }}
          onBuy={(quantity) => {
            if (!isAuthenticated()) {
              openLogin();
              return;
            }
            addToCartMutation.mutate(
              { nftId, quantity },
              {
                onSuccess: () => toggleCart(),
              },
            );
          }}
        />
      </Suspense>
    </>
  );
}

function CartPage() {
  const { openLogin, toggleCart, openPayment } = useAppNavigation();

  return (
    <Suspense fallback={<Skeleton className="h-[520px] w-full rounded-xl" />}>
      <Carrinho
        onOpenLogin={openLogin}
        onOpenCart={toggleCart}
        onOpenPagamento={openPayment}
      />
    </Suspense>
  );
}

function PaymentPage() {
  const { openLogin, toggleCart } = useAppNavigation();

  return (
    <Suspense fallback={<Skeleton className="h-[520px] w-full rounded-xl" />}>
      <Pagamento onOpenLogin={openLogin} onOpenCart={toggleCart} />
    </Suspense>
  );
}

function LoginPage() {
  return null;
}

function ProfilePage() {
  const { openLogin, toggleCart } = useAppNavigation();

  return (
    <>
      <TopHeaderNav onOpenLogin={openLogin} onOpenCart={toggleCart} />
      <Suspense fallback={<Skeleton className="h-[640px] w-full rounded-xl" />}>
        <PerfilColecionador />
      </Suspense>
    </>
  );
}

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="flex w-full max-w-[1200px] flex-col items-center justify-center gap-4 rounded-lg border border-[#3F2319] bg-[#241612] p-16 text-center text-[#F5F1EB]">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-[#CFB28C]">
        Página não encontrada. Confira o endereço ou volte ao início.
      </p>
      <button
        type="button"
        onClick={() => navigate({ to: "/" })}
        className="rounded-[6px] bg-[#D28A4C] px-4 py-2 font-bold text-[#140D0A]"
      >
        Voltar ao início
      </button>
    </section>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search): HomeSearch => parseHomeSearch(search as Record<string, unknown>),
  component: HomePage,
});

const nftDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nft/$nftId",
  validateSearch: (search): DetailsSearch =>
    parseDetailsSearch(search as Record<string, unknown>),
  component: DetailsPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/carrinho",
  beforeLoad: ({ location }) => {
    guardPrivateRoute(location.pathname);
  },
  component: CartPage,
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pagamento",
  beforeLoad: ({ location }) => {
    guardPrivateRoute(location.pathname);
  },
  component: PaymentPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "login" });
  },
  component: LoginPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/perfil",
  beforeLoad: ({ location }) => {
    guardPrivateRoute(location.pathname);
  },
  component: ProfilePage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/404",
  component: NotFoundPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  nftDetailsRoute,
  cartRoute,
  paymentRoute,
  loginRoute,
  profileRoute,
  notFoundRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
