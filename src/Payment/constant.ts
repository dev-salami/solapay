import { PublicKey } from "@solana/web3.js";

export const NEXTAUTH_SECRET = "G906luzCfVGz70WUDufC7wb6wDR7bJJDufVF1hu2Mkwa";
export const NEXTAUTH_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : " https://dealshare.xyz";

export const MAINNET_ENVIRONMENT = false; // "devnet" |  "mainnet-beta"

export const CONNECTION_URL = MAINNET_ENVIRONMENT
  ? "https://mainnet.helius-rpc.com/?api-key=ef0bff29-b19f-47d8-8ff5-856b998e51a6"
  : "https://devnet.helius-rpc.com/?api-key=ef0bff29-b19f-47d8-8ff5-856b998e51a6";
export const TREASURY_WALLET = "H7DNE1wz4FfRxyP5eG9T4NEs4WVmniZ88PEvqAsocSdS";
const USDC_MAINNET = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);
const USDC_DEVNET = new PublicKey(
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

export const USD_TO_NAIRA = 1523;
export const USDC_ADDRESS = MAINNET_ENVIRONMENT ? USDC_MAINNET : USDC_DEVNET;
// export const TREASURY_WALLET = "HR3FLto9pAATMceVxAkDKFUoxbZGt4hwwXHPkvTCSGQp";

export const constructReceiptUrl = (signature: string) => {
  const url = `https://explorer.solana.com/tx/${signature}?cluster=${
    MAINNET_ENVIRONMENT ? "" : "devnet"
  }`;
  return url;
};
