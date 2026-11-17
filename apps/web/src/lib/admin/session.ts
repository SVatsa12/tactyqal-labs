import "server-only";
import { cookies } from "next/headers";

/** The API's JWT is kept in an httpOnly cookie, so client JS never sees it. */
export const SESSION_COOKIE = "tq_admin";

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function setToken(token: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // matches the API's default JWT_EXPIRES_IN (7d)
  });
}

export async function clearToken(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
