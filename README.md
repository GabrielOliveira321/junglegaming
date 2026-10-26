# Jungle Gaming Frontend

Projeto React + TypeScript para o challenge Jungle Gaming.

## Stack (passo 2)

- Interface: React
- Linguagem: TypeScript
- Roteamento: TanStack Router
- Estado remoto: TanStack Query
- Cliente HTTP: Axios
- Tempo real: Socket.IO client (base inicial)
- Estilização: Tailwind CSS
- Componentes: shadcn/ui (base instalada)
- Mocking: MSW (ativo com cenários e estado persistente)
- Testes E2E: Playwright (base instalada; cenários completos no próximo passo)

## Estrutura já configurada

- Router: [`src/routes/rootRouter.tsx`](./src/routes/rootRouter.tsx)
  - rotas públicas e privadas
  - not found + `/404`
  - login em modal com redirecionamento pós-auth
- Query Client: [`src/lib/queryClient.ts`](./src/lib/queryClient.ts)
- Axios client: [`src/lib/httpClient.ts`](./src/lib/httpClient.ts)
- Socket client (lazy): [`src/lib/socketClient.ts`](./src/lib/socketClient.ts)
- Providers: [`src/providers/appProviders.tsx`](./src/providers/appProviders.tsx)
- Contratos REST: [`src/contracts/rest.ts`](./src/contracts/rest.ts)
- MSW:
  - handlers: [`src/mocks/handlers.ts`](./src/mocks/handlers.ts)
  - estado e fixtures: [`src/mocks/state.ts`](./src/mocks/state.ts)
  - bootstrap: [`src/mocks/enableMocking.ts`](./src/mocks/enableMocking.ts)
- Exemplo REST + Query em uso:
  - serviço: [`src/services/systemApi.ts`](./src/services/systemApi.ts)
  - hook: [`src/hooks/useApiHealthQuery.ts`](./src/hooks/useApiHealthQuery.ts)

## Contratos e endpoints mockados (MSW)

