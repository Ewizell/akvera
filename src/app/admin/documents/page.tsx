import { listDocuments } from '@/lib/actions/document'
import DocumentsList from '@/components/DocumentsList'

export default async function DocumentsPage() {
  const documents = await listDocuments()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900">Медиатека документов</h1>
        <p className="text-sm text-slate-500 mt-1">
          Технические паспорта, сертификаты и инструкции — переиспользуются между товарами и исполнениями
        </p>
      </div>
      <DocumentsList initialDocuments={documents} />
    </div>
  )
}