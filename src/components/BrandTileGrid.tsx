import BrandTile, { type BrandTileItem } from "@/components/BrandTile";

export type { BrandTileItem };

export default function BrandTileGrid({ items }: { items: BrandTileItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <BrandTile key={item.id} item={item} />
      ))}
    </div>
  );
}