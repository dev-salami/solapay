"use client";
import SolanaPay from "@/Payment/SolanaPay";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";
import TransactionTracker from "@/component/TransactionTracker";

function Payment() {
  const { reference } = useParams();

  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  return (
    <div className="flex md:flex-row flex-col justify-center items-center w-fit mx-auto mt-40">
      <SolanaPay url={url as URL | null} usdValue={1} />
      <TransactionTracker
        className="w-fit mx-auto"
        trackingId={reference as string}
      />
    </div>
  );
}

export default Payment;
