// app/api/socket/route.js

import { getSocketServer } from "@/actions/getSocketServer";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(req) {
  const server = globalThis._server || req?.socket?.server;

  if (!server) {
    return new Response("Server not ready", { status: 500 });
  }

  // Start Socket.IO once
  await getSocketServer(server);

  return new Response("Socket.IO server running ✅", { status: 200 });
}
