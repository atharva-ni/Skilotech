import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define route matchers
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isApiRoute = createRouteMatcher(["/api/(.*)"]);
const isWebhookRoute = createRouteMatcher(["/api/webhooks(.*)"]);

// Export as named export 'proxy' for Next.js 16 convention
export const proxy = clerkMiddleware(async (auth, req) => {
  // Protect all dashboard routes, and all API routes EXCEPT webhooks
  if (isDashboardRoute(req) || (isApiRoute(req) && !isWebhookRoute(req))) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.[\\w]+$|_next/image|favicon.ico).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
