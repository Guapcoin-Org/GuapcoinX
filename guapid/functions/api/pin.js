/**
 * Cloudflare Pages Function — POST /api/pin
 * Proxies Pinata pinning requests server-side (keeps JWT out of the browser).
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  const jwt = env.PINATA_JWT;
  if (!jwt) {
    return new Response(JSON.stringify({ error: "Pinata JWT not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { document, walletAddress } = body;
  if (!document || !walletAddress) {
    return new Response(JSON.stringify({ error: "document and walletAddress required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const pinataPayload = {
    pinataContent: document,
    pinataMetadata: {
      name: `guapdid-${walletAddress.toLowerCase()}`,
      keyvalues: {
        did: `did:guap:${walletAddress.toLowerCase()}`,
        type: "did-document",
        version: "1.0",
      },
    },
  };

  const pinataRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(pinataPayload),
  });

  const pinataData = await pinataRes.json();

  if (!pinataRes.ok) {
    console.error("Pinata error:", pinataData);
    return new Response(
      JSON.stringify({ error: pinataData.error?.details || "Pinata error", raw: pinataData }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ cid: pinataData.IpfsHash }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
