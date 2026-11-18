import type { Board } from "./types";

// A share link carries the whole postmortem in the URL fragment (after #).
// Browsers never send the fragment to the server, so the content stays in the browser.

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

async function transform(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const piped = new Blob([bytes.slice()]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(piped).arrayBuffer());
}

export async function encodeBoard(board: Board): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(board));
  return toBase64Url(await transform(json, new CompressionStream("deflate-raw")));
}

/** Returns the parsed JSON, or throws if the link is damaged. Validate with parseBoard. */
export async function decodeBoard(text: string): Promise<unknown> {
  const bytes = await transform(fromBase64Url(text), new DecompressionStream("deflate-raw"));
  return JSON.parse(new TextDecoder().decode(bytes));
}