- Sessão/conta
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/session`
  - `POST /api/auth/logout`
- NFTs
  - `GET /api/nfts` (busca/filtro/ordenação/paginação)
  - `GET /api/nfts/:nftId`
- Favoritos
  - `GET /api/favorites`
  - `POST /api/favorites`
  - `DELETE /api/favorites/:nftId`
- Carrinho
  - `GET /api/cart`
  - `POST /api/cart/items`
  - `PATCH /api/cart/items/:nftId`
  - `DELETE /api/cart/items/:nftId`
- Cotação e pedidos
  - `POST /api/quote`
  - `POST /api/orders` (com idempotency key)
  - `GET /api/orders/:orderId`
- Perfil e carteiras
  - `GET /api/profile`
  - `PATCH /api/profile`
  - `POST /api/profile/password`
  - `GET /api/wallets`
  - `POST /api/wallets`
  - `PATCH /api/wallets/:walletId`
- Cenários de mocks
  - `GET /api/mocks/scenario`
  - `POST /api/mocks/scenario`
  - `POST /api/mocks/reset`

## Cenários determinísticos disponíveis

- `default`
- `empty_results`
- `unstable_network`
- `network_timeout`
- `offline_connection`
- `order_timeout_after_create`
- `expired_session`
- `payment_declined`

> O estado dos mocks fica persistido no `localStorage` para manter consistência após refresh.  
> Para resetar tudo para um cenário conhecido, use `POST /api/mocks/reset`.

## Tempo real em mocks (Socket.IO)

- O cliente usa `socket.io-client` em [`src/lib/socketClient.ts`](./src/lib/socketClient.ts).
- Em ambiente mock, os eventos são interceptados com MSW WebSocket + binding Socket.IO em:
  - [`src/mocks/socketHandlers.ts`](./src/mocks/socketHandlers.ts)
  - [`src/mocks/browser.ts`](./src/mocks/browser.ts)
- Eventos emitidos no mock:
  - `order.updated` (mudanças de carrinho e criação de pedido)
  - `nft.updated` (mudança de preço/estoque/versão após pedido confirmado)
- Sincronização de cache no frontend:
  - [`src/providers/appProviders.tsx`](./src/providers/appProviders.tsx) escuta os eventos e invalida queries de `cart`, `quote` e `nfts`.
  - reconciliação após conexão/reconexão invalida recursos ativos via REST.
  - eventos carregam `eventId`, `resourceType`, `resourceId` e `version`.
  - o cliente ignora duplicatas/eventos antigos e filtra `order.updated` por `userId` autenticado.

### Limitações no ambiente de mock

- O binding `@mswjs/socket.io-binding` cobre o protocolo de eventos, mas não busca paridade total com recursos avançados de Socket.IO (ex.: rooms/namespaces complexos).
- O objetivo no mock é reproduzir fluxos de atualização em tempo real no cliente, mantendo comportamento determinístico para desenvolvimento e demonstração.

## Ajustes de interface e acessibilidade (passo 8)

- Responsividade aplicada nas telas principais para 390/768/1440:
  - catálogo/filtros: [`src/components/main.tsx`](./src/components/main.tsx), [`src/components/nftGrid.tsx`](./src/components/nftGrid.tsx), [`src/components/sideBar.tsx`](./src/components/sideBar.tsx)
  - carrinho: [`src/components/carrinho.tsx`](./src/components/carrinho.tsx)
  - checkout: [`src/components/pagamento.tsx`](./src/components/pagamento.tsx)
- Skeletons com shimmer e respeito a `prefers-reduced-motion`:
  - estilos globais: [`src/index.css`](./src/index.css)
  - componente base: [`src/components/ui/skeleton.tsx`](./src/components/ui/skeleton.tsx)
  - aplicado em catálogo, detalhe e resumo/corpo do carrinho.
- Feedback acessível:
  - mensagens de erro com `role="alert"` em cupom e pagamento.
  - região `aria-live` para mudanças em tempo real no provider.
- Controle de foco em modal de login:
  - trap de `Tab`/`Shift+Tab`, fechamento com `Esc` e restauração de foco ao fechar em:
    - [`src/components/login.tsx`](./src/components/login.tsx)
    - [`src/routes/rootRouter.tsx`](./src/routes/rootRouter.tsx)
- Foco visível global e semântica melhorada de navegação em:
  - [`src/index.css`](./src/index.css)
  - [`src/components/topHeaderNav.tsx`](./src/components/topHeaderNav.tsx)
- Asset de detalhe atualizado para usar imagem real do NFT em vez de bloco decorativo:
  - [`src/components/detalhesNft.tsx`](./src/components/detalhesNft.tsx)

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run audit:lighthouse
npm run test:e2e
npm run test:e2e:update-snapshots
npm run test:e2e:report
```

## Política de cache, retries e sincronização

- Query client global: [`src/lib/queryClient.ts`](./src/lib/queryClient.ts)
  - `staleTime`: `60s`
  - `gcTime`: `5min`
  - `queries.retry`: `1`
  - `mutations.retry`: `0`
  - `refetchOnWindowFocus`: `false`
- Isolamento por usuário:
  - chaves sensíveis usam escopo de usuário via token (`getAuthScopeKey`):
    - favoritos: `["favorites", userScope]`
    - carrinho: `["cart", userScope]`
    - cotação: `["quote", userScope, coupon]`
    - sessão: `["auth","session", userScope]`
- Isolamento por parâmetros:
  - catálogo: `["nfts","list", params]` (busca/filtro/ordenação/página)
  - detalhe: `["nfts","details", nftId]`
- Cancelamento/descarte de respostas obsoletas:
  - queries propagam `AbortSignal` para Axios (`signal`) em catálogo, detalhe, carrinho, cotação e favoritos.
- Invalidação pós-mutation:
  - favoritos: invalida `["favorites", userScope]`
  - carrinho/quote/pedido: invalida `["cart", userScope]` e `["quote", userScope]`
- Atualização otimista com rollback:
  - favoritos usam `onMutate` para atualizar cache imediatamente e `onError` para rollback do estado anterior.
- Recuperação de falhas sem duplicar operação:
  - mutations sem retry automático (evita duplicidade em escrita);
  - criação de pedido usa `idempotency-key` no endpoint `/api/orders`.

## Próximos passos do challenge

