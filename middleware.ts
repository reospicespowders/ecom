import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes
const isProtectedRoute = createRouteMatcher(["/admin(.*)", "/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const url = req.nextUrl.pathname;

  // If it's a protected route
  if (isProtectedRoute(req)) {
    const authData = await auth();
    
    // Not signed in? Redirect to home
    if (!authData.userId) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    // Not an admin? (Check Clerk public metadata)
    if (authData.sessionClaims?.publicMetadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Allow all other requests
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)", // Don't run middleware on static files
    "/", 
    "/(api|trpc)(.*)",
    "/admin/:path*", 
    "/dashboard/:path*"
  ],
};