import { RotateCw } from "lucide-react";

export default function Loading() {
  return (
    <div
      className="flex min-h-[80vh] w-full items-center justify-center bg-white"
      style={{ animation: "loaderFade 0.2s ease-out 0.3s both" }}
    >
      <style>{`@keyframes loaderFade{from{opacity:0}to{opacity:1}}`}</style>

      <RotateCw
        size={40}
        strokeWidth={2}
        className="animate-spin text-[#179146]"
        aria-label="Загрузка"
      />
    </div>
  );
}