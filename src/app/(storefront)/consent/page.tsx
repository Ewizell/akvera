import LegalPage from "@/components/LegalPage";
import { legalMetadata } from "@/lib/legal-content";

export const metadata = legalMetadata("consent");

export default function ConsentPage() {
  return <LegalPage docKey="consent" />;
}