/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Loader2, Clock, Check, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  StageConfig,
  Transaction,
  TransactionApiResponse,
  TransactionStage,
  TransactionStatus,
} from "@/interfaces";

interface TransactionTrackerProps {
  trackingId: string;
  onStatusChange?: (
    status: TransactionStatus,
    transaction?: Transaction
  ) => void;
  className?: string;
}

const STAGE_CONFIG: Record<TransactionStage, StageConfig> = {
  [TransactionStage.INITIATING]: {
    stage: TransactionStage.INITIATING,
    label: "Initiating",
    description: "Processing your transaction request",
    icon: "loading",
  },
  [TransactionStage.DISBURSING]: {
    stage: TransactionStage.DISBURSING,
    label: "Disbursing",
    description: "Transferring funds to recipient",
    icon: "clock",
  },
  [TransactionStage.COMPLETED]: {
    stage: TransactionStage.COMPLETED,
    label: "Completed",
    description: "Transaction completed successfully",
    icon: "check",
  },
  [TransactionStage.FAILED]: {
    stage: TransactionStage.FAILED,
    label: "Failed",
    description: "Transaction could not be completed",
    icon: "x",
  },
};

const STAGE_ORDER = [
  TransactionStage.INITIATING,
  TransactionStage.DISBURSING,
  TransactionStage.COMPLETED,
];

