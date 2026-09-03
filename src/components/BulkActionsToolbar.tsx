"use client";

import { useState, useTransition } from "react";
import {
  bulkDeleteProducts,
  bulkUpdateCategory,
  bulkUpdateBrand,
  bulkAddTags,
  bulkRemoveTags,
} from "@/lib/actions/product";

type Option = { id: string; name: string };

interface BulkActionsToolbarProps {
  selectedIds: string[];
  categories: Option[];
  brands: Option[];
  tags: Option[];
  onClear: () => void;
}

export default function BulkActionsToolbar({
  selectedIds,
  categories,
  brands,
  tags,
  onClear,
}: BulkActionsToolbarProps) {
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState<null | "category" | "brand" | "tagsAdd" | "tagsRemove">(null);
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  function handleDelete() {
    if (!confirm(`Удалить ${selectedIds.length} товар(ов)? Это действие необратимо.`)) return;
    startTransition(async () => {
      await bulkDeleteProducts(selectedIds);
      onClear();
    });
  }

  function handleApplyCategory() {
    if (!selectedOptionId) return;
    startTransition(async () => {
      await bulkUpdateCategory(selectedIds, selectedOptionId);
      setModal(null);
      onClear();
    });
  }

  function handleApplyBrand() {
    startTransition(async () => {
      await bulkUpdateBrand(selectedIds, selectedOptionId || null);
      setModal(null);
      onClear();
    });
  }

  function handleApplyTags(mode: "add" | "remove") {
    if (selectedTagIds.length === 0) return;
    startTransition(async () => {
      if (mode === "add") await bulkAddTags(selectedIds, selectedTagIds);
      else await bulkRemoveTags(selectedIds, selectedTagIds);
      setModal(null);
      setSelectedTagIds([]);
      onClear();
    });
  }

  function toggleTag(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  const hasSelection = selectedIds.length > 0;
  const disabled = isPending || !hasSelection;

  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 px-4 rounded-lg mb-4 h-14 bg-gray-900 text-white shadow-lg">
      <span className="font-medium">Выбрано: {selectedIds.length}</span>

      <button onClick={() => setModal("category")} disabled={disabled} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-700">Категория</button>
      <button onClick={() => setModal("brand")} disabled={disabled} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-700">Бренд</button>
      <button onClick={() => setModal("tagsAdd")} disabled={disabled} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-700">+ Теги</button>
      <button onClick={() => setModal("tagsRemove")} disabled={disabled} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-700">− Теги</button>

      <button onClick={handleDelete} disabled={disabled} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded text-sm ml-auto disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-600">Удалить</button>
      <button onClick={onClear} disabled={disabled} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-700">Отменить выбор</button>

      {modal === "category" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="bg-white text-gray-900 p-6 rounded-lg w-80">
            <h3 className="font-semibold mb-3">Сменить категорию</h3>
            <select className="w-full border rounded px-2 py-1.5 mb-4" value={selectedOptionId} onChange={(e) => setSelectedOptionId(e.target.value)}>
              <option value="">Выберите категорию</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="px-3 py-1.5 text-sm">Отмена</button>
              <button onClick={handleApplyCategory} disabled={!selectedOptionId || isPending} className="px-3 py-1.5 bg-gray-900 text-white rounded text-sm">Применить</button>
            </div>
          </div>
        </div>
      )}

      {modal === "brand" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="bg-white text-gray-900 p-6 rounded-lg w-80">
            <h3 className="font-semibold mb-3">Сменить бренд</h3>
            <select className="w-full border rounded px-2 py-1.5 mb-4" value={selectedOptionId} onChange={(e) => setSelectedOptionId(e.target.value)}>
              <option value="">Без бренда</option>
              {brands.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="px-3 py-1.5 text-sm">Отмена</button>
              <button onClick={handleApplyBrand} disabled={isPending} className="px-3 py-1.5 bg-gray-900 text-white rounded text-sm">Применить</button>
            </div>
          </div>
        </div>
      )}

      {(modal === "tagsAdd" || modal === "tagsRemove") && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="bg-white text-gray-900 p-6 rounded-lg w-80">
            <h3 className="font-semibold mb-3">{modal === "tagsAdd" ? "Добавить теги" : "Убрать теги"}</h3>
            <div className="max-h-56 overflow-y-auto mb-4 space-y-1">
              {tags.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selectedTagIds.includes(t.id)} onChange={() => toggleTag(t.id)} />
                  {t.name}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setModal(null); setSelectedTagIds([]); }} className="px-3 py-1.5 text-sm">Отмена</button>
              <button onClick={() => handleApplyTags(modal === "tagsAdd" ? "add" : "remove")} disabled={selectedTagIds.length === 0 || isPending} className="px-3 py-1.5 bg-gray-900 text-white rounded text-sm">Применить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}