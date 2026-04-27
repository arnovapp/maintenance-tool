import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/db/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every route except:
     * - Next.js internals (_next/static, _next/image)
     * - common static asset extensions
     * - the Next favicon
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
