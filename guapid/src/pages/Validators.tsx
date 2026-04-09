import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, ShieldCheck, Clock, ThumbsUp, ThumbsDown, Plus, RefreshCw, Building2 } from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import { getSigner } from "../lib/chain";
import { getApprovedValidators, getApplication, type ValidatorApplication, ID_TYPE_LABELS } from "../lib/validators";
import { getProposals, vote, getVotingPower, hasVoted, formatVotes, type Proposal } from "../lib/dao";
import { ipfsUrl } from "../lib/ipfs";
import Navbar from "../components/Navbar";
import GoldParticles from "../components/GoldParticles";
import GuapIDCard from "../components/GuapIDCard";

// ─── Validator profile shape stored in IPFS ──────────────────────────────────

interface ValidatorProfile {
  businessName?: string;
  businessType?: string;
  city?: string;
  state?: string;
  country?: string;
  acceptedIdTypes?: number[];
  about?: string;
  approvedAt?: number;
}

interface ValidatorCard {
  address: string;
  application: ValidatorApplication;
  profile: ValidatorProfile | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchProfile(cid: string): Promise<ValidatorProfile | null> {
  try {
    const res = await fetch(ipfsUrl(cid));
    if (!res.ok) return null;
    return (await res.json()) as ValidatorProfile;
  } catch {
    return null;
  }
}

const STATE_COLORS: Record<string, string> = {
  Active: "text-green-400",
  Pending: "text-yellow-400",
  Succeeded: "text-blue-400",
  Defeated: "text-red-400",
  Executed: "text-guap-muted",
  Cancelled: "text-guap-muted",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ValidatorCardItem({ card }: { card: ValidatorCard }) {
  const profile = card.profile;
  const name = profile?.businessName ?? card.address.slice(0, 10) + "...";
  const types = profile?.acceptedIdTypes ?? [];
  const approvedDate = card.application.submittedAt
    ? new Date(card.application.submittedAt * 1000).toLocaleDateString()
    : "–";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-gold rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.25)" }}
          >
            <Building2 size={18} className="text-guap-gold" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">{name}</div>
            {profile?.businessType && (
              <div className="text-xs text-guap-muted">{profile.businessType}</div>
            )}
          </div>
        </div>
        <div
          className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)" }}
        >
          <ShieldCheck size={11} className="inline mr-1" />
          Verified
        </div>
      </div>

      {profile?.city && (
        <div className="text-xs text-guap-muted">
          {[profile.city, profile.state, profile.country].filter(Boolean).join(", ")}
        </div>
      )}

