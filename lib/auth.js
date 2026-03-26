import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { cache } from "react";
import { createSession as createSessionRecord, deleteSession, getSession, getUserById } from "./db";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "good-drive-session";
const getSessionUser = cache(async (token) => {
  const session = await getSession(token);
  if (!session || new Date(session.expiresAt) < new Date()) {
    return null;
  }

  return getUserById(session.userId);
});

export async function createSession(userId) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();

  await createSessionRecord(userId, token, expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt),
    path: "/"
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await deleteSession(token);
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const user = await getSessionUser(token);
  if (!user) {
    return null;
  }

  return user;
}

export async function requireUser(role) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (role && user.role !== role) {
    redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  return user;
}
