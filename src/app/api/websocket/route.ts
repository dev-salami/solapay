/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/websocket/route.ts
import { NextRequest } from "next/server";
import WebSocket from "ws";

// Store active WebSocket connections by transaction reference
const connections = new Map<string, Set<WebSocket>>();

// Create WebSocket server instance (this will be shared)
let wss: WebSocket.Server | null = null;

function initializeWebSocketServer() {
  if (!wss) {
    wss = new WebSocket.Server({ port: 3000 });

    wss.on("connection", (ws, request) => {
      console.log("New WebSocket connection");

      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message.toString());

          if (data.type === "subscribe" && data.transactionReference) {
            // Add this connection to the transaction reference group
            if (!connections.has(data.transactionReference)) {
              connections.set(data.transactionReference, new Set());
            }
            connections.get(data.transactionReference)!.add(ws);

            // Send confirmation
            ws.send(
              JSON.stringify({
                type: "subscribed",
                transactionReference: data.transactionReference,
                message: `Subscribed to updates for transaction: ${data.transactionReference}`,
              })
            );

            console.log(
              `Client subscribed to transaction: ${data.transactionReference}`
            );
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Invalid message format",
            })
          );
        }
      });

      ws.on("close", () => {
        // Remove this connection from all transaction reference groups
        for (const [reference, wsSet] of connections.entries()) {
          wsSet.delete(ws);
          if (wsSet.size === 0) {
            connections.delete(reference);
          }
        }
        console.log("WebSocket connection closed");
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });
    });

    console.log("WebSocket server initialized on port 8080");
  }
}

// Function to broadcast updates to subscribers
export function broadcastTransactionUpdate(
  transactionReference: string,
  transactionData: any
) {
  if (connections.has(transactionReference)) {
    const subscribers = connections.get(transactionReference)!;
    const message = JSON.stringify({
      type: "transaction_update",
      transactionReference,
      data: transactionData,
    });

    subscribers.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(message);
      }
    });

    console.log(
      `Broadcasted update for transaction ${transactionReference} to ${subscribers.size} subscribers`
    );
  }
}

// Initialize WebSocket server when this module is loaded
initializeWebSocketServer();

// HTTP endpoint for WebSocket upgrade (Next.js App Router)
export async function GET(request: NextRequest) {
  return new Response(
    "WebSocket server is running on port 8080. Connect via ws://localhost:8080",
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );
}
