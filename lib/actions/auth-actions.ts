"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUp = async (email: string, password: string, name: string) => {
  const result = await auth.api.signUpEmail({
    body: { email, password, name, callbackURL: "/" },
  });

  if (result.user) {
    redirect("/");
  }

  return result;
};

export const signIn = async (email: string, password: string) => {
  const result = await auth.api.signInEmail({
    body: { email, password, callbackURL: "/" },
  });

  if (result.user) {
    redirect("/");
  }

  return result;
};

export const signInSocial = async (provider: "github") => {
  const { url } = await auth.api.signInSocial({
    body: { provider, callbackURL: "/" },
  });

  if (url) {
    redirect(url);
  }
};

export const signOut = async () => {
  const result = await auth.api.signOut({
    headers: await headers(),
  });

  return result;
};
