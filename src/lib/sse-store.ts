// lib/sse-store.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

// Define a custom type for SSE writers
type SSEWriter = {
  write: (data: any) => void;
  close: () => void;
};

// Global store for active connections by transaction reference
// Using globalThis to ensure it persists across module reloads in development
const getConnectionStore = () => {
  if (!globalThis.__sseConnections) {
    globalThis.__sseConnections = new Map<string, Set<SSEWriter>>();
  }
  return globalThis.__sseConnections as Map<string, Set<SSEWriter>>;
};

// Extend globalThis type
declare global {
  var __sseConnections: Map<string, Set<SSEWriter>> | undefined;
}

export const sseStore = {
  addConnection: (transactionRef: string, writer: SSEWriter) => {
    const connections = getConnectionStore();
    if (!connections.has(transactionRef)) {
      connections.set(transactionRef, new Set());
    }
    connections.get(transactionRef)!.add(writer);
    console.log(
      `Added connection for ${transactionRef}. Total connections:`,
      connections.size
    );
  },

  removeConnection: (transactionRef: string, writer: SSEWriter) => {
    const connections = getConnectionStore();
    connections.get(transactionRef)?.delete(writer);
    if (connections.get(transactionRef)?.size === 0) {
      connections.delete(transactionRef);
    }
    console.log(
      `Removed connection for ${transactionRef}. Total connections:`,
      connections.size
    );
  },

  getConnections: (transactionRef: string): Set<SSEWriter> | undefined => {
    const connections = getConnectionStore();
    return connections.get(transactionRef);
  },

  getAllConnections: () => {
    return getConnectionStore();
  },

  broadcastToTransaction: (
    transactionReference: string,
    transactionData: any
  ) => {
    const connections = getConnectionStore();
    console.log(
      "Broadcasting to connections:",
      connections.size,
      "for transaction:",
      transactionReference
    );

    if (connections.has(transactionReference)) {
      const subscribers = connections.get(transactionReference)!;
      const message = {
        type: "transaction_update",
        transactionReference,
        data: transactionData,
      };

      console.log(
        `Found ${subscribers.size} subscribers for transaction ${transactionReference}`
      );

      subscribers.forEach((writer) => {
        try {
          writer.write(message);
        } catch (error) {
          console.error("Error writing to SSE stream:", error);
          subscribers.delete(writer);
        }
      });

      console.log(
        `Broadcasted update for transaction ${transactionReference} to ${subscribers.size} subscribers`
      );
    } else {
      console.log(
        `No subscribers found for transaction ${transactionReference}`
      );
      console.log("Available transactions:", Array.from(connections.keys()));
    }
  },
};
