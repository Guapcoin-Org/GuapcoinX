import { ethers } from "ethers";
import { ensureGuapcoinNetwork } from "./chain";

const VALIDATOR_REGISTRY_ADDRESS = import.meta.env.VITE_VALIDATOR_REGISTRY_ADDRESS as string || "";
const VERIFICATION_ADDRESS = import.meta.env.VITE_VERIFICATION_ADDRESS as string || "";

// ─── ABIs ─────────────────────────────────────────────────────────────────────

const REGISTRY_ABI = [
  "function submitApplication(string calldata ipfsCID) external",
  "function approveValidator(address validator) external",
  "function removeValidator(address validator) external",
  "function isValidator(address account) external view returns (bool)",
  "function getApplication(address applicant) external view returns (string memory ipfsCID, uint256 submittedAt, bool approved, bool rejected)",
  "function getApprovedValidators() external view returns (address[])",
  "function getApplicants() external view returns (address[])",
  "event ApplicationSubmitted(address indexed applicant, string ipfsCID)",
  "event ValidatorApproved(address indexed validator)",
  "event ValidatorRemoved(address indexed validator)",
];

const VERIFICATION_ABI = [
  "function attest(address identity, uint8 idType, bytes32 attestationHash) external",
  "function revokeAttestation(address identity) external",
  "function getAttestation(address identity) external view returns (address validator, uint8 idType, uint256 timestamp, bool valid)",
  "function isVerified(address identity) external view returns (bool)",
  "event AttestationIssued(address indexed identity, address indexed validator, uint8 idType)",
  "event AttestationRevoked(address indexed identity)",
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ValidatorApplication {
  ipfsCID: string;
  submittedAt: number;
  approved: boolean;
  rejected: boolean;
}

export interface Attestation {
  validator: string;
  idType: number;
  timestamp: number;
  valid: boolean;
}

export const ID_TYPE_LABELS: Record<number, string> = {
  0: "Government ID",
  1: "Tribal ID",
  2: "Organizational ID",
  3: "Passport",
  4: "Other",
};

// ─── Read helpers ─────────────────────────────────────────────────────────────

function getReadProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider("https://rpc-mainnet-1.guapcoinx.com");
}

function getRegistryRead(): ethers.Contract {
  if (!VALIDATOR_REGISTRY_ADDRESS) throw new Error("VITE_VALIDATOR_REGISTRY_ADDRESS not configured");
  return new ethers.Contract(VALIDATOR_REGISTRY_ADDRESS, REGISTRY_ABI, getReadProvider());
}

function getVerificationRead(): ethers.Contract {
  if (!VERIFICATION_ADDRESS) throw new Error("VITE_VERIFICATION_ADDRESS not configured");
  return new ethers.Contract(VERIFICATION_ADDRESS, VERIFICATION_ABI, getReadProvider());
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getApprovedValidators(): Promise<string[]> {
  const registry = getRegistryRead();
  const validators: string[] = await registry.getApprovedValidators();
  return validators;
}

export async function getApplicants(): Promise<string[]> {
  const registry = getRegistryRead();
  const applicants: string[] = await registry.getApplicants();
  return applicants;
}

export async function submitApplication(
  signer: ethers.JsonRpcSigner,
  ipfsCID: string
): Promise<string> {
  await ensureGuapcoinNetwork();
  if (!VALIDATOR_REGISTRY_ADDRESS) throw new Error("VITE_VALIDATOR_REGISTRY_ADDRESS not configured");
  const registry = new ethers.Contract(VALIDATOR_REGISTRY_ADDRESS, REGISTRY_ABI, signer);
  const tx = await registry.submitApplication(ipfsCID);
  const receipt = await tx.wait();
  return receipt.hash as string;
}

export async function getApplication(address: string): Promise<ValidatorApplication> {
  const registry = getRegistryRead();
  const result = await registry.getApplication(address);
  return {
    ipfsCID: result[0] as string,
    submittedAt: Number(result[1]),
    approved: result[2] as boolean,
    rejected: result[3] as boolean,
  };
}

export async function isValidatorAddress(address: string): Promise<boolean> {
  const registry = getRegistryRead();
  return registry.isValidator(address) as Promise<boolean>;
}

export async function isVerified(address: string): Promise<boolean> {
  const verification = getVerificationRead();
  return verification.isVerified(address) as Promise<boolean>;
}

export async function getAttestation(address: string): Promise<Attestation> {
  const verification = getVerificationRead();
  const result = await verification.getAttestation(address);
  return {
    validator: result[0] as string,
    idType: Number(result[1]),
    timestamp: Number(result[2]),
    valid: result[3] as boolean,
  };
}

export async function attest(
  signer: ethers.JsonRpcSigner,
  identity: string,
  idType: number,
  attestationHash: string
): Promise<string> {
  await ensureGuapcoinNetwork();
  if (!VERIFICATION_ADDRESS) throw new Error("VITE_VERIFICATION_ADDRESS not configured");
  const verification = new ethers.Contract(VERIFICATION_ADDRESS, VERIFICATION_ABI, signer);
  const tx = await verification.attest(identity, idType, attestationHash);
  const receipt = await tx.wait();
  return receipt.hash as string;
}

export async function revokeAttestation(
  signer: ethers.JsonRpcSigner,
  identity: string
): Promise<string> {
  await ensureGuapcoinNetwork();
  if (!VERIFICATION_ADDRESS) throw new Error("VITE_VERIFICATION_ADDRESS not configured");
  const verification = new ethers.Contract(VERIFICATION_ADDRESS, VERIFICATION_ABI, signer);
  const tx = await verification.revokeAttestation(identity);
  const receipt = await tx.wait();
  return receipt.hash as string;
}
