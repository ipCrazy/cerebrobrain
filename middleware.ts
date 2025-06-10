import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { publicRoutes } from "./config/routes";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proveri da li je korisnik ulogovan (asinhrono dohvatanje cookies)
  const token = request.cookies.get("auth-token")?.value;


  // Ako je ulogovan i pokušava da pristupi public rutama (login/register), preusmeri na /
  if (token && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Ako nije ulogovan i pokušava da pristupi privatnim rutama, preusmeri ga na login
  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico|api).*)"], // Exclude API and static routes
};