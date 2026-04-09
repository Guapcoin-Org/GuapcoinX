import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Copy, ExternalLink } from "lucide-react";
import type { DIDDocument } from "../lib/didDocument";
import { ipfsUrl } from "../lib/ipfs";

interface Props {
  document: DIDDocument;
  cid?: string;
  txHash?: string;
}

export default function DIDDocumentViewer({ document, cid, txHash }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const json = JSON.stringify(document, null, 2);

  const copyJson = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const profile = document.guap_profile;

  return (
    <div className="space-y-4">
      {/* Profile summary */}
      {profile && (
        <div className="glass rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-guap-muted uppercase tracking-wider font-semibold">Creator Profile</span>
            {profile.display_name && (
              <span className="text-sm font-semibold text-white">{profile.display_name}</span>
            )}
          </div>

          {profile.description && (
            <p className="text-sm text-guap-muted">{profile.description}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {profile.hap_creator_id && (
              <a
                href={`https://haphuman.xyz/creator/${profile.hap_creator_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="credential-badge hover:opacity-80 transition-opacity"
              >
                <span>HAP</span>
                <span>{profile.hap_creator_id}</span>
                <ExternalLink size={9} />
              </a>
            )}
            {profile.social_links?.twitter && (
              <a
                href={profile.social_links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="credential-badge hover:opacity-80 transition-opacity"
              >
                𝕏 Twitter
              </a>
            )}
            {profile.social_links?.website && (
              <a
                href={profile.social_links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="credential-badge hover:opacity-80 transition-opacity"
              >
                🌐 Website
              </a>
            )}
          </div>

          <div className="text-xs text-guap-dim font-mono">
            Created: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"} ·
            Updated: {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "—"}
          </div>
        </div>
      )}

      {/* Service endpoints */}
      {document.service && document.service.length > 0 && (
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-guap-muted uppercase tracking-wider font-semibold mb-3">Services</div>
          <div className="space-y-2">
            {document.service.map((svc) => (
              <div key={svc.id} className="flex items-center justify-between gap-2">
                <span className="text-xs text-guap-muted">{svc.type}</span>
                <a
                  href={svc.serviceEndpoint}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-guap-gold hover:underline flex items-center gap-1"
                >
                  {svc.serviceEndpoint.slice(0, 40)}...
                  <ExternalLink size={9} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* On-chain metadata */}
      {(cid || txHash) && (
        <div className="glass rounded-xl p-4 space-y-2">
          <div className="text-xs text-guap-muted uppercase tracking-wider font-semibold mb-2">On-Chain Anchor</div>
          {cid && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-guap-muted">IPFS CID</span>
              <a
                href={ipfsUrl(cid)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-guap-gold hover:underline flex items-center gap-1"
              >
                {cid.slice(0, 20)}...
                <ExternalLink size={9} />
              </a>
            </div>
          )}
          {txHash && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-guap-muted">Tx Hash</span>
              <a
                href={`https://explorer.guapcoinx.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-guap-gold hover:underline flex items-center gap-1"
              >
                {txHash.slice(0, 20)}...
                <ExternalLink size={9} />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Raw JSON toggle */}
      <div className="code-block">
        <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500/60" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
            <div className="w-2 h-2 rounded-full bg-green-500/60" />
            <span className="text-xs font-mono text-guap-dim ml-2">did-document.json</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyJson}
              className="text-xs text-guap-muted hover:text-guap-gold transition-colors flex items-center gap-1"
            >
              <Copy size={11} />
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-guap-muted hover:text-guap-gold transition-colors flex items-center gap-1"
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? "Collapse" : "Expand"}
            </button>
          </div>
        </div>
        <motion.div
          animate={{ height: expanded ? "auto" : "120px" }}
          className="overflow-hidden"
        >
          <pre className="p-5 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
            {json}
          </pre>
        </motion.div>
      </div>
    </div>
  );
}