export default function TransactionTracker({
  trackingId,
  onStatusChange,
  className,
}: TransactionTrackerProps) {
  const [currentStage, setCurrentStage] = useState<TransactionStage>(
    TransactionStage.INITIATING
  );
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const pollingRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const hasToastedRef = useRef(false);
  const maxRetries = 3;

  // Map transaction status to stage
  const getStageFromStatus = (status: TransactionStatus): TransactionStage => {
    switch (status) {
      case TransactionStatus.PENDING:
        return TransactionStage.DISBURSING;
      case TransactionStatus.COMPLETED:
      case TransactionStatus.FINALIZED:
      case TransactionStatus.RESOLVED:
        return TransactionStage.COMPLETED;
      case TransactionStatus.FAILED:
        return TransactionStage.FAILED;
      default:
        return TransactionStage.INITIATING;
    }
  };

  const fetchTransaction = async () => {
    try {
      setError(null);

      const response = await fetch(`/api/transaction/${trackingId}`);
      const data: TransactionApiResponse = await response.json();

      if (!response.ok) {
        if (response.status === 404 && !data.found) {
          // Transaction not found yet, continue polling with longer interval
          return;
        }
        throw new Error(data.message || "Failed to fetch transaction");
      }

      if (data.found && data.data) {
        setTransaction(data.data);
        const newStage = getStageFromStatus(data.data.status);
        setCurrentStage(newStage);
        setRetryCount(0);

        // Call onStatusChange callback
        onStatusChange?.(data.data.status, data.data);

        // Stop polling and show toast for final states
        if (
          newStage === TransactionStage.COMPLETED ||
          newStage === TransactionStage.FAILED
        ) {
          setIsPolling(false);

          if (!hasToastedRef.current) {
            hasToastedRef.current = true;
            if (newStage === TransactionStage.COMPLETED) {
              toast.success("Transaction completed successfully!", {
                description: `Amount: ₦${data.data.amount_naira.toLocaleString()}`,
              });
            } else {
              toast.error("Transaction failed", {
                description: "Please contact support if you need assistance",
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching transaction:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setRetryCount((prev) => prev + 1);

      if (retryCount >= maxRetries) {
        setIsPolling(false);
        toast.error("Failed to fetch transaction status", {
          description: "Please try again or contact support",
        });
      }
    }
  };

  // Start polling
  useEffect(() => {
    if (!isPolling || !trackingId) return;

    const poll = () => {
      fetchTransaction();

      // Set next polling interval based on whether transaction is found
      const interval = transaction ? 5000 : 10000; // 5s if found, 10s if not found

      pollingRef.current = setTimeout(poll, interval);
    };

    // Start immediately
    poll();

    // Cleanup on unmount or when polling stops
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, [isPolling, trackingId, transaction, retryCount]);

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    setIsPolling(true);
    hasToastedRef.current = false;
  };

  const getStageIcon = (stage: TransactionStage, isActive: boolean) => {
    const config = STAGE_CONFIG[stage];
    const baseClasses = "h-5 w-5";
    const activeClasses = isActive ? "text-blue-600" : "text-gray-400";

    switch (config.icon) {
      case "loading":
        return isActive ? (
          <Loader2 className={`${baseClasses} ${activeClasses} animate-spin`} />
        ) : (
          <Clock className={`${baseClasses} ${activeClasses}`} />
        );
      case "clock":
        return isActive ? (
          <Loader2 className={`${baseClasses} ${activeClasses} animate-spin`} />
        ) : (
          <Clock className={`${baseClasses} ${activeClasses}`} />
        );
      case "check":
        return <Check className={`${baseClasses} text-green-600`} />;
      case "x":
        return <X className={`${baseClasses} text-red-600`} />;
      default:
        return <Clock className={`${baseClasses} ${activeClasses}`} />;
    }
  };

  const getCurrentStageIndex = () => {
    if (currentStage === TransactionStage.FAILED) {
      return STAGE_ORDER.findIndex((s) => s === TransactionStage.DISBURSING);
    }
    return STAGE_ORDER.findIndex((s) => s === currentStage);
  };

  const getStageStatus = (stageIndex: number) => {
    const currentIndex = getCurrentStageIndex();

    if (
      currentStage === TransactionStage.FAILED &&
      stageIndex >= currentIndex
    ) {
      return stageIndex === currentIndex ? "failed" : "pending";
    }

    if (stageIndex < currentIndex) return "completed";
    if (stageIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Transaction Status</span>
          {transaction && (
            <Badge variant="outline">{transaction.trackingId}</Badge>
          )}
        </CardTitle>
        {transaction && (
          <div className="text-sm text-gray-600">
            <p>Business: {transaction.business.business_name}</p>
            <p>
              Amount: ₦{transaction.amount_naira.toLocaleString()} ($
              {transaction.amount_usd.toFixed(2)})
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm mb-2">{error}</p>
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {STAGE_ORDER.map((stage, index) => {
            const config = STAGE_CONFIG[stage];
            const status = getStageStatus(index);
            const isActive = status === "active";
            const isCompleted = status === "completed";
            const isFailed = status === "failed";

            return (
              <div key={stage} className="flex items-center space-x-4">
                {/* Stage Icon */}
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 
                    ${
                      isCompleted
                        ? "bg-green-100 border-green-600"
                        : isFailed
                        ? "bg-red-100 border-red-600"
                        : isActive
                        ? "bg-blue-100 border-blue-600"
                        : "bg-gray-100 border-gray-300"
                    }
                  `}
                >
                  {isFailed ? (
                    <X className="h-5 w-5 text-red-600" />
                  ) : isCompleted ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    getStageIcon(stage, isActive)
                  )}
                </div>

                {/* Stage Content */}
                <div className="flex-1">
                  <h3
                    className={`
                      font-medium 
                      ${
                        isCompleted
                          ? "text-green-700"
                          : isFailed
                          ? "text-red-700"
                          : isActive
                          ? "text-blue-700"
                          : "text-gray-500"
                      }
                    `}
                  >
                    {config.label}
                  </h3>
                  <p className="text-sm text-gray-500">{config.description}</p>
                </div>

                {/* Connecting Line */}
                {index < STAGE_ORDER.length - 1 && (
                  <div className="absolute left-9 mt-12 w-0.5 h-8 bg-gray-300" />
                )}
              </div>
            );
          })}

          {/* Show failed stage if transaction failed */}
          {currentStage === TransactionStage.FAILED && (
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 bg-red-100 border-red-600">
                <X className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-red-700">
                  {STAGE_CONFIG[TransactionStage.FAILED].label}
                </h3>
                <p className="text-sm text-gray-500">
                  {STAGE_CONFIG[TransactionStage.FAILED].description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* {isPolling && (
          <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Checking status...
          </div>
        )} */}
      </CardContent>
    </Card>
  );
}
