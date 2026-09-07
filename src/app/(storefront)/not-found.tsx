import Link from "next/link";
import SearchBox from "@/components/SearchBox";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-24 text-center bg-white text-gray-900">
      <p className="text-sm font-medium text-gray-500 mb-2">Ошибка 404</p>
      <h1 className="text-3xl font-bold mb-4">Страница не найдена</h1>
      <p className="text-gray-600 max-w-md mb-8">
        Возможно, товар или раздел был перемещён или удалён. Попробуйте найти
        то, что искали, через поиск ниже.
      </p>

      <div className="w-full max-w-md">
        <SearchBox />
      </div>

      <div className="flex gap-4 mt-8 text-sm">
        <Link href="/" className="text-blue-600 hover:underline">
          На главную
        </Link>
        <Link href="/catalog" className="text-blue-600 hover:underline">
          В каталог
        </Link>
      </div>
    </div>
  );
}