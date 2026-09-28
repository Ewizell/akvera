import { headers } from "next/headers";
import { CONSENT_VERSION } from "@/lib/legal-content";

export async function getConsentMeta() {
  const h = await headers();
  const ip = h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",").pop()?.trim() || null;
  return { consentAt: new Date(), consentVersion: CONSENT_VERSION, consentIp: ip };
}