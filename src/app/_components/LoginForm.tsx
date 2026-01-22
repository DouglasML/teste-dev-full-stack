"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TextInput from "./TextInput";

export default function LoginForm() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<null | { type: "ok" | "error"; message: string }>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [forgotVisible, setForgotVisible] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cpf, password }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        setStatus({
          type: "error",
          message: errorBody?.message || "Nao foi possivel fazer login.",
        });
        return;
      }

      const data = await response.json();
      localStorage.setItem("currentUser", JSON.stringify(data));
      router.push("/usuarios");
      setStatus({
        type: "ok",
        message: `Bem-vindo, ${data.name}. Nivel ${data.level} (${data.role}).`,
      });
    } catch {
      setStatus({ type: "error", message: "Erro ao conectar no servidor." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm rounded-[32px] bg-gradient-to-r from-[#D06A24] to-[#D59825] px-8 py-10 text-center text-white shadow-2xl">
      <div className="flex justify-center">
        <Image src="/img-logo.png" alt="Senac" width={180} height={72} priority />
      </div>
      <form className="mt-6 flex flex-col items-center gap-3" onSubmit={handleSubmit}>
        <p className="text-sm font-semibold tracking-wide">Faca o seu login</p>
        <div className="flex w-full flex-col gap-3">
          <TextInput
            id="cpf"
            type="text"
            placeholder="CPF"
            autoComplete="username"
            value={cpf}
            onChange={(event) => setCpf(event.target.value)}
            className="border-white/70 bg-white/10 text-white placeholder-white/80 focus:ring-white/80"
          />
          <TextInput
            id="senha"
            type="password"
            placeholder="SENHA"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="border-white/70 bg-white/10 text-white placeholder-white/80 focus:ring-white/80"
          />
        </div>
        <button
          className="mt-3 w-full rounded-full bg-gradient-to-r from-[#4B4B4B] to-[#292E31] py-2 text-sm font-semibold disabled:opacity-70"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Entrando..." : "Acesse agora"}
        </button>
      </form>
      {status ? (
        <p className="mt-3 text-xs font-medium">
          {status.type === "ok" ? status.message : status.message}
        </p>
      ) : null}
      <button
        className="mt-4 block w-full text-xs underline decoration-white/70 underline-offset-4"
        type="button"
        onClick={() => setForgotVisible((prev) => !prev)}
      >
        Esqueci meu login ou senha
      </button>
      {forgotVisible ? (
        <p className="mt-2 text-xs text-white/90">Por favor entrar em contato com o administrador.</p>
      ) : null}
    </div>
  );
}
