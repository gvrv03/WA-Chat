import { connectToDatabase } from "@/config/MongoDB";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const { sessionId, newMessage, phoneID, waPhoneId, userName, isAIControl } =
      await req.json();

    // ✅ Basic validation
    if (!sessionId || !newMessage || !phoneID) {
      return NextResponse.json(
        { error: "Missing sessionId, phoneID or newMessage!" },
        { status: 400 }
      );
    }

    // ✅ Connect to DB and collection (per phoneID)
    const { db } = await connectToDatabase();
    const collection = db.collection(phoneID);

    // ✅ Check if session already exists
    const existingSession = await collection.findOne({ sessionId });

    if (existingSession) {
      // ✅ Append new message to existing user
      await collection.updateOne(
        { sessionId },
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
        message: "Message added successfully to existing user!",
        isAIControl: existingSession?.isAIControl,
      });
    }

    // ✅ If session does not exist — Create new user record
    const newUserData = {
      sessionId,
      waPhoneId: waPhoneId || "", // Default empty if not sent
      userName: userName || "Unknown User",
      Messages: [
        {
          id: newMessage.id,
          isUser: newMessage.isUser,
          textBody: newMessage.textBody,
          type: newMessage.type,
          date: newMessage.date,
          time: newMessage.time,
        },
      ],
      isAIControl: isAIControl ?? true, // Default to true if undefined
    };

    const res = await collection.insertOne(newUserData);
    const findThat = await collection.findOne({ _id: res?.insertedId });
    return NextResponse.json({
      success: true,
      message: "New user session created and message saved!",
      isAIControl: findThat?.isAIControl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Server Error" },
      { status: 500 }
    );
  }
};
