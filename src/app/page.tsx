import LoginForm from "./_components/LoginForm";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f7f7] px-6 py-12">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/img-senac.png')" }}
      />
      <main className="relative z-10 flex w-full justify-center">
        <LoginForm />
      </main>
    </div>
  );
}
