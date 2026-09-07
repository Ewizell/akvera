import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Вход",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Вход</h1>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}