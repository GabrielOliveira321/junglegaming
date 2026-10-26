import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Wallet } from "@/contracts/rest";
import {
  getApiErrorMessage,
  useChangePasswordMutation,
  useCreateWalletMutation,
  useProfileQuery,
  useUpdateProfileMutation,
  useUpdateWalletMutation,
  useWalletsQuery,
} from "@/hooks/useProfile";
import { useLogoutMutation } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

type ProfileFormState = {
  displayName: string;
  username: string;
  email: string;
  ensName: string;
  walletNickname: string;
};

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type WalletFormState = {
  label: string;
  network: Wallet["network"];
  address: string;
  isPrimary: boolean;
};

const EMPTY_PASSWORD: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function PerfilColecionador() {
  const [tab, setTab] = useState<"perfil" | "carteiras">("perfil");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const profileQuery = useProfileQuery();
  const walletsQuery = useWalletsQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const createWalletMutation = useCreateWalletMutation();
  const updateWalletMutation = useUpdateWalletMutation();
  const logoutMutation = useLogoutMutation();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    displayName: "",
    username: "",
    email: "",
    ensName: "",
    walletNickname: "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(EMPTY_PASSWORD);
  const [walletForm, setWalletForm] = useState<WalletFormState>({
    label: "",
    network: "ethereum",
    address: "",
    isPrimary: false,
  });

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) {
      return;
    }

    setProfileForm({
      displayName: profile.displayName,
      username: profile.username,
      email: profile.email,
      ensName: profile.ensName,
      walletNickname: profile.walletNickname,
    });
  }, [profileQuery.data]);

  function resetMessages() {
    setFeedback(null);
    setError(null);
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();

    try {
      await updateProfileMutation.mutateAsync(profileForm);
      setFeedback("Perfil atualizado com sucesso.");
    } catch (mutationError) {
      setError(getApiErrorMessage(mutationError, "Não foi possível atualizar o perfil."));
    }
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    resetMessages();
    try {
      await updateProfileMutation.mutateAsync({ avatarUrl: `mock://${file.name}` });
      setFeedback("Avatar atualizado com sucesso.");
    } catch (mutationError) {
      setError(getApiErrorMessage(mutationError, "Não foi possível atualizar o avatar."));
    } finally {
      event.target.value = "";
    }
  }

  async function handleRemoveAvatar() {
    resetMessages();
    try {
      await updateProfileMutation.mutateAsync({ avatarUrl: null });
      setFeedback("Avatar removido com sucesso.");
    } catch (mutationError) {
      setError(getApiErrorMessage(mutationError, "Não foi possível remover o avatar."));
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();
    try {
      await changePasswordMutation.mutateAsync(passwordForm);
      setPasswordForm(EMPTY_PASSWORD);
      setFeedback("Senha alterada com sucesso.");
    } catch (mutationError) {
      setError(getApiErrorMessage(mutationError, "Não foi possível alterar a senha."));
    }
  }

  async function handleCreateWallet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();
    try {
      await createWalletMutation.mutateAsync(walletForm);
      setWalletForm({
        label: "",
        network: "ethereum",
        address: "",
        isPrimary: false,
      });
      setFeedback("Carteira cadastrada com sucesso.");
    } catch (mutationError) {
      setError(getApiErrorMessage(mutationError, "Não foi possível cadastrar a carteira."));
    }
  }

  async function handleWalletRename(walletId: string, currentLabel: string) {
    const nextLabel = window.prompt("Novo apelido da carteira:", currentLabel)?.trim();
    if (!nextLabel) {
      return;
    }

    resetMessages();
    try {
      await updateWalletMutation.mutateAsync({
        walletId,
        payload: { label: nextLabel },
      });
      setFeedback("Apelido da carteira atualizado.");
    } catch (mutationError) {
      setError(getApiErrorMessage(mutationError, "Não foi possível atualizar a carteira."));
    }
  }

  async function handleSetPrimaryWallet(walletId: string) {
    const wallets = walletsQuery.data ?? [];
    const currentPrimary = wallets.find((wallet) => wallet.isPrimary);
    if (currentPrimary?.id === walletId) {
      return;
    }

    resetMessages();
    try {
      if (currentPrimary) {
        await updateWalletMutation.mutateAsync({
          walletId: currentPrimary.id,
          payload: { isPrimary: false },
        });
      }
      await updateWalletMutation.mutateAsync({
        walletId,
        payload: { isPrimary: true },
      });
      setFeedback("Carteira principal atualizada.");
    } catch (mutationError) {
      setError(getApiErrorMessage(mutationError, "Não foi possível alterar carteira principal."));
    }
  }

  async function handleLogout() {
    resetMessages();
    try {
      await logoutMutation.mutateAsync();
      window.location.href = "/";
    } catch (mutationError) {
      setError(getApiErrorMessage(mutationError, "Não foi possível sair da conta."));
    }
  }

  if (profileQuery.isLoading) {
    return (
      <section className="flex w-full max-w-[1200px] flex-col gap-4 rounded-lg border border-[#3F2319] bg-[#241612] p-6">
        <Skeleton className="h-10 w-52" />
        <Skeleton className="h-64 w-full" />
      </section>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <section className="flex w-full max-w-[1200px] flex-col gap-3 rounded-lg border border-[#3F2319] bg-[#241612] p-6">
        <h1 className="text-2xl font-bold text-[#F5F1EB]">Perfil do colecionador</h1>
        <p className="text-[#CFB28C]">Não foi possível carregar seu perfil.</p>
      </section>
    );
  }

  const profile = profileQuery.data;
  const wallets = walletsQuery.data ?? [];
  const busy =
    updateProfileMutation.isPending ||
    changePasswordMutation.isPending ||
    createWalletMutation.isPending ||
    updateWalletMutation.isPending ||
    logoutMutation.isPending;

  return (
    <section className="flex w-full max-w-[1200px] flex-col gap-6 rounded-lg border border-[#3F2319] bg-[#241612] p-6 text-[#F5F1EB]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Perfil do colecionador</h1>
        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="rounded-[6px] border border-[#D28A4C] px-4 py-2 font-semibold text-[#D28A4C] transition hover:bg-[#D28A4C]/10 disabled:opacity-60"
        >
          Sair
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          aria-pressed={tab === "perfil"}
          onClick={() => setTab("perfil")}
          className={`rounded-[6px] px-4 py-2 text-sm font-semibold ${
            tab === "perfil" ? "bg-[#D28A4C] text-[#140D0A]" : "border border-[#3F2319] text-[#CFB28C]"
          }`}
        >
          Perfil
        </button>
        <button
          type="button"
          aria-pressed={tab === "carteiras"}
          onClick={() => setTab("carteiras")}
          className={`rounded-[6px] px-4 py-2 text-sm font-semibold ${
            tab === "carteiras" ? "bg-[#D28A4C] text-[#140D0A]" : "border border-[#3F2319] text-[#CFB28C]"
          }`}
        >
          Carteiras
        </button>
      </div>

      {feedback ? (
        <p role="status" className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {feedback}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {tab === "perfil" ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form className="space-y-4" onSubmit={handleProfileSubmit}>
            <label className="block">
              <span className="mb-1 block text-sm text-[#CFB28C]">Nome público</span>
              <input
                value={profileForm.displayName}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, displayName: event.target.value }))}
                className="h-10 w-full rounded-md border border-[#3F2319] bg-[#1B110E] px-3 text-sm"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-[#CFB28C]">Usuário</span>
              <input
                value={profileForm.username}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, username: event.target.value }))}
                className="h-10 w-full rounded-md border border-[#3F2319] bg-[#1B110E] px-3 text-sm"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-[#CFB28C]">E-mail</span>
              <input
                type="email"
                value={profileForm.email}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                className="h-10 w-full rounded-md border border-[#3F2319] bg-[#1B110E] px-3 text-sm"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-[#CFB28C]">ENS</span>
              <input
                value={profileForm.ensName}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, ensName: event.target.value }))}
                className="h-10 w-full rounded-md border border-[#3F2319] bg-[#1B110E] px-3 text-sm"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-[#CFB28C]">Apelido da carteira</span>
              <input
                value={profileForm.walletNickname}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, walletNickname: event.target.value }))}
                className="h-10 w-full rounded-md border border-[#3F2319] bg-[#1B110E] px-3 text-sm"
              />
            </label>

            <button
              type="submit"
              disabled={busy}
              className="rounded-[6px] bg-[#D28A4C] px-4 py-2 font-semibold text-[#140D0A] disabled:opacity-60"
            >
              Salvar perfil
            </button>
          </form>

          <div className="space-y-6 rounded-lg border border-[#3F2319] bg-[#1B110E] p-4">
            <div className="flex flex-col items-center gap-3">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={`Avatar de ${profile.displayName}`}
                  className="h-24 w-24 rounded-full border border-[#3F2319] object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#3F2319] bg-[#241612] text-xs text-[#CFB28C]">
                  Sem avatar
                </div>
              )}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={updateProfileMutation.isPending}
                  className="rounded-[6px] border border-[#D28A4C] px-3 py-2 text-sm text-[#D28A4C] disabled:opacity-60"
                >
                  Alterar avatar
                </button>
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={updateProfileMutation.isPending}
                  className="rounded-[6px] border border-[#3F2319] px-3 py-2 text-sm text-[#CFB28C] disabled:opacity-60"
                >
                  Remover
                </button>
              </div>
            </div>

            <form className="space-y-3" onSubmit={handlePasswordSubmit}>
              <h2 className="text-lg font-semibold">Alterar senha</h2>
              <label className="block">
                <span className="mb-1 block text-sm text-[#CFB28C]">Senha atual</span>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                  className="h-10 w-full rounded-md border border-[#3F2319] bg-[#241612] px-3 text-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-[#CFB28C]">Nova senha</span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                  className="h-10 w-full rounded-md border border-[#3F2319] bg-[#241612] px-3 text-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-[#CFB28C]">Confirmar senha</span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  className="h-10 w-full rounded-md border border-[#3F2319] bg-[#241612] px-3 text-sm"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="w-full rounded-[6px] bg-[#D28A4C] px-3 py-2 text-sm font-semibold text-[#140D0A] disabled:opacity-60"
              >
                Atualizar senha
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <form className="grid gap-3 rounded-lg border border-[#3F2319] bg-[#1B110E] p-4 md:grid-cols-2" onSubmit={handleCreateWallet}>
            <h2 className="md:col-span-2 text-lg font-semibold">Adicionar carteira</h2>
            <label className="block">
              <span className="mb-1 block text-sm text-[#CFB28C]">Apelido</span>
              <input
                data-testid="wallet-label-input"
                value={walletForm.label}
                onChange={(event) => setWalletForm((prev) => ({ ...prev, label: event.target.value }))}
                className="h-10 w-full rounded-md border border-[#3F2319] bg-[#241612] px-3 text-sm"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-[#CFB28C]">Rede</span>
              <select
                data-testid="wallet-network-select"
                value={walletForm.network}
                onChange={(event) =>
                  setWalletForm((prev) => ({ ...prev, network: event.target.value as Wallet["network"] }))
                }
                className="h-10 w-full rounded-md border border-[#3F2319] bg-[#241612] px-3 text-sm"
              >
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="solana">Solana</option>
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm text-[#CFB28C]">Endereço</span>
              <input
                data-testid="wallet-address-input"
                value={walletForm.address}
                onChange={(event) => setWalletForm((prev) => ({ ...prev, address: event.target.value }))}
                className="h-10 w-full rounded-md border border-[#3F2319] bg-[#241612] px-3 text-sm"
                required
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-[#CFB28C] md:col-span-2">
              <input
                data-testid="wallet-primary-checkbox"
                type="checkbox"
                checked={walletForm.isPrimary}
                onChange={(event) => setWalletForm((prev) => ({ ...prev, isPrimary: event.target.checked }))}
              />
              Definir como principal
            </label>
            <button
              type="submit"
              disabled={createWalletMutation.isPending}
              className="md:col-span-2 rounded-[6px] bg-[#D28A4C] px-4 py-2 text-sm font-semibold text-[#140D0A] disabled:opacity-60"
            >
              Salvar carteira
            </button>
          </form>

          {walletsQuery.isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : (
            <ul className="space-y-3">
              {wallets.map((wallet) => (
                <li key={wallet.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#3F2319] bg-[#1B110E] p-4">
                  <div>
                    <p className="font-semibold">
                      {wallet.label} {wallet.isPrimary ? <span className="text-[#D28A4C]">(principal)</span> : null}
                    </p>
                    <p className="text-sm text-[#CFB28C]">{wallet.network}</p>
                    <p className="text-xs text-[#A58A6B] break-all">{wallet.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleWalletRename(wallet.id, wallet.label)}
                      disabled={updateWalletMutation.isPending}
                      className="rounded-[6px] border border-[#3F2319] px-3 py-2 text-sm text-[#CFB28C] disabled:opacity-60"
                    >
                      Editar apelido
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryWallet(wallet.id)}
                      disabled={updateWalletMutation.isPending || wallet.isPrimary}
                      className="rounded-[6px] border border-[#D28A4C] px-3 py-2 text-sm text-[#D28A4C] disabled:opacity-60"
                    >
                      Tornar principal
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
