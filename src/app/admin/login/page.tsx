import { AdminLoginForm } from "@/components/AdminLoginForm";
import { AppHeader } from "@/components/AppHeader";

export default function AdminLoginPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-sm px-4 py-12">
        <h1 className="text-xl font-black tracking-tight text-white">Admin login</h1>
        <p className="mt-2 text-sm text-slate-300">
          Admin is for creating friend accounts, resetting passwords, and running
          stock checks. Friends use the separate invite login.
        </p>
        <AdminLoginForm />
      </main>
    </>
  );
}
