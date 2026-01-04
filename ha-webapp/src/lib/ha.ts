import "server-only";

const HA_URL = process.env.HA_URL;
const HA_TOKEN = process.env.HA_TOKEN;

if (!HA_URL) throw new Error("Missing HA_URL in .env.local");
if (!HA_TOKEN) throw new Error("Missing HA_TOKEN in .env.local");

export type HAState = {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
};

async function haFetch(path: string, init?: RequestInit) {
  const url = `${HA_URL}${path}`;
  console.log("[HA FETCH]", url);

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${HA_TOKEN}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[HA RESPONSE ERROR]", res.status, text);
      throw new Error(`HA ${res.status}: ${text}`);
    }

    return res;
  } catch (err) {
    console.error("[HA FETCH FAILED]", err);
    throw err;
  }
}

export async function getStates(): Promise<HAState[]> {
  const res = await haFetch("/api/states");
  return res.json();
}

export async function callService(domain: string, service: string, payload: any) {
  const res = await haFetch(`/api/services/${domain}/${service}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.json();
}
