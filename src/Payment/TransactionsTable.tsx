/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { Eye } from "lucide-react";
import { TransactionResponse } from "@/interfaces/responses";
import { constructReceiptUrl } from "@/constants";

const TransactionTable = ({
  data,
  isLoading,
  isError,
}: {
  data: TransactionResponse[] | null;
  isLoading: boolean;
  isError: boolean;
}) => {
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Function to format transaction type
  const formatTransactionType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="w-full ">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
        <div className="min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-white">
                <th
                  scope="col"
                  className="py-4 px-6 text-left text-sm font-semibold text-gray-800"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="py-4 px-6 text-left text-sm font-semibold text-gray-800"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="py-4 px-6 text-left text-sm font-semibold text-gray-800"
                >
                  USDC Amount
                </th>
                <th
                  scope="col"
                  className="py-4 px-6 text-left text-sm font-semibold text-gray-800"
                >
                  Credits
                </th>
                {/* <th
                  scope="col"
                  className="py-4 px-6 text-right text-sm font-semibold text-gray-800"
                ></th> */}
              </tr>
            </thead>

            {isLoading ? (
              <TableLoadingSkeleton rowCount={3} />
            ) : isError ? (
              <TableFetchError />
            ) : !data || data.length === 0 ? (
              <TableNotFound />
            ) : (
              <tbody className="bg-white divide-y divide-gray-100">
                {data.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm text-gray-700 whitespace-nowrap">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="py-4 px-6 text-sm whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.transactionType === "deposit"
                            ? "bg-green-100 text-green-800"
                            : transaction.transactionType === "usdc_to_credits"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {formatTransactionType(transaction.transactionType)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {transaction.usdc_amount.toFixed(2)} USDC
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700 whitespace-nowrap">
                      {transaction.credits}
                    </td>
                    {/* <td className="py-4 px-6 text-sm text-right whitespace-nowrap">
                      <a
                        href={constructReceiptUrl(transaction.id)}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium inline-flex items-center gap-1 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </a>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton
export function TableLoadingSkeleton({ rowCount = 3 }) {
  return (
    <tbody className="bg-white divide-y divide-gray-100">
      {Array(rowCount)
        .fill(0)
        .map((_, index) => (
          <tr key={index}>
            <td className="py-4 px-6">
              <div className="h-5 bg-gray-200 rounded-md w-32 animate-pulse"></div>
            </td>
            <td className="py-4 px-6">
              <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
            </td>
            <td className="py-4 px-6">
              <div className="h-5 bg-gray-200 rounded-md w-24 animate-pulse"></div>
            </td>
            <td className="py-4 px-6">
              <div className="h-5 bg-gray-200 rounded-md w-12 animate-pulse"></div>
            </td>
            <td className="py-4 px-6 text-right">
              <div className="h-5 bg-gray-200 rounded-md w-24 ml-auto animate-pulse"></div>
            </td>
          </tr>
        ))}
    </tbody>
  );
}

// Error State
export function TableFetchError() {
  return (
    <tbody>
      <tr>
        <td colSpan={5} className="py-16">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Error Loading Transactions
            </h3>
            <p className="text-gray-500 max-w-md">
              We encountered a problem while fetching transaction data. Please
              try again.
            </p>
          </div>
        </td>
      </tr>
    </tbody>
  );
}

// Empty State
export function TableNotFound() {
  return (
    <tbody>
      <tr>
        <td colSpan={5} className="py-16">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              No Transactions Found
            </h3>
            <p className="text-gray-500 max-w-md">
              {`   You don't have any transactions yet. They will appear here once
              you make a deposit or purchase.`}
            </p>
          </div>
        </td>
      </tr>
    </tbody>
  );
}

export default TransactionTable;
