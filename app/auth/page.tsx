import { headers } from "next/headers";
import AuthClientPage from "./auth-client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return redirect("/dashboard");
  }

  return <AuthClientPage />;
}
