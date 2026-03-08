import { redirect } from "next/navigation";
import { getServerSession } from "~/lib/session";
import { LoginForm } from "~/components/login-form";

export default async function LoginPage() {
  const session = await getServerSession();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <LoginForm />
    </div>
  );
}
