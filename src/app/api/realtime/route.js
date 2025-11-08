import { connectToDatabase } from "@/config/MongoDB";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const collectionName = searchParams.get("collection");

    if (!collectionName) {
      return new Response("Collection name required", { status: 400 });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection(collectionName);

    const changeStream = collection.watch([], { fullDocument: "updateLookup" });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        changeStream.on("change", (change) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(change.fullDocument)}\n\n`)
          );
        });

        changeStream.on("error", (error) => {
          console.error("ChangeStream Error:", error);
          controller.error(error);
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
  } catch (error) {
    console.error("Realtime API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
