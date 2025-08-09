export interface Bank {
  id: string;
  name: string;
  code: string;
}

export interface RegisterFormData {
  businessLogo: string | null;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  businessType: string;
  accountNumber: string;
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
  email: string;
  password: string;
}

export interface Disbursement {
  trackingId: string;
  businessName: string;
  businessEmail: string;
  amountNaira: number;
  amountUSD: number;
  rate: number;
  currency: string;
  recipientAccountNumber: string;
  recipientBankCode: string;
  description: string;
}

export interface Transaction {
  trackingId: string;
  businessName: string;
  email: string;
  amount_naira: number;
  amount_usd: number;
  recipientAccountNumber: string;
  recipientBankCode: string;
  senderWalletAddress: string;
}
