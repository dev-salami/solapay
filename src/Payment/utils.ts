/* eslint-disable @typescript-eslint/no-explicit-any */
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import { TREASURY_WALLET, USDC_ADDRESS } from "./constant";
import { encodeURL, TransferRequestURLFields } from "@solana/pay";
import BigNumber from "bignumber.js";
import { Base64Utils } from "./base64-utils";
import { Disbursement } from "@/interfaces";

export const generateReference = () => {
  return new PublicKey(generateBase58Encoded32ByteArray()).toString();
};

export const generateQRURL = (data: TransferRequestURLFields) => {
  const url = encodeURL(data);

  return url;
};

export const generateQRData = ({
  reference,
  amountToPay,
  label,
  message,
  memo,
}: {
  reference: any;
  amountToPay: number;
  label: string;
  message: string;
  memo: string;
}): TransferRequestURLFields => {
  return {
    label: label,
    message: message,
    memo: memo,
    splToken: USDC_ADDRESS,
    amount: BigNumber(amountToPay),
    reference: reference,
    recipient: new PublicKey(TREASURY_WALLET),
  };
};

const generateBase58Encoded32ByteArray = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  console.log(bytes);
  const base58String = bs58.encode(bytes);
  return base58String;
};

export const generateDisbursementData = ({
  reference,
  amountUSD,
  amountNaira,
  businessName,
  businessEmail,
  recipientAccountNumber,
  recipientBankCode,
  description,
  rate,
}: {
  reference: PublicKey;
  amountUSD: number;
  amountNaira: number;
  businessName: string;
  businessEmail: string;
  recipientAccountNumber: string;
  recipientBankCode: string;
  description: string;
  rate: number;
}): Disbursement => {
  return {
    trackingId: reference.toString(),
    amountUSD: amountUSD,
    amountNaira: amountNaira,
    businessName: businessName,
    businessEmail: businessEmail,
    recipientAccountNumber: recipientAccountNumber || "",
    recipientBankCode: recipientBankCode || "",
    rate: rate,
    currency: "NGN",
    description: description || "",
  };
};

export const encodeDisbursementData = (data: Disbursement): string => {
  const memo = Base64Utils.encode(JSON.stringify(data));
  return memo;
};
