// app/api/webhook/helius/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, TransactionStatus } from "@prisma/client";
import {
  parseSolanaTransaction,
  SolanaTransfer,
} from "@/Payment/helius-webhook-utils";
import { Base64Utils } from "@/Payment/base64-utils";
import { Disbursement } from "@/interfaces";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Extract transaction data from Helius webhook
    const webhookData: SolanaTransfer = await request.json();
    const parsedWebhookData = parseSolanaTransaction(webhookData);

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
      businessName: memoData.businessName,
      email: memoData.businessEmail,
      amount_naira: memoData.amountNaira,
      amount_usd: memoData.amountUSD,
      recipientAccountNumber: memoData.recipientAccountNumber,
      recipientBankCode: memoData.recipientBankCode,
      senderWalletAddress: parsedWebhookData.walletAddress,
      status: TransactionStatus.PENDING,
      business: {
        connect: { email: memoData.businessEmail },
      },
    };

    // Find the business
    const business = await prisma.business.findUnique({
      where: { email: memoData.businessEmail },
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

    // Trigger disbursement
    try {
      const baseUrl = request.nextUrl.origin;
      const disbursementResponse = await fetch(`${baseUrl}/api/disbursement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId: transaction.id,
        }),
      });

      if (!disbursementResponse.ok) {
        throw new Error("Disbursement failed");
      }
    } catch (disbursementError) {
      console.error("Disbursement error:", disbursementError);
      // Update transaction status to failed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.FAILED },
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
