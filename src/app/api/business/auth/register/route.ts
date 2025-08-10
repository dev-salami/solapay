/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/business/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateToken, hashPassword } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessLogo,
      business_name,
      email,
      phone,
      address,
      businessType,
      account_number,
      bankId,
      accountName,
      password,
    } = body;

    // Validate required fields
    if (
      !business_name ||
      !email ||
      !phone ||
      !address ||
      !businessType ||
      !account_number ||
      !bankId ||
      !accountName ||
      !password
    ) {
      return NextResponse.json(
        { message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if business already exists
    const existingBusiness = await prisma.business.findUnique({
      where: { email },
    });

    if (existingBusiness) {
      return NextResponse.json(
        { message: "Business with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create business
    const business = await prisma.business.create({
      data: {
        businessLogo,
        business_name,
        email,
        phone,
        address,
        businessType,
        account_number,
        bankId,
        accountName,
        password: hashedPassword,
      },
    });

    // Generate token
    const token = generateToken({
      id: business.id,
      business_email: business.email,
      role: "business",
    });

    // Remove password from response
    const { password: _, ...businessData } = business;

    return NextResponse.json(
      {
        message: "Business registered successfully",
        data: {
          business: businessData,
          token,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
