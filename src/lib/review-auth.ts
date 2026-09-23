import "server-only";
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const extractToken = (request: Request) => {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7);
  return request.headers.get("x-review-token");
};

const tokensMatch = (left: string, right: string) => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
};

export function requireReviewAccess(request: Request) {
  const configured = process.env.REVIEW_ACCESS_TOKEN?.trim();
  if (!configured) {
    return NextResponse.json(
      {
        error:
          "REVIEW_ACCESS_TOKEN is not configured. The review queue stays private until a server-only token is set.",
      },
      { status: 503 },
    );
  }

  const provided = extractToken(request);
  if (!provided || !tokensMatch(provided, configured)) {
    return NextResponse.json(
      { error: "Review access was denied." },
      { status: 401 },
    );
  }

  return null;
}
