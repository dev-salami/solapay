"use client";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import {
  encodeDisbursementData,
  generateDisbursementData,
  generateQRData,
  generateQRURL,
  generateReference,
} from "@/Payment/utils";
import { toast } from "sonner";
import { USD_TO_NAIRA } from "@/Payment/constant";
import { useBusinessData } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { BANK_LIST } from "@/Payment/bank";
export default function Home() {
  return (
    <>
      <QRGeneratorComponent />
    </>
  );
}

const QRGeneratorComponent = () => {
  const { businessData } = useBusinessData();
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Calculate USD equivalent in real-time
  const usdAmount = amount
    ? (parseFloat(amount) / USD_TO_NAIRA).toFixed(2)
    : "0.00";

  const handleCreateQR = () => {
    if (!businessData) {
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.warning("Please enter a valid amount");
      return;
    }
    const reference = generateReference();

    const memo = generateDisbursementData({
      reference: new PublicKey(reference),
      amount_naira: parseFloat(amount),
      amount_usd: parseFloat(usdAmount),
      business_name: businessData.business_name,
      business_email: businessData.email,
      rate: USD_TO_NAIRA,
      recipientAccountNumber: businessData.account_number,
      recipientBankCode: businessData.bankId,
      description: `Payment for ${businessData.business_name}`,
    });

    console.log(memo);

    const memoEncoded = encodeDisbursementData(memo);

    const data = generateQRData({
      reference: new PublicKey(reference),
      amountToPay: parseFloat(usdAmount), // Amount in USD
      label: businessData.business_name,
      message: `Payment for ${businessData.business_name}`,
      memo: memoEncoded,
    });

    console.log("QR Data:", data);

    const url = generateQRURL(data);

    window.location.href = `/pay/${data.reference}?url=${encodeURIComponent(
      url.toString()
    )}`;
  };

  // Function to get bank name from bank ID
  const getBankName = (bankId: string) => {
    const bank = BANK_LIST.find((b) => b.code === bankId);
    return bank ? bank.name : "Unknown Bank";
  };

  // Show loading spinner during hydration
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 size={30} className="  animate-spin" />
        </div>
      </div>
    );
  }

  // If no active user, show registration prompt
  if (!businessData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <h2 className="text-xl font-semibold mb-4">Not Registered</h2>
            <p className="text-gray-600 text-center mb-6">
              You are not registered. Please proceed to signup to access QR
              generation.
            </p>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Go to signin
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* User Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <Image
              width={64}
              height={64}
              src={`https://res.cloudinary.com/drphqvmfe/image/upload/v1754203697/jeet/venmo-svgrepo-com_pvksx4.svg`}
              alt="Business Logo"
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1 space-y-2">
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Business Name
                </Label>
                <p className="text-lg font-semibold">
                  {businessData.business_name}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Account Name
                </Label>
                <p className="text-base">{businessData.accountName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Bank
                  </Label>
                  <p className="text-base">
                    {getBankName(businessData.bankId)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Account Number
                  </Label>
                  <p className="text-base font-mono">
                    {businessData.account_number}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Generator Card */}
      <Card>
        <CardHeader>
          <CardTitle>Generate QR Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount (NGN)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount in Naira"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
              min="0"
              step="0.01"
            />
          </div>

          {amount && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-600">
                USD Equivalent
              </Label>
              <p className="text-lg font-semibold text-green-600">
                ${usdAmount} USD
              </p>
              <p className="text-xs text-gray-500">
                Conversion rate: 1 USD = {USD_TO_NAIRA} NGN
              </p>
            </div>
          )}

          <Button
            onClick={handleCreateQR}
            className="w-full"
            disabled={!amount || parseFloat(amount) <= 0 || !businessData}
          >
            Create QR
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
