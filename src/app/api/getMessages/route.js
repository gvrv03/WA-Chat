import { NextResponse } from "next/server";
import { connectToDatabase } from "@/config/MongoDB";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const collectionName = searchParams.get("collection");
    console.log(collectionName);

    if (!collectionName) {
      return NextResponse.json(
        { error: "Missing sessionId or collection" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const data = await db
      .collection(collectionName)
      .find({})
      .sort({ updatedAt: -1 }) // or `_id: -1` if you don't have createdAt
      .toArray();

    return NextResponse.json(data || []);
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
  }
}
