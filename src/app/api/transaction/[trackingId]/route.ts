// app/api/transaction/[trackingId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await params;

    if (!trackingId) {
      return NextResponse.json(
        { message: "Tracking ID is required" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: {
        trackingId: trackingId,
      },
      include: {
        business: {
          select: {
            business_name: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        {
          message: "Transaction not found",
          found: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Transaction retrieved successfully",
      found: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Transaction fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
