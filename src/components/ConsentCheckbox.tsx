import Link from "next/link";

export default function ConsentCheckbox({ className = "" }: { className?: string }) {
  return (
    <label className={`flex items-start gap-2 text-xs text-[#767d83] ${className}`}>
      <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-accent" />
      <span>
        Я даю{" "}
        <Link href="/consent" target="_blank" className="text-accent underline">
          согласие на обработку персональных данных
        </Link>{" "}
        и ознакомлен(а) с{" "}
        <Link href="/privacy" target="_blank" className="text-accent underline">
          политикой обработки персональных данных
        </Link>
      </span>
    </label>
  );
}