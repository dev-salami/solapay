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
  amount: number; // Amount in the smallest unit (e.g., kobo)
  currency: string;
  recipientAccountNumber: string;
  recipientBankCode: string;
  description: string;
}
