// app/api/webhook/helius/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, TransactionStatus } from "@prisma/client";
import {
  parseSolanaTransaction,
  SolanaTransfer,
} from "@/Payment/helius-webhook-utils";
import { Base64Utils } from "@/Payment/base64-utils";
import { Disbursement } from "@/interfaces";
import { sseStore } from "@/lib/sse-store";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log("Webhook received");

    // Extract transaction data from Helius webhook
    const webhookData: SolanaTransfer = await request.json();
    const parsedWebhookData = parseSolanaTransaction({
      transaction: webhookData,
    });

    console.log(
      "Processing transaction with reference:",
      parsedWebhookData.transactionReference
    );

    const memoStringified = Base64Utils.decode<string>(
      parsedWebhookData.memo || ""
    );
    const memoData: Disbursement = JSON.parse(memoStringified);
    if (!memoData) {
      return NextResponse.json(
        { message: "Missing required transaction data" },
        { status: 400 }
      );
    }

    const new_transaction = {
      trackingId: parsedWebhookData.transactionReference,
      business_name: memoData.business_email,
      email: memoData.business_email,
      amount_naira: memoData.amount_naira,
      amount_usd: memoData.amount_usd,
      recipientAccountNumber: memoData.recipientAccountNumber,
      recipientBankCode: memoData.recipientBankCode,
      senderWalletAddress: parsedWebhookData.walletAddress,
      status: TransactionStatus.PENDING,
      business: {
        connect: { email: memoData.business_email },
      },
    };

    // Find the business
    const business = await prisma.business.findUnique({
      where: { email: memoData.business_email },
    });

    if (!business) {
      return NextResponse.json(
        { message: "Business not found" },
        { status: 404 }
      );
    }

    if (!business.isActive) {
      return NextResponse.json(
        { message: "Business account is inactive" },
        { status: 403 }
      );
    }

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: new_transaction,
    });

    console.log("Transaction created:", transaction.id);

    // Broadcast transaction creation to SSE subscribers
    console.log("Broadcasting transaction creation...");
    sseStore.broadcastToTransaction(parsedWebhookData.transactionReference, {
      id: transaction.id,
      trackingId: transaction.trackingId,
      status: transaction.status,
      amount_naira: transaction.amount_naira,
      amount_usd: transaction.amount_usd,
      businessName: transaction.business_name,
      createdAt: transaction.createdAt,
      message: "Transaction created successfully",
    });

    // Trigger disbursement with 4/5 success rate simulation
    try {
      // Simulate 4/5 success rate (80% success)
      const isSuccess = Math.random() < 0.8;

      console.log(
        "Disbursement simulation result:",
        isSuccess ? "SUCCESS" : "FAILED"
      );

      if (isSuccess) {
        const updatedTransaction = await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: TransactionStatus.COMPLETED },
        });

        console.log("Broadcasting success update...");
        // Broadcast success update
        sseStore.broadcastToTransaction(
          parsedWebhookData.transactionReference,
          {
            id: updatedTransaction.id,
            trackingId: updatedTransaction.trackingId,
            status: updatedTransaction.status,
            amount_naira: updatedTransaction.amount_naira,
            amount_usd: updatedTransaction.amount_usd,
            business_name: updatedTransaction.business_name,
            updatedAt: updatedTransaction.updatedAt,
            message: "Transaction completed successfully",
          }
        );
      } else {
        throw new Error("Simulated disbursement failure");
      }
    } catch (disbursementError) {
      console.error("Disbursement error:", disbursementError);

      // Update transaction status to failed
      const failedTransaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.FAILED },
      });

      console.log("Broadcasting failure update...");
      // Broadcast failure update
      sseStore.broadcastToTransaction(parsedWebhookData.transactionReference, {
        id: failedTransaction.id,
        trackingId: failedTransaction.trackingId,
        status: failedTransaction.status,
        amount_naira: failedTransaction.amount_naira,
        amount_usd: failedTransaction.amount_usd,
        businessName: failedTransaction.business_name,
        updatedAt: failedTransaction.updatedAt,
        message: "Transaction failed during disbursement",
      });
    }

    return NextResponse.json({
      message: "Transaction processed successfully",
      data: { transactionId: transaction.id },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
