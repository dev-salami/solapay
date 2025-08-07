"use client";
import SolanaPay from "@/Payment/SolanaPay";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";
import { PublicKey } from "@solana/web3.js";

function Payment() {
  const { reference } = useParams();
  // get title from query parameters
  // https://explorer.solana.com/tx/3pN4y3QY5tGsPx6UFH6RuG8ytmNFMe5MQJSb8ustWBM7qTZmWHxRZNfoBp3s8bsJYbocijKYq1UuJqhSp5LzmQqN?cluster=devnet
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  return (
    <div>
      {" "}
      {
        <SolanaPay
          url={url as URL | null}
          paymentReference={reference ? new PublicKey(reference) : null}
          usdValue={1}
        />
      }{" "}
      {reference}
    </div>
  );
}

export default Payment;
