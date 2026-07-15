import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define your allowed admin emails ONCE here
const ALLOWED_ADMINS = [
  "bikehub.712149@gmail.com", 
];

export async function verifyAdmin() {
  const authObject = await auth();
  const userEmail = authObject.sessionClaims?.email as string;

  // If they aren't logged in, or their email isn't on the list, return an error
  if (!authObject.userId || !ALLOWED_ADMINS.includes(userEmail)) {
    return NextResponse.json(
      { error: "Unauthorized: Shop Admins Only" }, 
      { status: 401 }
    );
  }

  // If they pass, return null so the API knows it can continue
  return null; 
}