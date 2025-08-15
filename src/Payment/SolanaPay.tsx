/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect } from "react";

import { createQR } from "@solana/pay";

const SolanaPay = ({
  url,
}: {
  url: URL | null;

  usdValue: number;
}) => {
  useEffect(() => {
    if (!url) return;

    const qrCode = createQR(url, 250);
    const element = document.getElementById("qr-code");
    if (element) {
      element.innerHTML = "";
      qrCode.append(element);
    }
  }, []);

  return (
    <div className="px-6 pb-6 overflow-x-scroll max-h-96 overflow-y-scroll">
      <div className="flex   flex-col gap-6 mt-4 items-center">
        <div>
          <div
            id="qr-code"
            className="flex justify-center border border-gray-200"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SolanaPay;
