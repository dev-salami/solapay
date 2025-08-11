export interface Bank {
  id: string;
  name: string;
  code: string;
}

export interface RegisterFormData {
  businessLogo: string | null;
  business_name: string;
  business_email: string;
  phone: string;
  address: string;
  businessType: string;
  account_number: string;
  bankId: string;
  accountName: string;
  password: string;
  confirmPassword: string;
}

export interface User extends RegisterFormData {
  id: number;
  createdAt: string;
}
export interface LoginFormData {
  business_email: string;
  password: string;
}

export interface Disbursement {
  trackingId: string;
  business_name: string;
  business_email: string;
  amount_naira: number;
  amount_usd: number;
  rate: number;
  currency: string;
  recipientAccountNumber: string;
  recipientBankCode: string;
  description: string;
}

export interface Transaction {
  id: string;
  trackingId: string;
  business_name: string;
  business_email: string;
  email: string;
  status: TransactionStatus;

  amount_naira: number;
  amount_usd: number;
  recipientAccountNumber: string;
  recipientBankCode: string;
  senderWalletAddress: string;
  createdAt: string;
}

// types/transaction.ts
export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  FINALIZED = "FINALIZED",
  RESOLVED = "RESOLVED",
}

export enum TransactionStage {
  INITIATING = "initiating",
  DISBURSING = "disbursing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface Transaction {
  id: string;
  trackingId: string;
  business_name: string;
  email: string;
  amount_naira: number;
  amount_usd: number;
  status: TransactionStatus;
  recipientAccountNumber: string;
  recipientBankCode: string;
  senderWalletAddress: string;
  createdAt: string;
  updatedAt: string;
  businessId: string;
  business: {
    business_name: string;
    email: string;
    isActive: boolean;
  };
}

export interface TransactionApiResponse {
  message: string;
  found: boolean;
  data?: Transaction;
}

export interface StageConfig {
  stage: TransactionStage;
  label: string;
  description: string;
  icon: "loading" | "clock" | "check" | "x";
}
