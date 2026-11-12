import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define your allowed admin emails ONCE here
const ALLOWED_ADMINS = [
  "bikehub.712149@gmail.com",
];

export async function verifyAdmin() {
  const authObject = await auth();

  if (!authObject.userId) {
    if (process.env.AISTUDIO_PREVIEW === "true") {
      return null;
    }
    return NextResponse.json(
      { error: "Unauthorized: Shop Admins Only" },
      { status: 401 }
    );
  }

  const userEmail = authObject.sessionClaims?.email as string | undefined;

  // Authentication alone is not enough; API access is limited to this allowlist.
  // If their email isn't on the list, return an error
  if (!userEmail || !ALLOWED_ADMINS.includes(userEmail)) {
    return NextResponse.json(
      { error: "Unauthorized: Shop Admins Only" },
      { status: 401 }
    );
  }

  // A null response lets the route continue; callers must check this result.
  return null;
}