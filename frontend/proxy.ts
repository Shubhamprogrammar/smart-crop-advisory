import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match everything except Next.js internals, static assets, and API-like paths.
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
