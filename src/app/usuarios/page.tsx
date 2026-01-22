"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import TextInput from "../_components/TextInput";

type CurrentUser = {
  id: number;
  name: string;
  role: string;
  level: number;
  can_edit: boolean;
  can_delete: boolean;
};

type User = {
  id: number;
  name: string;
  cpf: string;
  email: string;
  role: string;
  level: number;
  can_edit: boolean;
  can_delete: boolean;
};

const roleOptions = ["Administrador", "Moderador", "Leitor"];

export default function UsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(roleOptions[2]);
  const [password, setPassword] = useState("");

  const apiBase = "http://127.0.0.1:8000/api";

  const canEdit = currentUser?.can_edit ?? false;
  const canDelete = currentUser?.can_delete ?? false;

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as CurrentUser;
      setCurrentUser(parsed);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const authHeaders = useMemo(() => {
    if (!currentUser) {
      return {};
    }
    return { "X-User-Id": String(currentUser.id) };
  }, [currentUser]);

  const loadUsers = async () => {
    if (!currentUser) {
      return;
    }

    try {
      const response = await fetch(`${apiBase}/users`, {
        headers: {
          ...authHeaders,
        },
      });
      if (!response.ok) {
        setStatus("Nao foi possivel carregar os usuarios.");
        return;
      }
      const data = (await response.json()) as User[];
      setUsers(data);
    } catch {
      setStatus("Erro ao conectar no servidor.");
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCpf("");
    setEmail("");
    setRole(roleOptions[2]);
    setPassword("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      setStatus("Faca o login antes de cadastrar usuarios.");
      return;
    }
    if (!canEdit) {
      setStatus("Voce nao tem permissao para cadastrar ou editar.");
      return;
    }

    setIsLoading(true);
    setStatus(null);

    const payload = { name, cpf, email, role, password };
    const url = editingId ? `${apiBase}/users/${editingId}` : `${apiBase}/users`;
    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const fieldErrors = errorBody?.errors
          ? Object.values(errorBody.errors).flat().join(" ")
          : null;
        setStatus(fieldErrors || errorBody?.message || "Erro ao salvar usuario.");
        return;
      }

      await loadUsers();
      resetForm();
    } catch {
      setStatus("Erro ao conectar no servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    if (!canEdit) {
      setStatus("Voce nao tem permissao para editar.");
      return;
    }
    setEditingId(user.id);
    setName(user.name);
    setCpf(user.cpf);
    setEmail(user.email);
    setRole(user.role);
    setPassword("");
  };

  const handleDelete = async (userId: number) => {
    if (!canDelete) {
      setStatus("Voce nao tem permissao para excluir.");
      return;
    }

    try {
      const response = await fetch(`${apiBase}/users/${userId}`, {
        method: "DELETE",
        headers: {
          ...authHeaders,
        },
      });
      if (!response.ok) {
        const errorBody = await response.json();
        setStatus(errorBody?.message || "Erro ao excluir usuario.");
        return;
      }
      await loadUsers();
    } catch {
      setStatus("Erro ao conectar no servidor.");
    }
  };

  const toggleMenu = (userId: number) => {
    setOpenMenuId((current) => (current === userId ? null : userId));
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7] px-6 py-12">
        <div className="rounded-3xl bg-white px-6 py-8 text-center shadow-md">
          <p className="text-sm text-slate-700">Faca login primeiro para acessar esta pagina.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f7f7f7] px-6 py-12"
      onClick={() => setOpenMenuId(null)}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rounded-3xl bg-white px-6 py-6 shadow-md">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Cadastro de usuarios</h1>
              <p className="mt-1 text-sm text-slate-500">
                Logado como {currentUser.name} (Nivel {currentUser.level} - {currentUser.role})
              </p>
            </div>
            <button
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
              type="button"
              onClick={handleLogout}
            >
              Sair
            </button>
          </div>
        </header>

        <section className="rounded-3xl bg-white px-6 py-6 shadow-md">
          <h2 className="text-sm font-semibold text-slate-700">Novo usuario</h2>
          <form className="mt-4 grid gap-6 md:grid-cols-[1.3fr_0.9fr]" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <TextInput
                id="nome"
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:ring-slate-200"
              />
              <TextInput
                id="cpf"
                placeholder="CPF"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:ring-slate-200"
              />
              <TextInput
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:ring-slate-200"
              />
              <TextInput
                id="senha"
                type="password"
                placeholder="Senha (opcional)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:ring-slate-200"
              />
            </div>
            <div className="flex flex-col gap-4">
              <select
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-200"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {roleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button
                className="rounded-full bg-slate-800 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                type="submit"
                disabled={!canEdit || isLoading}
              >
                {editingId ? "Salvar" : "Cadastrar"}
              </button>
              {editingId ? (
                <button
                  className="text-sm text-slate-500"
                  type="button"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
          {status ? <p className="mt-3 text-xs text-slate-600">{status}</p> : null}
        </section>

        <section className="rounded-3xl bg-white px-6 py-6 shadow-md">
          <h2 className="text-sm font-semibold text-slate-700">Usuarios cadastrados</h2>
          <div className="mt-4 flex flex-col gap-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D06A24] text-white">
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <p className="text-[11px] text-slate-400">
                      {user.role} (Nivel {user.level})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      className="rounded-full bg-slate-600 px-4 py-1 text-xs font-semibold text-white"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleMenu(user.id);
                      }}
                    >
                      Acoes
                    </button>
                    {openMenuId === user.id ? (
                      <div
                        className="absolute right-0 top-9 z-10 w-32 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          className="w-full rounded-lg px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                          type="button"
                          onClick={() => {
                            toggleMenu(user.id);
                            handleEdit(user);
                          }}
                          disabled={!canEdit}
                        >
                          Editar
                        </button>
                        <button
                          className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                          type="button"
                          onClick={() => {
                            toggleMenu(user.id);
                            handleDelete(user.id);
                          }}
                          disabled={!canDelete}
                        >
                          Excluir
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
            {users.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum usuario encontrado.</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-3xl bg-white px-6 py-6 text-sm text-slate-600 shadow-md">
          <h2 className="text-sm font-semibold text-slate-700">Regras de permissao</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Administrador (Nivel 1): visualizar, editar, criar e excluir usuarios.</li>
            <li>Moderador (Nivel 2): visualizar, editar, criar, sem excluir.</li>
            <li>Leitor (Nivel 3): apenas visualizar.</li>
          </ul>
        </section>

        <section className="rounded-3xl bg-white px-6 py-6 text-sm text-slate-600 shadow-md">
          <h2 className="text-sm font-semibold text-slate-700">Regras de cadastro</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Nome: obrigatorio.</li>
            <li>CPF: obrigatorio e unico.</li>
            <li>Email: obrigatorio e deve conter @.</li>
            <li>Perfil: Administrador, Moderador ou Leitor.</li>
            <li>Senha: opcional, se vazia usa senha123. Se preencher, minimo 6 caracteres.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
