import { NextResponse } from "next/server";
import { connectToDatabase } from "@/config/MongoDB";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const sessionId = searchParams.get("sessionId");
    const collectionName = searchParams.get("collection") || "sessions"; // Default fallback

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const data = await db.collection(collectionName).findOne({ sessionId });

    return NextResponse.json(data || {});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
  }
}
