import { ethers } from "ethers";
import { ensureGuapcoinNetwork } from "./chain";

const DAO_ADDRESS = import.meta.env.VITE_DAO_ADDRESS as string || "";
const GVOTE_ADDRESS = import.meta.env.VITE_GVOTE_ADDRESS as string || "";

// ─── ABIs ─────────────────────────────────────────────────────────────────────

const DAO_ABI = [
  "function propose(address target, bytes calldata callData, string calldata description) external returns (uint256)",
  "function vote(uint256 proposalId, bool support) external",
  "function execute(uint256 proposalId) external",
  "function cancel(uint256 proposalId) external",
  "function state(uint256 proposalId) external view returns (uint8)",
  "function getProposal(uint256 proposalId) external view returns (tuple(uint256 id, address proposer, string description, address target, bytes callData, uint256 forVotes, uint256 againstVotes, uint256 startBlock, uint256 endBlock, bool executed, bool cancelled))",
  "function proposalCount() external view returns (uint256)",
  "function hasVoted(uint256 proposalId, address voter) external view returns (bool)",
  "function VOTING_PERIOD() external view returns (uint256)",
  "function QUORUM() external view returns (uint256)",
  "function PROPOSAL_THRESHOLD() external view returns (uint256)",
  "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, address target, string description, uint256 startBlock, uint256 endBlock)",
  "event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight)",
  "event ProposalExecuted(uint256 indexed proposalId)",
  "event ProposalCancelled(uint256 indexed proposalId)",
];

const GVOTE_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function getVotes(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
];

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProposalState =
  | "Pending"
  | "Active"
  | "Defeated"
  | "Succeeded"
  | "Executed"
  | "Cancelled";

export interface Proposal {
  id: number;
  proposer: string;
  description: string;
  target: string;
  callData: string;
  forVotes: bigint;
  againstVotes: bigint;
  startBlock: number;
  endBlock: number;
  executed: boolean;
  cancelled: boolean;
  state: ProposalState;
}

const STATE_MAP: ProposalState[] = [
  "Pending",
  "Active",
  "Defeated",
  "Succeeded",
  "Executed",
  "Cancelled",
];

// ─── Read helpers ─────────────────────────────────────────────────────────────

function getReadProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider("https://rpc-mainnet-1.guapcoinx.com");
}

function getDAORead(): ethers.Contract {
  if (!DAO_ADDRESS) throw new Error("VITE_DAO_ADDRESS not configured");
  return new ethers.Contract(DAO_ADDRESS, DAO_ABI, getReadProvider());
}

function getGVOTERead(): ethers.Contract {
  if (!GVOTE_ADDRESS) throw new Error("VITE_GVOTE_ADDRESS not configured");
  return new ethers.Contract(GVOTE_ADDRESS, GVOTE_ABI, getReadProvider());
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getProposals(): Promise<Proposal[]> {
  const dao = getDAORead();
  const countBig = await dao.proposalCount();
  const count = Number(countBig);
  if (count === 0) return [];

  const proposals: Proposal[] = [];
  for (let i = 1; i <= count; i++) {
    const [raw, stateNum] = await Promise.all([
      dao.getProposal(i),
      dao.state(i),
    ]);
    proposals.push({
      id: Number(raw.id),
      proposer: raw.proposer as string,
      description: raw.description as string,
      target: raw.target as string,
      callData: raw.callData as string,
      forVotes: BigInt(raw.forVotes.toString()),
      againstVotes: BigInt(raw.againstVotes.toString()),
      startBlock: Number(raw.startBlock),
      endBlock: Number(raw.endBlock),
      executed: raw.executed as boolean,
      cancelled: raw.cancelled as boolean,
      state: STATE_MAP[Number(stateNum)] ?? "Pending",
    });
  }
  return proposals;
}

export async function getVotingPower(address: string): Promise<bigint> {
  const gvote = getGVOTERead();
  const votes = await gvote.getVotes(address);
  return BigInt(votes.toString());
}

export async function getGVOTEBalance(address: string): Promise<bigint> {
  const gvote = getGVOTERead();
  const bal = await gvote.balanceOf(address);
  return BigInt(bal.toString());
}

export async function hasVoted(proposalId: number, voter: string): Promise<boolean> {
  const dao = getDAORead();
  return dao.hasVoted(proposalId, voter) as Promise<boolean>;
}

export async function vote(
  signer: ethers.JsonRpcSigner,
  proposalId: number,
  support: boolean
): Promise<string> {
  await ensureGuapcoinNetwork();
  if (!DAO_ADDRESS) throw new Error("VITE_DAO_ADDRESS not configured");
  const dao = new ethers.Contract(DAO_ADDRESS, DAO_ABI, signer);
  const tx = await dao.vote(proposalId, support);
  const receipt = await tx.wait();
  return receipt.hash as string;
}

export async function propose(
  signer: ethers.JsonRpcSigner,
  target: string,
  callData: string,
  description: string
): Promise<number> {
  await ensureGuapcoinNetwork();
  if (!DAO_ADDRESS) throw new Error("VITE_DAO_ADDRESS not configured");
  const dao = new ethers.Contract(DAO_ADDRESS, DAO_ABI, signer);
  const tx = await dao.propose(target, callData, description);
  const receipt = await tx.wait();
  // Parse ProposalCreated event to get ID
  const iface = new ethers.Interface(DAO_ABI);
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog({ topics: log.topics, data: log.data });
      if (parsed && parsed.name === "ProposalCreated") {
        return Number(parsed.args.proposalId);
      }
    } catch {
      // not this log
    }
  }
  return 0;
}

export function formatVotes(votes: bigint): string {
  const eth = Number(votes) / 1e18;
  if (eth >= 1_000_000) return `${(eth / 1_000_000).toFixed(1)}M`;
  if (eth >= 1_000) return `${(eth / 1_000).toFixed(1)}K`;
  return eth.toFixed(0);
}
