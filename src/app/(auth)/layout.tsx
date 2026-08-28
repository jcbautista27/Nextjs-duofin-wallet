import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Logo className="mb-8 h-10 w-16" />
      {children}
    </main>
  );
}
