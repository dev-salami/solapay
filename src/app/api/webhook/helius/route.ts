// app/api/webhook/helius/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Extract transaction data from Helius webhook
    const webhookData = await request.json();

    // Basic parsing - customize this based on actual Helius format
    const {
      trackingId,
      businessEmail,
      amount_usd,
      amount_naira,
      senderWalletAddress,
      // Add other fields as needed from memo data
    } = webhookData;

    if (
      !trackingId ||
      !businessEmail ||
      !amount_usd ||
      !amount_naira ||
      !senderWalletAddress
    ) {
      return NextResponse.json(
        { message: "Missing required transaction data" },
        { status: 400 }
      );
    }

    // Find the business
    const business = await prisma.business.findUnique({
      where: { email: businessEmail },
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
      data: {
        trackingId,
        businessName: business.businessName,
        email: business.email,
        amount_naira,
        amount_usd,
        recipientAccountNumber: business.accountNumber,
        recipientBankCode: business.bankId,
        senderWalletAddress,
        businessId: business.id,
        status: "PENDING",
      },
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
        data: { status: "FAILED" },
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
