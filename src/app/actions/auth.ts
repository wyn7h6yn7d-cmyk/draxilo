"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signUpAction(formData: FormData) {
  const schema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(8).max(200),
  });
  const parsed = schema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) redirect(`/signup?error=${encodeURIComponent("Invalid email or password.")}`);
  const { email, password } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app");
}

export async function signInAction(formData: FormData) {
  const schema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1).max(200),
    next: z.string().optional(),
  });
  const parsed = schema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    next: String(formData.get("next") ?? "/app"),
  });
  if (!parsed.success) redirect(`/login?error=${encodeURIComponent("Invalid email or password.")}`);
  const { email, password, next } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const dest = (next ?? "/app").startsWith("/") ? (next ?? "/app") : "/app";
  redirect(dest);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function forgotPasswordAction(formData: FormData) {
  const schema = z.object({ email: z.string().trim().email() });
  const parsed = schema.safeParse({ email: String(formData.get("email") ?? "") });
  if (!parsed.success) redirect("/forgot-password?sent=1");
  const { email } = parsed.data;
  const supabase = await createSupabaseServerClient();

  // TODO: Add a proper reset-password route and set redirectTo accordingly.
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  // Always show success to avoid leaking which emails exist.
  void error;
  redirect("/forgot-password?sent=1");
}

