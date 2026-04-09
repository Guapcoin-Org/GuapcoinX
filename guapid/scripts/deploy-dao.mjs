#!/usr/bin/env node
/**
 * Deploy GuapDAO system to Guapcoin EVM
 * Deploys: GuapGovernanceToken → GuapDAO → GuapValidatorRegistry → GuapVerification
 * Usage: node scripts/deploy-dao.mjs
 * Requires: GUAPCOIN_PRIVATE_KEY env var
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import {
  createWalletClient,
  createPublicClient,
  http,
  defineChain,
  encodeDeployData,
  encodeFunctionData,
} from "viem";
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

function readContract(filename) {
  return readFileSync(resolve(__dirname, "../contracts", filename), "utf8");
}

function compileContracts() {
  const sources = {
    "GuapGovernanceToken.sol": { content: readContract("GuapGovernanceToken.sol") },
    "GuapDAO.sol":             { content: readContract("GuapDAO.sol") },
    "GuapValidatorRegistry.sol": { content: readContract("GuapValidatorRegistry.sol") },
    "GuapVerification.sol":    { content: readContract("GuapVerification.sol") },
  };

  const input = {
    language: "Solidity",
    sources,
    settings: {
      evmVersion: "paris",
      outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors?.some((e) => e.severity === "error")) {
    console.error("Solc errors:");
    output.errors.forEach((e) => console.error(e.formattedMessage));
    throw new Error("Compilation failed");
  }

  // Log warnings
  output.errors?.forEach((e) => {
    if (e.severity === "warning") console.warn("WARN:", e.message);
  });

  function extract(file, contractName) {
    const c = output.contracts[file][contractName];
    return { abi: c.abi, bytecode: "0x" + c.evm.bytecode.object };
  }

  return {
    GuapGovernanceToken: extract("GuapGovernanceToken.sol", "GuapGovernanceToken"),
    GuapDAO:             extract("GuapDAO.sol", "GuapDAO"),
    GuapValidatorRegistry: extract("GuapValidatorRegistry.sol", "GuapValidatorRegistry"),
    GuapVerification:    extract("GuapVerification.sol", "GuapVerification"),
  };
}

async function deployContract(walletClient, publicClient, { abi, bytecode }, args, label) {
  console.log(`\nDeploying ${label}...`);

  const deployData = encodeDeployData({ abi, bytecode, args });

  const hash = await walletClient.sendTransaction({
    data: deployData,
    gas: 4_000_000n,
  });

  console.log(`  Tx: ${hash}`);
  console.log(`  Waiting for confirmation...`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (!receipt.contractAddress) throw new Error(`${label}: no contract address in receipt`);

  console.log(`  Address: ${receipt.contractAddress}`);
  console.log(`  Block:   ${receipt.blockNumber}`);
  console.log(`  Gas:     ${receipt.gasUsed}`);

  return receipt.contractAddress;
}

async function main() {
  console.log("=== GuapDAO System Deployment ===\n");
  console.log("Compiling contracts...");

  const compiled = compileContracts();
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

  // 1. Deploy GuapGovernanceToken(owner = deployer)
  const gvoteAddress = await deployContract(
    walletClient, publicClient,
    compiled.GuapGovernanceToken,
    [account.address],
    "GuapGovernanceToken"
  );

  // 2. Deploy GuapDAO(governanceToken, owner = deployer)
  const daoAddress = await deployContract(
    walletClient, publicClient,
    compiled.GuapDAO,
    [gvoteAddress, account.address],
    "GuapDAO"
  );

  // 3. Deploy GuapValidatorRegistry(daoAddress)
  const registryAddress = await deployContract(
    walletClient, publicClient,
    compiled.GuapValidatorRegistry,
    [daoAddress],
    "GuapValidatorRegistry"
  );

  // 4. Deploy GuapVerification(validatorRegistry, daoOwner = daoAddress)
  const verificationAddress = await deployContract(
    walletClient, publicClient,
    compiled.GuapVerification,
    [registryAddress, daoAddress],
    "GuapVerification"
  );

  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("\nContract Addresses:");
  console.log(`  GuapGovernanceToken:    ${gvoteAddress}`);
  console.log(`  GuapDAO:                ${daoAddress}`);
  console.log(`  GuapValidatorRegistry:  ${registryAddress}`);
  console.log(`  GuapVerification:       ${verificationAddress}`);

  console.log("\nSet in Cloudflare Pages (or .env):");
  console.log(`VITE_GVOTE_ADDRESS=${gvoteAddress}`);
  console.log(`VITE_DAO_ADDRESS=${daoAddress}`);
  console.log(`VITE_VALIDATOR_REGISTRY_ADDRESS=${registryAddress}`);
  console.log(`VITE_VERIFICATION_ADDRESS=${verificationAddress}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
