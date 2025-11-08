import { connectToDatabase } from "@/config/MongoDB";

let changeStream;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const collectionName = searchParams.get("collection") || "sessions";

  const { db } = await connectToDatabase();
  const collection = db.collection(collectionName); // replace with your collection name

  // Start MongoDB Change Stream Only Once
  if (!changeStream) {
    changeStream = collection.watch();
  }
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      changeStream.on("change", (change) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(change)}\n\n`)
        );
      });
    },
    cancel() {
      changeStream.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
