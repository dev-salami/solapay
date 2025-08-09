// app/api/admin/businesses/[id]/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateRequest } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(
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

    const business = await prisma.business.findUnique({
      where: { id },
      select: {
        id: true,
        businessName: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!business) {
      return NextResponse.json(
        { message: "Business not found" },
        { status: 404 }
      );
    }

    // Get transaction summary
    const [
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      totalVolume,
    ] = await Promise.all([
      prisma.transaction.count({
        where: { businessId: id },
      }),
      prisma.transaction.count({
        where: { businessId: id, status: "COMPLETED" },
      }),
      prisma.transaction.count({
        where: { businessId: id, status: "PENDING" },
      }),
      prisma.transaction.count({
        where: { businessId: id, status: "FAILED" },
      }),
      prisma.transaction.aggregate({
        where: { businessId: id, status: "COMPLETED" },
        _sum: {
          amount_naira: true,
          amount_usd: true,
        },
      }),
    ]);

    return NextResponse.json({
      message: "Business summary retrieved successfully",
      data: {
        business,
        summary: {
          totalTransactions,
          completedTransactions,
          pendingTransactions,
          failedTransactions,
          totalVolumeNaira: totalVolume._sum.amount_naira || 0,
          totalVolumeUSD: totalVolume._sum.amount_usd || 0,
        },
      },
    });
  } catch (error) {
    console.error("Business summary error:", error);
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
