import { SolanaTransfer } from "./helius-webhook-utils";

export const transfer_transaction: SolanaTransfer[] = [
  {
    blockTime: 1754731870,
    indexWithinBlock: 10,
    meta: {
      err: null,
      fee: 80000,
      innerInstructions: [],
      loadedAddresses: { readonly: [], writable: [] },
      logMessages: [
        "Program ComputeBudget111111111111111111111111111111 invoke [1]",
        "Program ComputeBudget111111111111111111111111111111 success",
        "Program ComputeBudget111111111111111111111111111111 invoke [1]",
        "Program ComputeBudget111111111111111111111111111111 success",
        "Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr invoke [1]",
        'Program log: Memo (len 288): "IntcInRyYWNraW5nSWRcIjpcIjRxdXRBeHg5d1pHSHY5UWtudTRUZGZXQVJ2REJLVzRLSHZwckdtODNiQnl4XCIsXCJhbW91bnRcIjo0MDAsXCJjdXJyZW5jeVwiOlwiTkdOXCIsXCJyZWNpcGllbnRBY2NvdW50TnVtYmVyXCI6XCIwNTA0MzI1NzY1XCIsXCJyZWNpcGllbnRCYW5rQ29kZVwiOlwiMDcwMTUwXCIsXCJkZXNjcmlwdGlvblwiOlwiUGF5bWVudCBmb3IgY2l3YXRcIn0i"',
        "Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr consumed 102665 of 136296 compute units",
        "Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr success",
        "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [1]",
        "Program log: Instruction: TransferChecked",
        "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 6462 of 33631 compute units",
        "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      ],
      postBalances: [
        996600737, 2039280, 2039280, 0, 168551902685, 1, 553498881, 4136087700,
      ],
      postTokenBalances: [
        {
          accountIndex: 1,
          mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          owner: "H7DNE1wz4FfRxyP5eG9T4NEs4WVmniZ88PEvqAsocSdS",
          programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          uiTokenAmount: {
            amount: "13590000",
            decimals: 6,
            uiAmount: 13.59,
            uiAmountString: "13.59",
          },
        },
        {
          accountIndex: 2,
          mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          owner: "6BU22Rzfw4PpZMjW2ffRc3Snzn6znVSiBUufhxtWv8N2",
          programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          uiTokenAmount: {
            amount: "14410000",
            decimals: 6,
            uiAmount: 14.41,
            uiAmountString: "14.41",
          },
        },
      ],
      preBalances: [
        996680737, 2039280, 2039280, 0, 168551902685, 1, 553498881, 4136087700,
      ],
      preTokenBalances: [
        {
          accountIndex: 1,
          mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          owner: "H7DNE1wz4FfRxyP5eG9T4NEs4WVmniZ88PEvqAsocSdS",
          programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          uiTokenAmount: {
            amount: "13330000",
            decimals: 6,
            uiAmount: 13.33,
            uiAmountString: "13.33",
          },
        },
        {
          accountIndex: 2,
          mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          owner: "6BU22Rzfw4PpZMjW2ffRc3Snzn6znVSiBUufhxtWv8N2",
          programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          uiTokenAmount: {
            amount: "14670000",
            decimals: 6,
            uiAmount: 14.67,
            uiAmountString: "14.67",
          },
        },
      ],
      rewards: [],
    },
    slot: 399973704,
    transaction: {
      message: {
        accountKeys: [
          "6BU22Rzfw4PpZMjW2ffRc3Snzn6znVSiBUufhxtWv8N2",
          "4yyT4jTVZo9EwTFt8DKfTBZ1rmLfmvdKbxD4PReKSFDv",
          "B1fVsJVmxo78BiVr8AhFCVTnVarzoGaC1fsgBJoL54q7",
          "4qutAxx9wZGHv9Qknu4TdfWARvDBKW4KHvprGm83bByx",
          "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          "ComputeBudget111111111111111111111111111111",
          "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
          "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        ],
        addressTableLookups: null,
        header: {
          numReadonlySignedAccounts: 0,
          numReadonlyUnsignedAccounts: 5,
          numRequiredSignatures: 1,
        },
        instructions: [
          { accounts: [], data: "3nyTCb16PWvj", programIdIndex: 5 },
          { accounts: [], data: "HsbtFy", programIdIndex: 5 },
          {
            accounts: [],
            data: "21Ucm3s5471GFTU6AQZA4UCaD2dSR6LCfPWixhHyZPsep7wp1F4z735HuTqZ8iZngxT5PEhV4shNzWUZJNcuLewniwSCg8D5eBdPrMrRGZoyAMUHbhmsLdpHUUvh5sPwaTuSu96XsDLsiZMVc2bkaanfuZW6JJ4YxR4MW9yCB4BhR1LNa2YxuCnmrbQsr7MmXzkVvaifJ38WpWdL3GdZNyH2NLv3yzTzpAcEhpL9RofFybQy9mFDJWZVrhmjkkCAJjPSa2tX2pEpYnJz5zsLk2bNB9YJYB37E5AKKAFcACTzxm9oFAytxrY8nTHrNqfMSf8APeBfrBSCfL3noTaQzqSzjPwWxvF391AqXAX6P4hxkmPJg2tk7QK3y5Ceu43UGjGCDGpTb6",
            programIdIndex: 6,
          },
          {
            accounts: [2, 4, 1, 0, 0, 3],
            data: "i9nNA5Cdp9ksw",
            programIdIndex: 7,
          },
        ],
        recentBlockhash: "2djJvLJrzePDv1f5PfedoyFWZ8HMDwKomQ9cYwrWkF6R",
      },
      signatures: [
        "DGEyvS75cQtXHSDmP8N73KXXXkwgS3LdFu4HRwppMTiUUPrNTd54mUQMdEKr8SXXMXNKhy6ZV6X1M3UCgJcLACz",
      ],
    },
    version: "legacy",
  },
];

export const trxn = [
  {
    blockTime: 1754766269,
    indexWithinBlock: 0,
    meta: {
      err: null,
      fee: 3190540,
      innerInstructions: [],
      loadedAddresses: { readonly: [], writable: [] },
      logMessages: [
        "Program ComputeBudget111111111111111111111111111111 invoke [1]",
        "Program ComputeBudget111111111111111111111111111111 success",
        "Program ComputeBudget111111111111111111111111111111 invoke [1]",
        "Program ComputeBudget111111111111111111111111111111 success",
        "Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr invoke [1]",
        'Program log: Memo (len 444): "IntcInRyYWNraW5nSWRcIjpcIkFUSnNSb2tzQkVMZTlrTmZMYWVlM3NpUnFyOWVENHB1dFZLU0VtSllLZHVSXCIsXCJhbW91bnRfdXNkXCI6MC4yLFwiYW1vdW50X25haXJhXCI6MzAwLFwiYnVzaW5lc3NfbmFtZVwiOlwiY2l3YXRcIixcImJ1c2luZXNzX2VtYWlsXCI6XCJzYWxhbWlraGFsaWwwMjFAZ21haWwuY29tXCIsXCJyZWNpcGllbnRBY2NvdW50TnVtYmVyXCI6XCIwNTA0MzI1NzY1XCIsXCJyZWNpcGllbnRCYW5rQ29kZVwiOlwiMDAwMDEzXCIsXCJyYXRlXCI6MTUyMyxcImN1cnJlbmN5XCI6XCJOR05cIixcImRlc2NyaXB0aW9uXCI6XCJQYXltZW50IGZvciBjaXdhdFwifSI="',
        "Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr consumed 157465 of 204796 compute units",
        "Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr success",
        "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [1]",
        "Program log: Instruction: TransferChecked",
        "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 6462 of 47331 compute units",
        "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      ],
      postBalances: [
        993330197, 2039280, 2039280, 168551902685, 0, 1, 553498881, 4136087700,
      ],
      postTokenBalances: [
        {
          accountIndex: 1,
          mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          owner: "H7DNE1wz4FfRxyP5eG9T4NEs4WVmniZ88PEvqAsocSdS",
          programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          uiTokenAmount: {
            amount: "14090000",
            decimals: 6,
            uiAmount: 14.09,
            uiAmountString: "14.09",
          },
        },
        {
          accountIndex: 2,
          mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          owner: "6BU22Rzfw4PpZMjW2ffRc3Snzn6znVSiBUufhxtWv8N2",
          programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          uiTokenAmount: {
            amount: "13910000",
            decimals: 6,
            uiAmount: 13.91,
            uiAmountString: "13.91",
          },
        },
      ],
      preBalances: [
        996520737, 2039280, 2039280, 168551902685, 0, 1, 553498881, 4136087700,
      ],
      preTokenBalances: [
        {
          accountIndex: 1,
          mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          owner: "H7DNE1wz4FfRxyP5eG9T4NEs4WVmniZ88PEvqAsocSdS",
          programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          uiTokenAmount: {
            amount: "13890000",
            decimals: 6,
            uiAmount: 13.89,
            uiAmountString: "13.89",
          },
        },
        {
          accountIndex: 2,
          mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          owner: "6BU22Rzfw4PpZMjW2ffRc3Snzn6znVSiBUufhxtWv8N2",
          programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          uiTokenAmount: {
            amount: "14110000",
            decimals: 6,
            uiAmount: 14.11,
            uiAmountString: "14.11",
          },
        },
      ],
      rewards: [],
    },
    slot: 400060806,
    transaction: {
      message: {
        accountKeys: [
          "6BU22Rzfw4PpZMjW2ffRc3Snzn6znVSiBUufhxtWv8N2",
          "4yyT4jTVZo9EwTFt8DKfTBZ1rmLfmvdKbxD4PReKSFDv",
          "B1fVsJVmxo78BiVr8AhFCVTnVarzoGaC1fsgBJoL54q7",
          "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          "ATJsRoksBELe9kNfLaee3siRqr9eD4putVKSEmJYKduR",
          "ComputeBudget111111111111111111111111111111",
          "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
          "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        ],
        addressTableLookups: null,
        header: {
          numReadonlySignedAccounts: 0,
          numReadonlyUnsignedAccounts: 5,
          numRequiredSignatures: 1,
        },
        instructions: [
          { accounts: [], data: "3hPfm479dhbD", programIdIndex: 5 },
          { accounts: [], data: "F7ZFgK", programIdIndex: 5 },
          {
            accounts: [],
            data: "2CYUC8R74ZMDyP4AthiscdZ5TD2Y2nscMauEVatiuxXzvLixcX4VvVmFTJqH3ysiNPW4Dy7Zm7pWug6Q3zf1B4Z1G4SWZhsHMT3PAkV7WYCURUmboqrtzFmcgTmsBh8mciREx8aidr1GXm4QkyNKkMP5Ekyp3QGUktsQK6uEoSr33Nj33yWUPeyBrNc6FZUdiJ1FZLLGTS3FBEv3G6osCWfFsHs87t9JQ1KPsXq92LL3yr6kTErbFT9KhG8LX7ZvtYLkdvtiZqmASGqvFCStm4vvaKkN5PFuKzd1d13Ftwomb6aBDnNS8pxivuua2XWwgz95SmDhEejHBWCP6Rye8mV6Tdmeh4EcdXLg4NkdruNCEtHBs7jBMtz1eQ3xfiX2kB9UA79Zo9s3FXLHQtiJe1ckyN2t6VaJsGaZSQ6ZTo8EQwirFyj1dqGwnMzNv7JisBVML4HKywPynctDraqwEVSQnP6oC8H1gjJRgRQ7dEkGRzGkP6nqKenaWkx2uZaaoWv2TZhX8uKrDP4hhu7e7WoV2NpUe5VTN4CbbZEG2D3VJV7jptXMj74MpgCka3iajNCwRUKsvvTr458YZsM7v88GS2Ub5nU",
            programIdIndex: 6,
          },
          {
            accounts: [2, 3, 1, 0, 0, 4],
            data: "gvEa5XuUAomFB",
            programIdIndex: 7,
          },
        ],
        recentBlockhash: "CiAZGZkPkRKbhpuw9c2bjtXn1tt6rchnKtipogEZMwzL",
      },
      signatures: [
        "xNfY1SBTLfxhJ3KJuzzzERTc1rJ3k6BgqigSUYiq4ArJ7w4KsUyWEYQ7d96v6M4VEj52Ge5MJeWdeLjgHCt2pxx",
      ],
    },
    version: "legacy",
  },
];
