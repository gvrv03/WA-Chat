// app/api/send-email/route.js
import { NextResponse } from "next/server";
import WhatsApp from "whatsapp";

export const POST = async (req) => {
  try {
    // Your test sender phone number
    const wa = new WhatsApp(874495365740081);
    // Enter the recipient phone number
    const recipient_number =917796305801;
    const sent_text_message = wa.messages.text(
      { body: "Hello world" },
      recipient_number
    );
    const res = await sent_text_message.then((res) => {
      return res;
    });

    return NextResponse.json({ message:res });
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
};
