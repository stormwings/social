import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import admin from "@/lib/firebase-admin";

/**
 * Handles API authentication and calls an external API.
 * @param {string} apiUrl - The URL of the external API.
 * @param {string} clientIdEnv - The environment variable key for client ID.
 * @param {string} clientSecretEnv - The environment variable key for client secret.
 * @returns {Promise<NextResponse>} - The API response.
 */
export async function externalApiHandler(apiUrl: string, clientIdEnv: string, clientSecretEnv: string) {
    try {
        const user = await authenticateUser();
        if (!user) return NextResponse.json({ message: "Not authenticated", error: 101 });

        const ethereumAddress = await getUserEthereumAddress(user.uid);
        if (!ethereumAddress) return NextResponse.json({ message: "Ethereum address not found", error: 103 });

        const customIdentifier = generateCustomIdentifier(ethereumAddress);
        const responseData = await callExternalApi(apiUrl, clientIdEnv, clientSecretEnv, customIdentifier);

        return NextResponse.json(responseData, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}

/**
 * Authenticates the user via Firebase Admin.
 * @returns {Promise<{ uid: string } | null>} - Returns the user UID if authenticated, otherwise null.
 */
async function authenticateUser() {
    const headersList = headers();
    const authHeader = headersList.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.split("Bearer ")[1];

    try {
        return await admin.auth().verifyIdToken(token);
    } catch {
        return null;
    }
}

/**
 * Retrieves the Ethereum address for a given user UID.
 * @param {string} uid - The user ID.
 * @returns {Promise<string | null>} - The Ethereum address or null if not found.
 */
async function getUserEthereumAddress(uid: string) {
    const db = admin.firestore();
    const walletRef = db.collection("wallets").doc(uid);
    const userRef = db.collection("users").doc(uid);

    const [walletDoc, userDoc] = await Promise.all([walletRef.get(), userRef.get()]);
    if (!userDoc.exists) return null;

    const userData = userDoc.data();
    const walletData = walletDoc.data();
    return walletData?.ethereumAddress ?? userData?.ethereumAddress ?? null;
}

/**
 * Generates a hashed custom identifier for API requests.
 * @param {string} identifier - The Ethereum address or another unique identifier.
 * @returns {string} - The formatted hashed identifier.
 */
function generateCustomIdentifier(identifier: string): string {
    const hash = crypto.createHash("sha256").update(identifier).digest("hex");
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

/**
 * Calls an external API with authentication.
 * @param {string} apiUrl - The API endpoint.
 * @param {string} clientIdEnv - Environment variable for client ID.
 * @param {string} clientSecretEnv - Environment variable for client secret.
 * @param {string} customIdentifier - Unique identifier for authentication.
 * @returns {Promise<any>} - The API response data.
 */
async function callExternalApi(apiUrl: string, clientIdEnv: string, clientSecretEnv: string, customIdentifier: string) {
    const params = new URLSearchParams();
    params.append("username", `${process.env[clientIdEnv]}:${customIdentifier}`);
    params.append("password", process.env[clientSecretEnv] || "");

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
        },
        body: params,
    });

    if (!response.ok) {
        throw new Error("Failed to authenticate with external API.");
    }

    return await response.json();
}
