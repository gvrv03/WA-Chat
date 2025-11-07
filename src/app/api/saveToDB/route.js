import { connectToDatabase } from "@/config/MongoDB";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const { sessionId, newMessage,phoneID } = await req.json(); // Receive data from frontend

    if (!sessionId || !newMessage) {
      return NextResponse.json(
        { error: "Missing sessionId or message" },
        { status: 400 }
      );
    }
    const { db } = await connectToDatabase();
    const collection = db.collection(phoneID); // replace with your collection name

    // Push new message to Messages array using MongoDB $push
    const updateResult = await collection.updateOne(
      { sessionId: sessionId }, // Find user by sessionId
      {
        $push: {
          Messages: {
            id: newMessage.id,
            isUser: newMessage.isUser,
            textBody: newMessage.textBody,
            type: newMessage.type,
            date: newMessage.date,
            time: newMessage.time,
          },
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Message added successfully!",
      updateResult,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
