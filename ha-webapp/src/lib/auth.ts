import "server-only";
import crypto from "crypto";

type User = "hannes" | "elvira";

const base64url = {
  encode(input: Buffer | string) {
    return Buffer.from(input)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  },
  decode(input: string) {
    const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? 0 : 4 - (b64.length % 4);
    return Buffer.from(b64 + "=".repeat(pad), "base64").toString();
  },
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET saknas i .env.local");
  return secret;
}

function getPins() {
  const pins: Record<User, string | undefined> = {
    hannes: process.env.HANNES_PIN,
    elvira: process.env.ELVIRA_PIN,
  };
  if (!pins.hannes || !pins.elvira) {
    throw new Error("HANNES_PIN och ELVIRA_PIN måste finnas i .env.local");
  }
  return pins as Record<User, string>;
}

export function signSession(user: User, daysValid = 7) {
  const secret = getSecret();
  const header = base64url.encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const exp = Date.now() + daysValid * 24 * 60 * 60 * 1000;
  const payload = base64url.encode(JSON.stringify({ sub: user, exp }));
  const data = `${header}.${payload}`;
  const sig = base64url.encode(crypto.createHmac("sha256", secret).update(data).digest());
  return `${data}.${sig}`;
}

export function verifySession(token: string): { user: User } | null {
  try {
    const secret = getSecret();
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, sig] = parts;
    const data = `${header}.${payload}`;
    const expectedSig = base64url.encode(crypto.createHmac("sha256", secret).update(data).digest());
    if (sig !== expectedSig) return null;
    const decoded = JSON.parse(base64url.decode(payload));
    if (typeof decoded.exp !== "number" || Date.now() > decoded.exp) return null;
    if (decoded.sub !== "hannes" && decoded.sub !== "elvira") return null;
    return { user: decoded.sub };
  } catch {
    return null;
  }
}

export function validatePin(user: User, pin: string) {
  const pins = getPins();
  return pins[user] === pin;
}
