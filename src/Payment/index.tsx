/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import ReceiptTable from "./ReceiptTable";
import TransactionTable from "./TransactionsTable";
import BalanceDisplay from "./BalanceDisplay";
import {
  fetchPaymentBankAccount,
  fetchUserPaymentsReceipts,
  fetchUserTransactions,
  uploadSignatureRequest,
} from "@/helpers/requests";
import {
  BankAccount,
  TransactionResponse,
  USDC_PaymentReceiptResponse,
} from "@/interfaces/responses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentModal from "./PaymentModal";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { HelioCheckout, HelioEmbedConfig } from "@heliofi/checkout-react";

function Payments() {
  const searchParams = useSearchParams();
  const [bankAccount, setBankAccount] = React.useState<BankAccount | null>(
    null
  );
  const [paymentReceipts, setPaymentReceipts] = useState<
    USDC_PaymentReceiptResponse[] | null
  >(null);
  const [transactions, setTransactions] = useState<
    TransactionResponse[] | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showHelioPayBox, setShowHelioPayBox] = useState<boolean>(true);

  const [isError, setIsError] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("deposits");

  const [isPaymentModalOpen, setIsPaymentEditModalOpen] = useState(true);

  const openPaymentTab = searchParams.get("open-payment-modal") || false;

  const getBalancesAndTransactions = async () => {
    setIsLoading(true);
    try {
      const transactionReceiptsResponse = await fetchUserTransactions();
      const paymentReceiptsResponse = await fetchUserPaymentsReceipts();
      const bankAccountResponse = await fetchPaymentBankAccount();

      if (
        transactionReceiptsResponse.isOk() &&
        paymentReceiptsResponse.isOk() &&
        bankAccountResponse.isOk()
      ) {
        setTransactions(transactionReceiptsResponse.value);
        setPaymentReceipts(paymentReceiptsResponse.value);
        setBankAccount(bankAccountResponse.value);
        setIsLoading(false);
        console.log(
          transactionReceiptsResponse.value,
          paymentReceiptsResponse.value,
          bankAccountResponse.value
        );
      }
    } catch (error: any) {
      setIsError(true);
      console.log(error);
    }
  };
  useEffect(() => {
    setIsPaymentEditModalOpen(openPaymentTab === "true" ? true : false);
  }, [openPaymentTab]);

  useEffect(() => {
    getBalancesAndTransactions();
  }, []);

  return (
    <div>
      <PaymentModal
        open={isPaymentModalOpen}
        handleClose={() => setIsPaymentEditModalOpen(false)}
        refreshBalance={getBalancesAndTransactions}
      />

      <div className="p-6 space-y-4  ">
        {/* <Button
          className="mb-4"
          onClick={() => setIsPaymentEditModalOpen(true)}
        >
          Add to balance
        </Button> */}

        <BalanceDisplay
          data={bankAccount}
          isLoading={isLoading}
          isError={isError}
          getBalancesAndTransactions={getBalancesAndTransactions}
        />
      </div>

      <Tabs
        defaultValue="deposits"
        className="w-full px-6"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="grid w-full grid-cols-2 mb-4 ">
          <TabsTrigger value="deposits" className="font-medium">
            Deposits
          </TabsTrigger>
          <TabsTrigger value="transactions" className="font-medium">
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="deposits"
          className={activeTab === "deposits" ? "block" : "hidden"}
        >
          <ReceiptTable
            data={paymentReceipts}
            isLoading={isLoading}
            isError={isError}
          />
        </TabsContent>

        <TabsContent
          value="transactions"
          className={activeTab === "transactions" ? "block" : "hidden"}
        >
          <TransactionTable
            data={transactions}
            isLoading={isLoading}
            isError={isError}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Payments;
