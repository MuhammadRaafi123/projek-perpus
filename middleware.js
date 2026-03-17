// middleware.js
// =====================================================
// LOKASI FILE INI: ROOT PROJECT (sejajar dengan folder app/)
//
// perpus-projek/
// ├── app/
// ├── middleware.js   ← FILE INI
// ├── package.json
// └── ...
// =====================================================

import { NextResponse } from "next/server";

// Halaman yang HANYA bisa diakses admin
const ADMIN_ROUTES = [
  "/Dashboard-Admin",
  "/kelola-buku",
  "/kelola-peminjaman",
  "/pengembalian",
];

// Halaman yang HANYA bisa diakses user yang sudah login
const PROTECTED_ROUTES = [
  "/Homepage",
  "/koleksi-buku",
  "/peminjaman",
  "/wishlist",
  "/riwayat",
  "/profile",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Ambil cookie role dan id
  const userRole = request.cookies.get("user_role")?.value;
  const userId   = request.cookies.get("user_id")?.value;
  const isLoggedIn = !!userId;
  const isAdmin    = userRole === "admin";

  // ── Cek halaman ADMIN ──
  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isAdminRoute) {
    if (!isLoggedIn) {
      // Belum login → ke login
      const loginUrl = new URL("/login-page", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      // Login tapi bukan admin → ke halaman akses ditolak
      return NextResponse.redirect(new URL("/akses-ditolak", request.url));
    }
  }

  // ── Cek halaman USER (login required) ──
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login-page", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Kalau sudah login, jangan bisa ke login/register lagi ──
  if (isLoggedIn && (pathname === "/login-page" || pathname === "/register-page")) {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/Dashboard-Admin", request.url));
    }
    return NextResponse.redirect(new URL("/Homepage", request.url));
  }

  return NextResponse.next();
}

// Tentukan path mana yang diproses middleware
export const config = {
  matcher: [
    "/Dashboard-Admin/:path*",
    "/kelola-buku/:path*",
    "/kelola-peminjaman/:path*",
    "/pengembalian/:path*",
    "/Homepage/:path*",
    "/koleksi-buku/:path*",
    "/peminjaman/:path*",
    "/wishlist/:path*",
    "/riwayat/:path*",
    "/profile/:path*",
    "/login-page",
    "/register-page",
  ],
};