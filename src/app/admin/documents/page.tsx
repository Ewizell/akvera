import { listDocuments } from '@/lib/actions/document'
import DocumentsList from '@/components/DocumentsList'

export default async function DocumentsPage() {
  const documents = await listDocuments()

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-7">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#929aa6]">
          <span>Каталог</span>
          <span className="text-[#c4c9cf]">/</span>
          <span>Медиатека</span>
        </div>

        <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-[#28313d]">
          Медиатека документов
        </h1>

        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-[#7b8592]">
          Технические паспорта, сертификаты и инструкции — переиспользуются
          между товарами и исполнениями.
        </p>
      </div>

      <DocumentsList initialDocuments={documents} />
    </div>
  )
}