1. Ligar telas atuais aos serviços tipados por domínio (substituir estado local estático)
2. TanStack Query em todas as consultas/mutations com invalidação e otimista
3. Socket.IO em tempo real para `nft.updated` e `order.updated`
4. Playwright E2E completo com regressão visual
5. Lighthouse com relatórios versionados

## Playwright E2E (passo 9)

- Configuração em [`playwright.config.ts`](./playwright.config.ts):
  - projetos `chromium-desktop` (1440) e `chromium-mobile` (390);
  - `reporter: html`, traces em retry e vídeo/screenshot em falhas;
  - `webServer` com Vite para execução local dos mocks.
- Suíte principal em [`tests/challenge.e2e.spec.ts`](./tests/challenge.e2e.spec.ts).
- Cada teste parte de estado isolado usando reset de cenário e limpeza de storage em [`tests/helpers.ts`](./tests/helpers.ts).
- Baselines visuais versionadas em [`tests/challenge.e2e.spec.ts-snapshots/`](./tests/challenge.e2e.spec.ts-snapshots).
- Relatório HTML em `playwright-report/` e traces em `test-results/`.

### Cobertura implementada

- Busca/filtros/ordenação e histórico.
- Acesso ao detalhe e recurso inexistente.
- Cadastro/login/expiração de sessão/troca de usuário.
- Favoritos com falha de mutation sem quebrar interface.
- Carrinho (quantidade, remoção, cupom, persistência).
- Compra completa, pagamento recusado, timeout com idempotência (desktop) e recuperação.
- Realtime com atualização de carrinho via evento.
- Navegação por teclado e foco de diálogo.
- Skeleton + erro de rede + recuperação.
- Perfil/carteiras: edição de perfil, troca de senha (sucesso e erro), logout/login com nova senha e cadastro de carteira.
- Regressão visual: início, detalhe, carrinho e pagamento (desktop) e início/detalhe (mobile).

### Pendências marcadas como `fixme`

- Cenário avançado de eventos duplicados/antigos e retomada pendente com injeção controlada de eventos.

## Lighthouse (passo 10)

- Script de auditoria automatizada: [`scripts/run-lighthouse-audit.mjs`](./scripts/run-lighthouse-audit.mjs)
- Configurações versionadas:
  - mobile: [`lighthouse/config.mobile.json`](./lighthouse/config.mobile.json)
  - desktop: [`lighthouse/config.desktop.json`](./lighthouse/config.desktop.json)
- Relatórios gerados:
  - HTML/JSON por execução em [`reports/lighthouse/`](./reports/lighthouse/)
  - consolidação (medianas, ambiente, versões e condições): [`reports/lighthouse/summary.json`](./reports/lighthouse/summary.json)

### Condições de execução

- Build otimizado: `npm run build`
- Servidor auditado: `vite preview` local
- Cenário dos mocks: `default` (perfil de navegador limpo por execução)
- Execuções: 3 por combinação (página x perfil)
- Páginas: início (`/`) e detalhe (`/nft/nft-emerald-042`)
- Perfis: mobile (390x844) e desktop (1440x900)
- Lighthouse: `13.5.0`
- Node: `v24.15.0`
- npm: `11.12.1`
- OS: Linux `7.0.0-38-generic`

### Medianas por página/perfil

| Perfil | Página | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS | TBT (ms) |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Mobile | Início | 90 | 100 | 100 | 100 | 3158.27 | 0.0006 | 12.5 |
| Mobile | Detalhe NFT | 88 | 98 | 100 | 100 | 3309.46 | 0.0496 | 11.5 |
| Desktop | Início | 100 | 100 | 100 | 100 | 690.75 | 0.0084 | 0 |
| Desktop | Detalhe NFT | 97 | 98 | 100 | 100 | 728.44 | 0.1067 | 0 |

### Metas não atingidas e causas prováveis

- **Performance (< 90)** apenas em **Mobile / Detalhe NFT**:
  - LCP ainda em ~3.3s na mediana, puxado pela imagem principal do detalhe e custo inicial de hidratação dessa rota;
  - oportunidade recorrente de reduzir mais JS inicial mesmo após code splitting.
# junglegaming
