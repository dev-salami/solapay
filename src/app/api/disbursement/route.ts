/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/disbursement/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Mock disbursement API - replace with your actual disbursement service
async function callDisbursementAPI(transactionData: any) {
  // Replace with your actual disbursement API call
  const response = await fetch(process.env.DISBURSEMENT_API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DISBURSEMENT_API_KEY}`,
    },
    body: JSON.stringify({
      account_number: transactionData.recipientAccountNumber,
      bankCode: transactionData.recipientBankCode,
      amount: transactionData.amount_naira,
      reference: transactionData.trackingId,
      narration: `Payment from ${transactionData.senderWalletAddress}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Disbursement API error: ${response.status}`);
  }

  return await response.json();
}

export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json(
        { message: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Get transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.status !== "PENDING") {
      return NextResponse.json(
        { message: "Transaction is not pending" },
        { status: 400 }
      );
    }

    try {
      // Call disbursement API
      const disbursementResult = await callDisbursementAPI(transaction);

      // Update transaction status to completed
      const updatedTransaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "COMPLETED" },
      });

      return NextResponse.json({
        message: "Disbursement successful",
        data: {
          transaction: updatedTransaction,
          disbursementResult,
        },
      });
    } catch (disbursementError) {
      console.error("Disbursement failed:", disbursementError);

      // Update transaction status to failed
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        {
          message: "Disbursement failed",
          error:
            disbursementError instanceof Error
              ? disbursementError.message
              : String(disbursementError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Disbursement handler error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
