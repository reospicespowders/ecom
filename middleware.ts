import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/", "/shop(.*)", "/about", "/contact", "/login", "/sign-in", "/sign-up", "/api(.*)"],
  afterAuth(auth, req) {
    const url = req.nextUrl.pathname;

    // Protect /admin and /dashboard
    if (url.startsWith("/admin") || url.startsWith("/dashboard")) {
      // Not signed in? Redirect to home
      if (!auth.userId) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      // Not an admin? (Check Clerk public metadata)
      if (auth.sessionClaims?.publicMetadata?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Allow all other requests
    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"], // Protect all subroutes
}; 