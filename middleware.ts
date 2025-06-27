import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";

// Clerk JWKS endpoint (replace with your actual domain if needed)
const JWKS = createRemoteJWKSet(
  new URL("https://clerk.reospicespowders.com/.well-known/jwks.json")
);

// Define protected routes
const protectedRoutes = ["/dashboard", "/dashboard/", "/dashboard/", "/admin", "/admin/"];
function isProtectedRoute(path: string) {
  return protectedRoutes.some((route) => path === route || path.startsWith(route + "/"));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // Get the JWT from the Clerk cookie
  const token = req.cookies.get("__session")?.value;
  if (!token) {
    // Not logged in
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    // Verify the JWT using Clerk's JWKS
    const { payload } = await jwtVerify(token, JWKS, {
      algorithms: ["RS256"],
      issuer: "https://clerk.reospicespowders.com",
    });

    // Check for admin role in multiple possible locations
    const anyPayload = payload as any;
    const role =
      anyPayload.role ||
      anyPayload.publicMetadata?.role ||
      anyPayload.sessionClaims?.role ||
      anyPayload.sessionClaims?.publicMetadata?.role;

    if (role !== "admin") {
      // Not an admin
      return NextResponse.redirect(new URL("/", req.url));
    }

    // All good, allow access
    return NextResponse.next();
  } catch (err) {
    // Invalid token or verification failed
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/admin", "/admin/:path*"],
};