import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("id_token")?.value;
  const { pathname, searchParams } = req.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/register";


  if (!token && pathname.startsWith("/dashboard")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + (searchParams.toString() ? `?${searchParams}` : ""));
    return NextResponse.redirect(url);
  }

  if (token && isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}


export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
