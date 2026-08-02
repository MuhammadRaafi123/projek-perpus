import { cookies } from "next/headers";

export async function authenticateToken(req) {
  const cookieStore = await cookies(); 
  const userId = cookieStore.get("user_id")?.value;
  const userRole = cookieStore.get("user_role")?.value;

  if (!userId || !userRole) {
    return null;
  }

  return { id: userId, role: userRole };
}

export function isUser(user) {
  return user && (user.role === "user" || user.role === "siswa" || user.role === "anggota");
}

export function isAdmin(user) {
  return user && user.role === "admin";
}