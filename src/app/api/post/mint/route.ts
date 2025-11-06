import { NextResponse } from "next/server";
import { headers } from 'next/headers'

import admin from "@/lib/firebase-admin";

export async function POST(request: Request) {
    const {
        userUID,
        postId,
        tokenId,
        ethereumAddress,
    } = await request.json();

    const headersList = headers()
    const authHeader = headersList.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ message: "Not authenticated", error: 101 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    if (!decodedToken) {
        return NextResponse.json({ message: "Not authenticated", error: 101 });
    }

    try {
        const db = admin.firestore();

        const postRef = db
            .collection("users").doc(userUID)
            .collection("posts").doc(postId);
        
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            return NextResponse.json({ message: "Post not found" });
        } else {
            await postRef.update({ 
                ownerKey: ethereumAddress,
                tokenId: tokenId,
            });

            return NextResponse.json({
                message: "Operation processed",
                ok: true,
            });
        }
    } catch (error) {
        return NextResponse.json({
            message: "Internal Server Error",
            error: error,
        });
    }
}
