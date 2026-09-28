import LegalPage from "@/components/LegalPage";
import { legalMetadata } from "@/lib/legal-content";

export const metadata = legalMetadata("privacy");

export default function PrivacyPage() {
  return <LegalPage docKey="privacy" />;
}