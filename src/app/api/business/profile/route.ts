/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/business/profile/route.ts
import { authenticateRequest } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const user = authenticateRequest(request);

    if (user.role !== "business") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Get profile
    const business = await prisma.business.findUnique({
      where: { id: user.id },
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
      },
    });

    if (!business) {
      return NextResponse.json(
        { message: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Profile retrieved successfully",
        data: business,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Profile error:", error);
    if (
      error.message === "No token provided" ||
      error.message === "Invalid token"
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

export async function PUT(request: NextRequest) {
  try {
    const user = authenticateRequest(request);

    if (user.role !== "business") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Update profile
    const {
      businessLogo,
      business_name,
      phone,
      address,
      businessType,
      account_number,
      bankId,
      accountName,
    } = await request.json();

    const updatedBusiness = await prisma.business.update({
      where: { id: user.id },
      data: {
        ...(businessLogo !== undefined && { businessLogo }),
        ...(business_name && { business_name }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(businessType && { businessType }),
        ...(account_number && { account_number }),
        ...(bankId && { bankId }),
        ...(accountName && { accountName }),
      },
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
      },
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        data: updatedBusiness,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Profile error:", error);
    if (
      error.message === "No token provided" ||
      error.message === "Invalid token"
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
