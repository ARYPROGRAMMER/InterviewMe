"use server";

import { db, auth } from "@/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7 * 1000;

export async function signUp(params: SignUpParams) {
  const { uid, name, email, photoURL } = params;

  try {
    const userRecord = await db.collection("users").doc(uid).get();

    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in instead",
      };
    }

    await db
      .collection("users")
      .doc(uid)
      .set({
        name,
        email,
        photoURL: photoURL || null,
      });

    return {
      success: true,
      message: "Account created successfully. Please sign in",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error("Error creating a user", e);

    if (e.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "The Email is already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create an account",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      return {
        success: false,
        messgae: "User does not exist. Create an account now",
      };
    }

    await setSessionCookie(idToken);
  } catch (e: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log(e);

    return {
      success: false,
      message: "Failed to log into the account",
    };
  }
}

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK,
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (e: any) {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log(e);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();

  return !!user;
}

export async function signOut() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");

    return {
      success: true,
      message: "Signed out successfully",
    };
  } catch (error) {
    console.error("Error during sign out:", error);
    return {
      success: false,
      message: "Failed to sign out",
    };
  }
}

export async function getInterviewByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;
  const interviews = await db
    .collection("interviews")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}
