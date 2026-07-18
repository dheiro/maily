import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import DOMPurify from 'dompurify'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { queryKeys } from '../lib/query-keys'
import { formatEmailDate } from '../utils/timeAgo'

export default function EmailDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.emails.detail(id),
    queryFn: () => api.emails.get(id!),
    enabled: !!id,
  })

  const handleDelete = async () => {
    await api.emails.delete(id!)
    navigate('/inbox')
  }

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading email...</div>
  if (!data?.email) return <div className="p-8 text-center text-red-500">Email not found</div>

  const email = data.email
  const sanitizedHtml = DOMPurify.sanitize(email.body_html || email.body_text || 'No content')

  return (
    <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-gray-50/50 dark:bg-gray-950 px-4 md:px-6 lg:px-8 pb-4 md:pb-6 pt-0">
      <div className="flex flex-col flex-1 min-h-0 space-y-6 pt-4">

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate('/inbox')} className="w-8 h-8 flex items-center justify-center -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-8">Inbox</h1>
        </div>

        <div className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">

          {/* Toolbar / Card Header */}
          <div className="h-14 px-2 md:px-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900/60 flex-shrink-0">
            <div className="flex items-center gap-1 w-full">
              <h1 className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-100 truncate flex-1 px-2">
                {email.subject || 'No Subject'}
              </h1>
            </div>

            <div className="flex items-center pl-2">
              <button onClick={handleDelete} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" title="Delete Email">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Email Metadata */}
          <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-lg">
                  {email.from?.match(/^([^<]+)/)?.[1]?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                    {email.from?.match(/^([^<]+)/)?.[1]?.trim() || email.from || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                    <span className="text-gray-400 dark:text-gray-500">from:</span>
                    <span className="font-mono text-[11px] bg-gray-50 dark:bg-gray-800/50 px-1 rounded border border-gray-200 dark:border-gray-700">
                      {email.from?.match(/<([^>]+)>/)?.[1] || email.from || 'Unknown'}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600 mx-1">•</span>
                    <span className="text-gray-400 dark:text-gray-500">to:</span>
                    <span className="font-mono text-[11px] bg-gray-50 dark:bg-gray-800/50 px-1 rounded border border-gray-200 dark:border-gray-700">
                      {email.to}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap pl-4">
                {formatEmailDate(email.received_at)}
              </div>
            </div>
          </div>

          {/* Email Body */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-4 md:p-6 bg-white dark:bg-transparent">
            <div
              className="prose prose-sm md:prose-base max-w-none dark:prose-invert prose-a:text-orange-600 hover:prose-a:text-orange-700 dark:prose-a:text-orange-500 dark:hover:prose-a:text-orange-400"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          </div>

        </div>
      </div>
    </div>
  )
}
