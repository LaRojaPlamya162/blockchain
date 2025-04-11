"use client";

import { useState } from "react";
import { useScaffoldContract } from "~~/hooks/scaffold-eth/useScaffoldContract";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth/useScaffoldContractRead";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth/useScaffoldContractWrite";

import { useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";

export default function TokenVendorPage() {
  const { address } = useAccount();
  const [ethAmount, setEthAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");

  const tokensPerEth = 100;

  const buyAmount = ethAmount ? BigInt(Number(ethAmount) * tokensPerEth) : 0n;
  const sellAmount = tokenAmount ? BigInt(tokenAmount) : 0n;
  const ethToReceive = sellAmount / BigInt(tokensPerEth);

  const { data: vendor } = useScaffoldContract({ contractName: "Vendor" });
  const { data: tokenBalance } = useScaffoldContractRead({
    contractName: "YourToken",
    functionName: "balanceOf",
    args: [address],
  });

  const { writeAsync: buyTokens } = useScaffoldContractWrite({
    contractName: "Vendor",
    functionName: "buyTokens",
    value: ethAmount ? parseEther(ethAmount) : undefined,
  });

  const { writeAsync: approveTokens } = useScaffoldContractWrite({
    contractName: "YourToken",
    functionName: "approve",
    args: [vendor?.address || "0x0", sellAmount],
  });

  const { writeAsync: sellTokens } = useScaffoldContractWrite({
    contractName: "Vendor",
    functionName: "sellTokens",
    args: [sellAmount],
  });

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">🎟 Token Vendor</h1>

      {/* MUA TOKEN */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Mua Token</h2>
        <input
          type="number"
          placeholder="Số ETH"
          value={ethAmount}
          onChange={e => setEthAmount(e.target.value)}
          className="p-2 border rounded w-full mb-2"
        />
        <p>Sẽ nhận: <b>{buyAmount.toString()}</b> token</p>
        <button
          onClick={() => buyTokens()}
          className="bg-green-600 text-white py-2 px-4 rounded w-full hover:bg-green-700 mt-2"
        >
          Mua Token
        </button>
      </div>

      {/* BÁN TOKEN */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Bán Token</h2>
        <input
          type="number"
          placeholder="Số token"
          value={tokenAmount}
          onChange={e => setTokenAmount(e.target.value)}
          className="p-2 border rounded w-full mb-2"
        />
        <p>Sẽ nhận: <b>{formatEther(ethToReceive)}</b> ETH</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => approveTokens()}
            className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 w-1/2"
          >
            Approve
          </button>
          <button
            onClick={() => sellTokens()}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 w-1/2"
          >
            Bán Token
          </button>
        </div>
      </div>

      {/* THÔNG TIN */}
      <div className="mt-6 text-gray-600 text-sm">
        <p>💰 Số dư của bạn: <b>{tokenBalance?.toString() || "0"}</b> YTK</p>
        <p>🏢 Vendor address: <b>{vendor?.address}</b></p>
      </div>
    </div>
  );
}
