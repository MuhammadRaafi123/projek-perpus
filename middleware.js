import { NextResponse } from "next/server";

const ADMIN_ROUTES = [
  "/Dashboard-Admin",
  "/kelola-buku",
  "/kelola-peminjaman",
  "/pengembalian",
];

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

  const userRole = request.cookies.get("user_role")?.value;
  const userId = request.cookies.get("user_id")?.value;

  console.log("==================================");
  console.log("PATH :", pathname);
  console.log("ROLE :", userRole);
  console.log("USER :", userId);
  console.log("==================================");

  const isLoggedIn = !!userId;
  const isAdmin = userRole === "admin";

  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login-page", request.url));
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/akses-ditolak", request.url));
    }
  }

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login-page", request.url));
  }

  if (
    isLoggedIn &&
    (pathname === "/login-page" || pathname === "/register-page")
  ) {
    return NextResponse.redirect(
      new URL(isAdmin ? "/Dashboard-Admin" : "/Homepage", request.url)
    );
  }

  return NextResponse.next();
}

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