      {types.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {types.map((t) => (
            <span
              key={t}
              className="credential-badge text-xs"
            >
              {ID_TYPE_LABELS[t] ?? `Type ${t}`}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: "rgba(255,215,0,0.12)" }}>
        <span className="text-xs text-guap-muted">Approved {approvedDate}</span>
        <Link to="/validators" className="text-xs text-guap-gold hover:underline flex items-center gap-1">
          Get Verified Here
        </Link>
      </div>
    </motion.div>
  );
}

function ProposalItem({
  proposal,
  voterAddress,
  onVote,
  votingPower,
}: {
  proposal: Proposal;
  voterAddress: string;
  onVote: (id: number, support: boolean) => void;
  votingPower: bigint;
}) {
  const [voted, setVoted] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!voterAddress) { setChecking(false); return; }
    hasVoted(proposal.id, voterAddress)
      .then(setVoted)
      .catch(() => setVoted(false))
      .finally(() => setChecking(false));
  }, [proposal.id, voterAddress]);

  const total = proposal.forVotes + proposal.againstVotes;
  const forPct = total > 0n ? Number((proposal.forVotes * 100n) / total) : 0;
  const stateColor = STATE_COLORS[proposal.state] ?? "text-guap-muted";
  const canVote = proposal.state === "Active" && !voted && votingPower > 0n;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-guap-muted uppercase tracking-wider font-semibold mb-1">
            Proposal #{proposal.id}
          </div>
          <div className="text-sm font-bold text-white line-clamp-2">{proposal.description}</div>
        </div>
        <span className={`text-xs font-semibold flex-shrink-0 ${stateColor}`}>
          {proposal.state}
        </span>
      </div>

      {/* Vote bar */}
      <div>
        <div className="flex justify-between text-xs text-guap-muted mb-1">
          <span>For: {formatVotes(proposal.forVotes)} GVOTE</span>
          <span>Against: {formatVotes(proposal.againstVotes)} GVOTE</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${forPct}%`, background: "rgba(255,215,0,0.8)" }}
          />
        </div>
      </div>

      {canVote && !checking && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => { onVote(proposal.id, true); setVoted(true); }}
            className="btn-gold flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
          >
            <ThumbsUp size={12} /> Vote For
          </button>
          <button
            onClick={() => { onVote(proposal.id, false); setVoted(true); }}
            className="btn-outline flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
          >
            <ThumbsDown size={12} /> Vote Against
          </button>
        </div>
      )}

      {voted && (
        <div className="text-xs text-guap-muted text-center pt-1">
          You have voted on this proposal.
        </div>
      )}

      {proposal.state === "Active" && votingPower === 0n && !checking && (
        <div className="text-xs text-guap-muted text-center pt-1">
          You need GVOTE tokens to vote.
        </div>
      )}

      <div className="text-xs text-guap-dim">
        Blocks {proposal.startBlock.toLocaleString()} – {proposal.endBlock.toLocaleString()}
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Validators() {
  const { wallet } = useWallet();
  const [activeTab, setActiveTab] = useState<"approved" | "proposals">("approved");

  const [validators, setValidators] = useState<ValidatorCard[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [votingPower, setVotingPower] = useState(0n);
  const [loading, setLoading] = useState(true);
  const [voteError, setVoteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [addrs, rawProposals] = await Promise.all([
        getApprovedValidators().catch(() => [] as string[]),
        getProposals().catch(() => [] as Proposal[]),
      ]);

      setProposals(rawProposals);

      const cards = await Promise.all(
        addrs.map(async (addr) => {
          const app = await getApplication(addr).catch(() => ({
            ipfsCID: "",
            submittedAt: 0,
            approved: false,
            rejected: false,
          }));
          const profile = app.ipfsCID ? await fetchProfile(app.ipfsCID) : null;
          return { address: addr, application: app, profile };
        })
      );
      setValidators(cards);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (wallet.status !== "connected") { setVotingPower(0n); return; }
    getVotingPower(wallet.address)
      .then(setVotingPower)
      .catch(() => setVotingPower(0n));
  }, [wallet.status, wallet.status === "connected" ? wallet.address : null]);

  const handleVote = async (proposalId: number, support: boolean) => {
    setVoteError(null);
    try {
      const signer = await getSigner();
      await vote(signer, proposalId, support);
      await load();
    } catch (err: unknown) {
      setVoteError(err instanceof Error ? err.message : "Vote failed");
    }
  };

  const connectedAddress = wallet.status === "connected" ? wallet.address : "";

  return (
    <div className="min-h-screen bg-guap-black flex flex-col relative overflow-hidden">
      <GoldParticles />
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 text-xs font-mono"
            style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", color: "#FFD700" }}
          >
            <ShieldCheck size={11} /> Human Validators
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Human Validators</h1>
          <p className="text-guap-muted max-w-xl" style={{ lineHeight: "1.7" }}>
            Community businesses and organizations that physically verify identity documents
            and issue on-chain attestations — no personal data stored, just a privacy-preserving hash.
          </p>
        </motion.div>

        {/* Tabs + CTA */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,215,0,0.1)" }}>
            {(["approved", "proposals"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-guap-gold text-black"
                    : "text-guap-muted hover:text-white"
                }`}
              >
                {tab === "approved" ? (
                  <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> Approved Validators</span>
                ) : (
                  <span className="flex items-center gap-1.5"><Clock size={13} /> Pending Proposals</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void load()}
              disabled={loading}
              className="btn-ghost p-2 rounded-xl"
              title="Refresh"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <Link to="/validators/propose" className="btn-gold px-4 py-2 text-xs flex items-center gap-1.5">
              <Plus size={13} /> Propose Your Business
            </Link>
          </div>
        </div>

        {/* Vote error */}
        {voteError && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm text-red-400"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {voteError}
          </div>
        )}

        {/* Tab content */}
        {loading ? (
          <div className="glass rounded-2xl p-12 text-center">
            <RefreshCw size={24} className="text-guap-gold animate-spin mx-auto mb-3" />
            <p className="text-sm text-guap-muted">Loading validators...</p>
          </div>
        ) : activeTab === "approved" ? (
          validators.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <GuapIDCard size={72} className="mx-auto mb-4" />
              <h3 className="text-base font-bold text-white mb-2">No Approved Validators Yet</h3>
              <p className="text-sm text-guap-muted mb-5">
                Be the first to propose your business as a Human Validator.
              </p>
              <Link to="/validators/propose" className="btn-gold px-5 py-2.5 text-sm inline-flex items-center gap-2">
                <Plus size={14} /> Propose Your Business
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {validators.map((card) => (
                <ValidatorCardItem key={card.address} card={card} />
              ))}
            </div>
          )
        ) : (
          proposals.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Users size={40} className="text-guap-gold mx-auto mb-4 opacity-40" />
              <h3 className="text-base font-bold text-white mb-2">No Proposals Yet</h3>
              <p className="text-sm text-guap-muted mb-5">
                GVOTE holders can vote on validator applications once proposals are submitted.
              </p>
              <Link to="/validators/propose" className="btn-gold px-5 py-2.5 text-sm inline-flex items-center gap-2">
                <Plus size={14} /> Propose Your Business
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((p) => (
                <ProposalItem
                  key={p.id}
                  proposal={p}
                  voterAddress={connectedAddress}
                  onVote={handleVote}
                  votingPower={votingPower}
                />
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
