import { AuthForm } from "@/components/auth/auth-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const params = await searchParams;
  return <AuthForm mode="login" created={params.created === "1"} />;
}
