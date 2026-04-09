/**
 * Cloudflare Pages Function — GET /api/spec
 * Returns the OpenAPI 3.1 specification for the GuapDID API.
 */

const spec = {
  openapi: "3.1.0",
  info: {
    title: "GuapDID API",
    version: "1.0.0",
    description: "REST API for resolving and managing did:guap Decentralized Identifiers on the Guapcoin blockchain.",
    contact: {
      name: "GuapDID",
      url: "https://guapid.xyz",
    },
  },
  servers: [
    { url: "https://guapid.xyz", description: "Production" },
    { url: "https://guapdid-xyz.pages.dev", description: "Staging" },
  ],
  paths: {
    "/api/resolve": {
      get: {
        summary: "Resolve a did:guap DID",
        description: "Resolves a did:guap Decentralized Identifier. Queries the Guapcoin blockchain for the latest DIDAttributeChanged event, fetches the DID Document from IPFS, and returns a W3C DID Resolution response.",
        operationId: "resolveDID",
        tags: ["Resolution"],
        parameters: [
          {
            name: "did",
            in: "query",
            required: true,
            description: "The did:guap DID to resolve. Also accepts a bare Guapcoin wallet address.",
            schema: { type: "string", example: "did:guap:0x7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8" },
          },
        ],
        responses: {
          "200": {
            description: "DID resolved successfully",
            content: {
              "application/json": {
                schema: { "$ref": "#/components/schemas/DIDResolutionResult" },
                example: {
                  didDocument: {
                    "@context": ["https://www.w3.org/ns/did/v1"],
                    id: "did:guap:0x7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
                    verificationMethod: [{
                      id: "did:guap:0x7f3a...#controller",
                      type: "EcdsaSecp256k1RecoveryMethod2020",
                      controller: "did:guap:0x7f3a...",
                      blockchainAccountId: "eip155:71111:0x7f3a...",
                    }],
                    authentication: ["did:guap:0x7f3a...#controller"],
                    guap_profile: {
                      display_name: "Jordan Ellis",
                      hap_creator_id: "hap_creator_001",
                      created_at: "2026-01-01T00:00:00Z",
                      updated_at: "2026-01-01T00:00:00Z",
                    },
                  },
                  didDocumentMetadata: {
                    created: "2026-01-01T00:00:00Z",
                    updated: "2026-01-01T00:00:00Z",
                    versionId: "bafybeig...",
                    deactivated: false,
                    versions: 1,
                  },
                  didResolutionMetadata: {
                    contentType: "application/did+ld+json",
                    retrieved: "2026-04-09T00:00:00Z",
                    txHash: "0xabc123...",
                    blockNumber: 1553434,
                    network: "guapcoin",
                    chainId: 71111,
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid DID format",
            content: { "application/json": { schema: { "$ref": "#/components/schemas/Error" } } },
          },
          "404": {
            description: "DID not found on chain",
            content: { "application/json": { schema: { "$ref": "#/components/schemas/NotFound" } } },
          },
          "502": {
            description: "Upstream error (RPC or IPFS)",
            content: { "application/json": { schema: { "$ref": "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/pin": {
      post: {
        summary: "Pin a DID Document to IPFS",
        description: "Pins a DID Document JSON to IPFS via Pinata. Returns the IPFS CID. Used by the GuapDID frontend — requires server-side Pinata JWT.",
        operationId: "pinDIDDocument",
        tags: ["Documents"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/PinRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Document pinned successfully",
            content: {
              "application/json": {
                schema: { type: "object", properties: { cid: { type: "string", example: "bafybeig..." } } },
              },
            },
          },
          "400": { description: "Missing required fields" },
          "502": { description: "Pinata error" },
        },
      },
    },
  },
  components: {
    schemas: {
      DIDResolutionResult: {
        type: "object",
        properties: {
          didDocument: { "$ref": "#/components/schemas/DIDDocument" },
          didDocumentMetadata: { "$ref": "#/components/schemas/DIDDocumentMetadata" },
          didResolutionMetadata: { "$ref": "#/components/schemas/DIDResolutionMetadata" },
          anchorHistory: {
            type: "array",
            items: {
              type: "object",
              properties: {
                blockNumber: { type: "integer" },
                txHash: { type: "string" },
              },
            },
          },
        },
      },
      DIDDocument: {
        type: "object",
        properties: {
          "@context": { type: "array", items: { type: "string" } },
          id: { type: "string", example: "did:guap:0x7f3a..." },
          verificationMethod: { type: "array", items: { type: "object" } },
          authentication: { type: "array", items: { type: "string" } },
          assertionMethod: { type: "array", items: { type: "string" } },
          service: { type: "array", items: { type: "object" } },
          guap_profile: { "$ref": "#/components/schemas/GuapProfile" },
        },
      },
      GuapProfile: {
        type: "object",
        properties: {
          display_name: { type: "string" },
          hap_creator_id: { type: "string" },
          social_links: {
            type: "object",
            properties: {
              twitter: { type: "string" },
              website: { type: "string" },
            },
          },
          description: { type: "string" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      DIDDocumentMetadata: {
        type: "object",
        properties: {
          created: { type: "string", format: "date-time" },
          updated: { type: "string", format: "date-time" },
          versionId: { type: "string" },
          deactivated: { type: "boolean" },
          versions: { type: "integer" },
        },
      },
      DIDResolutionMetadata: {
        type: "object",
        properties: {
          contentType: { type: "string", example: "application/did+ld+json" },
          retrieved: { type: "string", format: "date-time" },
          txHash: { type: "string" },
          blockNumber: { type: "integer" },
          network: { type: "string", example: "guapcoin" },
          chainId: { type: "integer", example: 71111 },
        },
      },
      PinRequest: {
        type: "object",
        required: ["document", "walletAddress"],
        properties: {
          document: { type: "object", description: "The DID Document JSON to pin" },
          walletAddress: { type: "string", description: "The wallet address this document belongs to" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
          message: { type: "string" },
        },
      },
      NotFound: {
        type: "object",
        properties: {
          didDocument: { type: "null" },
          didDocumentMetadata: { type: "object" },
          didResolutionMetadata: {
            type: "object",
            properties: {
              error: { type: "string", example: "notFound" },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: "Resolution", description: "Resolve did:guap identifiers" },
    { name: "Documents", description: "Pin and manage DID Documents on IPFS" },
  ],
};

export async function onRequestGet() {
  return new Response(JSON.stringify(spec, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
