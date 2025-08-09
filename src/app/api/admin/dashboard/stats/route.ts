// app/api/admin/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateRequest } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const user = authenticateRequest(request);

    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const [
      totalBusinesses,
      activeBusinesses,
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      totalVolume,
      todayTransactions,
    ] = await Promise.all([
      prisma.business.count(),
      prisma.business.count({ where: { isActive: true } }),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: "COMPLETED" } }),
      prisma.transaction.count({ where: { status: "PENDING" } }),
      prisma.transaction.count({ where: { status: "FAILED" } }),
      prisma.transaction.aggregate({
        where: { status: "COMPLETED" },
        _sum: {
          amount_naira: true,
          amount_usd: true,
        },
      }),
      prisma.transaction.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      include: {
        business: {
          select: {
            businessName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      message: "Dashboard stats retrieved successfully",
      data: {
        overview: {
          totalBusinesses,
          activeBusinesses,
          inactiveBusinesses: totalBusinesses - activeBusinesses,
          totalTransactions,
          completedTransactions,
          pendingTransactions,
          failedTransactions,
          totalVolumeNaira: totalVolume._sum.amount_naira || 0,
          totalVolumeUSD: totalVolume._sum.amount_usd || 0,
          todayTransactions,
        },
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string" &&
      ((error as { message: string }).message === "No token provided" ||
        (error as { message: string }).message === "Invalid token")
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
