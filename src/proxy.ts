import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/signin"]);
const isPublicPage = createRouteMatcher(["/", "/signin"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthed = await convexAuth.isAuthenticated();
  console.log("[middleware]", request.nextUrl.pathname, "isAuthenticated:", isAuthed);
  if (isSignInPage(request) && isAuthed) {
    return nextjsMiddlewareRedirect(request, "/app");
  }
  if (!isPublicPage(request) && !isAuthed) {
    return nextjsMiddlewareRedirect(request, "/signin");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next|api/webhook/).*)"],
};
