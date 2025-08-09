// app/api/admin/transactions/[id]/retry-disbursement/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateRequest } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params
    const { id } = await params;

    const user = authenticateRequest(request);

    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        business: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.status === "COMPLETED") {
      return NextResponse.json(
        { message: "Transaction is already completed" },
        { status: 400 }
      );
    }

    if (!transaction.business.isActive) {
      return NextResponse.json(
        { message: "Business account is inactive" },
        { status: 403 }
      );
    }

    // Update transaction status to pending before retry
    await prisma.transaction.update({
      where: { id },
      data: { status: "PENDING" },
    });

    try {
      // Trigger disbursement
      const baseUrl = request.nextUrl.origin;
      const disbursementResponse = await fetch(`${baseUrl}/api/disbursement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId: id,
        }),
      });

      if (!disbursementResponse.ok) {
        throw new Error("Disbursement failed");
      }

      const disbursementData = await disbursementResponse.json();

      return NextResponse.json({
        message: "Disbursement retry successful",
        data: disbursementData,
      });
    } catch (disbursementError) {
      console.error("Disbursement retry error:", disbursementError);

      // Update transaction status back to failed
      await prisma.transaction.update({
        where: { id },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        {
          message: "Disbursement retry failed",
          error:
            disbursementError instanceof Error
              ? disbursementError.message
              : String(disbursementError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Retry disbursement error:", error);
    if (
      error instanceof Error &&
      (error.message === "No token provided" ||
        error.message === "Invalid token")
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
