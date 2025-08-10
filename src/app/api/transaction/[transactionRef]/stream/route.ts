// app/api/transaction/[transactionRef]/stream/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { sseStore } from "@/lib/sse-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionRef: string }> }
) {
  const { transactionRef } = await params;

  console.log(`New SSE connection request for transaction: ${transactionRef}`);

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Set up SSE headers
      const encoder = new TextEncoder();

      // Send initial connection message
      const data = `data: ${JSON.stringify({
        type: "connected",
        transactionReference: transactionRef,
        message: "Connected to transaction updates",
      })}\n\n`;

      controller.enqueue(encoder.encode(data));

      // Create a custom writer for this connection
      const writer = {
        write: (data: any) => {
          try {
            const sseData = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          } catch (error) {
            console.error("Error writing to SSE stream:", error);
          }
        },
        close: () => {
          try {
            controller.close();
          } catch (error) {
            console.log(error);
            // Stream might already be closed
          }
        },
      };

      // Add to shared store
      sseStore.addConnection(transactionRef, writer);

      console.log(`Client subscribed to transaction: ${transactionRef}`);
      console.log("Current connections:", sseStore.getAllConnections().size);

      // Clean up on disconnect
      request.signal.addEventListener("abort", () => {
        sseStore.removeConnection(transactionRef, writer);
        writer.close();
        console.log(`Client disconnected from transaction: ${transactionRef}`);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}

// Export the broadcast function for use in other routes
// export function broadcastTransactionUpdate(
//   transactionReference: string,
//   transactionData: any
// ) {
//   return sseStore.broadcastToTransaction(transactionReference, transactionData);
// }
