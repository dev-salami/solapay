import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle, Clock, Wifi, WifiOff } from "lucide-react";

// Type definitions
interface Transaction {
  id: number;
  trackingId: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  amount_naira: number;
  amount_usd: number;
  business_name: string;
  createdAt?: string;
  updatedAt?: string;
  message?: string;
}

interface Message {
  id: number;
  text: string;
  type: "success" | "error" | "warning" | "info";
  timestamp: string;
}

interface SSEMessage {
  type: "connected" | "transaction_update" | "error";
  transactionReference?: string;
  data?: Transaction;
  message?: string;
}

type ConnectionStatus = "disconnected" | "connected" | "error";

const TransactionMonitor = ({ reference }: { reference: string }) => {
  const [transactionRef, setTransactionRef] = useState<string>(reference);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTransaction, setCurrentTransaction] =
    useState<Transaction | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  const connectToTransaction = () => {
    if (!transactionRef.trim()) {
      addMessage("Please enter a transaction reference", "warning");
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `/api/transaction/${encodeURIComponent(
      transactionRef.trim()
    )}/stream`;

    try {
      eventSourceRef.current = new EventSource(url);

      eventSourceRef.current.onopen = () => {
        setConnectionStatus("connected");
        setIsSubscribed(true);
        addMessage(
          `Connected to transaction: ${transactionRef.trim()}`,
          "success"
        );
      };

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data: SSEMessage = JSON.parse(event.data);
          handleSSEMessage(data);
        } catch (error) {
          console.error("Error parsing SSE message:", error);
          addMessage("Error parsing message from server", "error");
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.error("SSE error:", error);
        setConnectionStatus("error");
        setIsSubscribed(false);
        addMessage("Connection error occurred", "error");
      };
    } catch (error) {
      console.error("Failed to create EventSource:", error);
      setConnectionStatus("error");
      addMessage("Failed to connect to server", "error");
    }
  };

  const handleSSEMessage = (data: SSEMessage) => {
    switch (data.type) {
      case "connected":
        addMessage(
          `Subscribed to transaction: ${data.transactionReference}`,
          "success"
        );
        break;

      case "transaction_update":
        setCurrentTransaction(data.data!);
        addMessage(
          `Transaction ${data.data!.status}: ${data.data!.message}`,
          data.data!.status === "SUCCESS"
            ? "success"
            : data.data!.status === "FAILED"
            ? "error"
            : "info"
        );
        break;

      case "error":
        addMessage(`Error: ${data.message}`, "error");
        break;

      default:
        addMessage(`Received: ${JSON.stringify(data)}`, "info");
    }
  };

  const addMessage = (text: string, type: Message["type"] = "info") => {
    const message = {
      id: Date.now(),
      text,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setConnectionStatus("disconnected");
    setIsSubscribed(false);
    setCurrentTransaction(null);
    addMessage("Disconnected from server", "info");
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "FAILED":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "SUCCESS":
        return "text-green-600 bg-green-50 border-green-200";
      case "FAILED":
        return "text-red-600 bg-red-50 border-red-200";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getMessageTypeColor = (type: Message["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Transaction Monitor
        </h1>
        <p className="text-gray-600">
          Real-time transaction status updates via Server-Sent Events
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Connection Status
          </h2>
          <div
            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              connectionStatus === "connected"
                ? "bg-green-100 text-green-800"
                : connectionStatus === "error"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {connectionStatus === "connected" ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span className="capitalize">{connectionStatus}</span>
          </div>
        </div>
      </div>

      {/* Transaction Subscription */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Subscribe to Transaction
        </h2>
        <div className="flex space-x-3">
          <input
            type="text"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            placeholder="Enter transaction reference"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === "Enter" && connectToTransaction()}
          />
          <button
            onClick={connectToTransaction}
            disabled={isSubscribed}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubscribed ? "Connected" : "Connect"}
          </button>
          <button
            onClick={disconnect}
            disabled={!isSubscribed}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Disconnect
          </button>
        </div>
        {isSubscribed && (
          <div className="mt-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-800">
            ✓ Listening for updates on transaction: {transactionRef}
          </div>
        )}
      </div>

      {/* Current Transaction Status */}
      {currentTransaction && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Current Transaction
          </h2>
          <div
            className={`border rounded-lg p-4 ${getStatusColor(
              currentTransaction.status
            )}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getStatusIcon(currentTransaction.status)}
                <span className="font-semibold text-lg">
                  {currentTransaction.status}
                </span>
              </div>
              <span className="text-sm font-mono bg-white bg-opacity-50 px-2 py-1 rounded">
                ID: {currentTransaction.id}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Tracking ID:</strong> {currentTransaction.trackingId}
              </div>
              <div>
                <strong>Business:</strong> {currentTransaction.business_name}
              </div>
              <div>
                <strong>Amount (NGN):</strong> ₦
                {currentTransaction.amount_naira?.toLocaleString()}
              </div>
              <div>
                <strong>Amount (USD):</strong> $
                {currentTransaction.amount_usd?.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Log */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Activity Log</h2>
          <button
            onClick={clearMessages}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Clear
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No messages yet</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg border text-sm ${getMessageTypeColor(
                  message.type
                )}`}
              >
                <div className="flex items-center justify-between">
                  <span>{message.text}</span>
                  <span className="text-xs opacity-75">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionMonitor;
