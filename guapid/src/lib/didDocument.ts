export interface GuapProfile {
  display_name?: string;
  hap_creator_id?: string;
  social_links?: {
    twitter?: string;
    website?: string;
  };
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DIDDocument {
  "@context": string[];
  id: string;
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
  service?: ServiceEndpoint[];
  guap_profile?: GuapProfile;
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  blockchainAccountId: string;
}

export interface ServiceEndpoint {
  id: string;
  type: string;
  serviceEndpoint: string;
}

export interface ProfileFormData {
  displayName: string;
  hapCreatorId: string;
  website: string;
  twitter: string;
  description: string;
}

export function buildDIDDocument(
  walletAddress: string,
  profile: ProfileFormData,
  existingCreatedAt?: string
): DIDDocument {
  const did = `did:guap:${walletAddress.toLowerCase()}`;
  const now = new Date().toISOString();

  const doc: DIDDocument = {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/secp256k1-2019/v1",
    ],
    id: did,
    verificationMethod: [
      {
        id: `${did}#controller`,
        type: "EcdsaSecp256k1RecoveryMethod2020",
        controller: did,
        blockchainAccountId: `eip155:71111:${walletAddress.toLowerCase()}`,
      },
    ],
    authentication: [`${did}#controller`],
    assertionMethod: [`${did}#controller`],
    service: [],
    guap_profile: {
      display_name: profile.displayName || undefined,
      hap_creator_id: profile.hapCreatorId || undefined,
      social_links: {
        twitter: profile.twitter ? `https://twitter.com/${profile.twitter.replace("@", "")}` : undefined,
        website: profile.website || undefined,
      },
      description: profile.description || undefined,
      created_at: existingCreatedAt || now,
      updated_at: now,
    },
  };

  if (profile.hapCreatorId) {
    doc.service!.push({
      id: `${did}#hap-profile`,
      type: "HAPCreatorProfile",
      serviceEndpoint: `https://haphuman.xyz/creator/${profile.hapCreatorId}`,
    });
  }

  if (profile.website) {
    doc.service!.push({
      id: `${did}#website`,
      type: "LinkedDomains",
      serviceEndpoint: profile.website,
    });
  }

  if (doc.service!.length === 0) delete doc.service;

  return doc;
}

export function emptyProfile(): ProfileFormData {
  return {
    displayName: "",
    hapCreatorId: "",
    website: "",
    twitter: "",
    description: "",
  };
}
