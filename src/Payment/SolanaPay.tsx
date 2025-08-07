/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Cluster, clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
// import usdcLogo from "../../../../public/assets/usd-coin-usdc-logo.svg";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import bs58 from "bs58";
import {
  encodeURL,
  createQR,
  findReference,
  FindReferenceError,
} from "@solana/pay";
import BigNumber from "bignumber.js";
import { validateTransfer } from "./validateTransferUtils";
import {
  CONNECTION_URL,
  USD_TO_NAIRA,
  MAINNET_ENVIRONMENT,
  TREASURY_WALLET,
  USDC_ADDRESS,
} from "./constant";
import { Input } from "@/components/ui/input";
import { FaRegCopy } from "react-icons/fa6";
import { Loader2 } from "lucide-react";

const SolanaPay = ({
  url,
  paymentReference,
  usdValue,
}: {
  url: URL | null;
  paymentReference: PublicKey | null;

  usdValue: number;
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const maxRetries = 120; // 20 minutes × 6 checks per minute
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(false);

  const generateBase58Encoded32ByteArray = () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    console.log(bytes);
    const base58String = bs58.encode(bytes);
    return base58String;
  };

  async function establishConnection(
    cluster: Cluster = MAINNET_ENVIRONMENT ? "mainnet-beta" : "devnet"
  ): Promise<Connection> {
    const endpoint = clusterApiUrl(cluster);
    const connection = new Connection(CONNECTION_URL, "confirmed");
    const version = await connection.getVersion();
    return connection;
  }

  useEffect(() => {
    if (!url) return;

    const qrCode = createQR(url, 250);
    const element = document.getElementById("qr-code");
    if (element) {
      element.innerHTML = "";
      qrCode.append(element);
      setTimeout(() => {
        setAutoCheckEnabled(true);
      }, 60000);
    }
  }, []);

  const scheduleNextCheck = () => {
    if (!autoCheckEnabled || retryCount >= maxRetries || false) return;
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }

    // Schedule next check in 10 seconds
    intervalRef.current = setTimeout(() => {
      if (retryCount >= maxRetries) {
        // Stop checking after 20 minutes (120 attempts)
        setAutoCheckEnabled(false);
        toast.info("Automatic verification timeout reached");
        return;
      }

      checkStatus();
    }, 10000);
  };

  const checkStatus = async () => {
    if (isVerifying) return;

    setIsVerifying(true);
    setIsLoading(true);

    try {
      // Only show loading toast for manual verification
      if (!autoCheckEnabled) {
        toast.loading("Verifying Transaction");
      }

      const connection = await establishConnection();
      if (!paymentReference) return;

      const signatureInfo = await findReference(connection, paymentReference, {
        finality: "finalized",
      });

      console.log("\n 🖌  Signature found: ", signatureInfo);

      // Validate the transfer
      const trxnRes = await validateTransfer(
        connection,
        signatureInfo.signature,
        {
          recipient: new PublicKey(TREASURY_WALLET),
          amount: BigNumber(usdValue),
          splToken: new PublicKey(USDC_ADDRESS),
        }
      );

      // Update state based on validation result
      if (trxnRes) {
        setAutoCheckEnabled(false);
        setRetryCount(0);
        setIsLoading(false);
        toast.success("Transaction verified successfully");
        // do offramp related stuff
      } else {
        // Only show toast for manual checks
        if (!autoCheckEnabled) {
          toast.info("Could not validate transaction");
        }
      }

      console.log(trxnRes);
      return false;
    } catch (error) {
      // Handle errors
      if (error instanceof FindReferenceError) {
        console.log("Transaction not found yet");
        setRetryCount((prev) => prev + 1);
        // Only show toast on manual check, not auto-checks
        if (!autoCheckEnabled) {
          toast.info("Transaction not found");
        }
      } else {
        console.error("Transaction verification error:", error);
        // Only show toast on manual check, not auto-checks
        if (!autoCheckEnabled) {
          toast.error("Verification failed");
        }
      }
      return false;
    } finally {
      setIsVerifying(false);

      // For auto-checks, schedule next check after this one completes
      if (autoCheckEnabled) {
        scheduleNextCheck();
      }

      // Dismiss toast
      setTimeout(() => {
        toast.dismiss();
      }, 3000);
    }
  };

  useEffect(() => {
    // Clean up function for any scheduled timeout
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Start first check when auto-checking is enabled
    if (autoCheckEnabled && paymentReference && !isVerifying) {
      checkStatus();
    } else if (!autoCheckEnabled && intervalRef.current) {
      // Stop checking if disabled
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  }, [autoCheckEnabled, paymentReference]);

  return (
    <div className="px-6 pb-6 overflow-x-scroll max-h-96 overflow-y-scroll">
      <div className="flex   flex-col gap-6 mt-4 items-center">
        <div>
          <div
            id="qr-code"
            className="flex justify-center border border-gray-200"
          ></div>
          {paymentReference && (
            <div className="space-y-2 mt-2">
              <Button
                className="w-full py-1.5"
                variant="default"
                disabled={isVerifying || !paymentReference || isLoading}
                onClick={checkStatus}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Awaiting Payment...
                  </>
                ) : (
                  "VERIFY PAYMENT"
                )}
              </Button>
              <div className="text-xs text-gray-500 text-center">
                {autoCheckEnabled
                  ? `Auto-verifying (${retryCount}/${maxRetries} checks)`
                  : paymentReference
                  ? "Auto-verification starting soon..."
                  : ""}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolanaPay;
interface TransactionCardProps {
  amount: number;
  onSubmitSignature?: (signature: string) => void;
  isLoading?: boolean;
  refreshBalance: () => void;
  handleClose: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  amount,
  refreshBalance,
  handleClose,

  isLoading = false,
}) => {
  const [signature, setSignature] = useState("");

  const onSubmitSignature = async (sig: string) => {
    // const res = await uploadSignatureRequest({
    //   signature: sig,
    // });
    // if (res.isOk()) {
    //   toast.success("Transaction verified successfully");
    //   refreshBalance();
    //   handleClose();
    // } else {
    // }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signature.trim()) return;
    let extractedSignature = signature.trim();
    if (extractedSignature.includes("explorer.solana.com/tx/")) {
      const match = extractedSignature.match(/\/tx\/([A-Za-z0-9]+)/);
      if (match && match[1]) {
        extractedSignature = match[1];
      }
    } else if (
      extractedSignature.includes("/") &&
      extractedSignature.length > 64
    ) {
      const parts = extractedSignature.split("/");
      extractedSignature = parts[parts.length - 1];
      if (extractedSignature.includes("?")) {
        extractedSignature = extractedSignature.split("?")[0];
      }
    }
    onSubmitSignature?.(extractedSignature);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-sm mx-auto  ">
      <hr className="sm:hidden sm:mb-0 mb-4" />
      <div className="">
        <div className="space-y-6">
          {/* Amount Section */}
          <div>
            <p className="text-gray-500 text-sm mb-1">Amount</p>
            <div className="flex justify-between items-center">
              <p className="text-2xl font-semibold">{amount} USDC</p>
              <button
                onClick={() => {
                  copyToClipboard(amount.toString());
                  toast.info("Amount copied to clipbaord");
                  setTimeout(() => {
                    toast.dismiss();
                  }, 2000);
                }}
                className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                title="Copy amount"
              >
                <FaRegCopy className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Address Section */}
          <div>
            <p className="text-gray-500 text-sm mb-1">To this address</p>
            <div className="flex items-center gap-2">
              <p className="text-gray-800 font-medium break-all">
                {TREASURY_WALLET}
              </p>
              <button
                onClick={() => {
                  copyToClipboard(TREASURY_WALLET);
                  toast.info("Address copied to clipbaord");
                  setTimeout(() => {
                    toast.dismiss();
                  }, 2000);
                }}
                className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                title="Copy address"
              >
                <FaRegCopy className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Transaction Signature Input */}
          <form onSubmit={handleSubmit} className="space-y-3 ">
            <Input
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Paste transaction signature or URL"
              className="w-full"
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !signature.trim()}
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
              ) : (
                "Submit Transaction"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
