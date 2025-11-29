import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  const isLoggedIn = !!sessionToken;
  const isOnLoginPage = request.nextUrl.pathname === "/login";
  const isOnApiAuth = request.nextUrl.pathname.startsWith("/api/auth");
  const isOnPublicPage = request.nextUrl.pathname === "/";

  if (isOnApiAuth) {
    return NextResponse.next();
  }

  if (isLoggedIn && isOnLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  if (!isLoggedIn && !isOnLoginPage && !isOnPublicPage) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
