import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const url = req.nextUrl.pathname;

  // Only protect /dashboard and /admin routes
  const isDashboard = url.startsWith("/dashboard");
  const isAdmin = url.startsWith("/admin");

  if (isDashboard || isAdmin) {
    const authData = await auth();
    // Not signed in? Redirect to home
    if (!authData.userId) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    // Not an admin? (Check Clerk JWT sessionClaims for admin_role)
    const anyClaims = authData.sessionClaims as any;
    if (anyClaims?.admin_role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Allow all other requests
  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/admin", "/admin/:path*"],
};