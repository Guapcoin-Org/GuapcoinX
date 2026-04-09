#!/usr/bin/env node
/**
 * Deploy GuapDIDRegistry to Guapcoin EVM
 * Usage: node scripts/deploy-registry.mjs
 * Requires: GUAPCOIN_PRIVATE_KEY env var
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createWalletClient, createPublicClient, http, defineChain, encodeDeployData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import solc from "solc";

const __dirname = dirname(fileURLToPath(import.meta.url));

const guapcoin = defineChain({
  id: 71111,
  name: "Guapcoin",
  nativeCurrency: { name: "Guapcoin", symbol: "GUAP", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-mainnet-1.guapcoinx.com"] },
    public: { http: ["https://rpc-mainnet-1.guapcoinx.com"] },
  },
});

function getPrivateKey() {
  const key = (process.env.GUAPCOIN_PRIVATE_KEY ?? "").trim().replace(/^0x/, "");
  if (!key) throw new Error("GUAPCOIN_PRIVATE_KEY is not set");
  if (!/^[0-9a-fA-F]{64}$/.test(key)) throw new Error("GUAPCOIN_PRIVATE_KEY must be 64 hex chars");
  return `0x${key}`;
}

function compileSolidity() {
  const source = readFileSync(resolve(__dirname, "../contracts/GuapDIDRegistry.sol"), "utf8");
  const input = {
    language: "Solidity",
    sources: { "GuapDIDRegistry.sol": { content: source } },
    settings: {
      evmVersion: "paris",
      outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
    },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  if (output.errors?.some((e) => e.severity === "error")) {
    throw new Error("Solc errors: " + JSON.stringify(output.errors));
  }
  const contract = output.contracts["GuapDIDRegistry.sol"]["GuapDIDRegistry"];
  return {
    abi: contract.abi,
    bytecode: "0x" + contract.evm.bytecode.object,
  };
}

async function main() {
  console.log("Compiling GuapDIDRegistry...");
  const { abi, bytecode } = compileSolidity();
  console.log("Compiled successfully.");

  const privateKey = getPrivateKey();
  const account = privateKeyToAccount(privateKey);

  console.log("Deploying from:", account.address);

  const walletClient = createWalletClient({
    account,
    chain: guapcoin,
    transport: http("https://rpc-mainnet-1.guapcoinx.com"),
  });

  const publicClient = createPublicClient({
    chain: guapcoin,
    transport: http("https://rpc-mainnet-1.guapcoinx.com"),
  });

  const deployData = encodeDeployData({ abi, bytecode, args: [] });

  const hash = await walletClient.sendTransaction({
    data: deployData,
    gas: 3_000_000n,
  });

  console.log("Deploy tx:", hash);
  console.log("Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  console.log("\n=== DEPLOYED ===");
  console.log("Contract address:", receipt.contractAddress);
  console.log("Block:", receipt.blockNumber.toString());
  console.log("Gas used:", receipt.gasUsed.toString());
  console.log("\nSet in Cloudflare Pages:");
  console.log(`VITE_REGISTRY_ADDRESS=${receipt.contractAddress}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
