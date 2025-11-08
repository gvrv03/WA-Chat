import { NextResponse } from "next/server";
import { connectToDatabase } from "@/config/MongoDB";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const collectionName = searchParams.get("collection");

    if (!sessionId || !collectionName) {
      return NextResponse.json({ error: "Missing sessionId or collection" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const data = await db.collection(collectionName).findOne({ sessionId });

    return NextResponse.json(data || {});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
  }
}
