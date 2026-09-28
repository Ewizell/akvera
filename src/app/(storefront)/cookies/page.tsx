import LegalPage from "@/components/LegalPage";
import { legalMetadata } from "@/lib/legal-content";

export const metadata = legalMetadata("cookies");

export default function CookiesPage() {
  return <LegalPage docKey="cookies" />;
}