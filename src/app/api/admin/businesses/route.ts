// app/api/admin/businesses/route.ts
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            {
              business_name: { contains: search, mode: "insensitive" as const },
            },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          businessLogo: true,
          business_name: true,
          email: true,
          phone: true,
          address: true,
          businessType: true,
          account_number: true,
          bankId: true,
          accountName: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { transactions: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.business.count({ where }),
    ]);

    return NextResponse.json({
      message: "Businesses retrieved successfully",
      data: {
        businesses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Admin businesses error:", error);
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
