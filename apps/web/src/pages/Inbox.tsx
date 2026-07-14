import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { RefreshCw, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { queryKeys } from '../lib/query-keys'
import { formatEmailDate } from '../utils/timeAgo'
import EmailSelector from '../components/EmailSelector'

export default function Inbox({
  username,
  setUsernameState,
  selectedDomain,
  setSelectedDomain,
  currentUser,
  isAutoRefresh,
  setIsAutoRefresh,
}: {
  username: string,
  setUsernameState: (u: string) => void,
  selectedDomain: string,
  setSelectedDomain: (d: string) => void,
  currentUser: string,
  isAutoRefresh: boolean,
  setIsAutoRefresh: (v: boolean) => void,
}) {
  const [page, setPage] = useState(1)
  const [isSpinning, setIsSpinning] = useState(false)
  const spinStartTime = useRef<number>(0)

  useEffect(() => {
    setPage(1)
  }, [username, selectedDomain])

  const { data, refetch, isFetching } = useQuery({
    queryKey: queryKeys.emails.list({ username, domain: selectedDomain, page }),
    queryFn: () => api.emails.list({
      to: selectedDomain ? (username ? `${username}@${selectedDomain}` : `@${selectedDomain}`) : undefined,
      page,
      limit: 20,
    }),
    refetchInterval: isAutoRefresh ? 5000 : false,
  })

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    if (isFetching) {
      setIsSpinning(true)
      spinStartTime.current = Date.now()
    } else {
      const elapsed = Date.now() - spinStartTime.current
      if (elapsed < 1000) {
        timeout = setTimeout(() => setIsSpinning(false), 1000 - elapsed)
      } else {
        setIsSpinning(false)
      }
    }
    return () => clearTimeout(timeout)
  }, [isFetching])

  const emails = data?.emails || []
  const total = data?.total || 0
  const limit = data?.limit || 20

  const startIdx = total === 0 ? 0 : (page - 1) * limit + 1
  const endIdx = Math.min(page * limit, total)
  const hasNextPage = page * limit < total
  const hasPrevPage = page > 1

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    await api.emails.delete(id)
    refetch()
  }

  const currentAddress = selectedDomain ? `${username}@${selectedDomain}` : `all addresses for ${username}`

  return (
    <div className="flex-1 flex flex-col bg-gray-50/50 dark:bg-gray-950 px-4 md:px-6 lg:px-8 pb-4 md:pb-6 overflow-hidden pt-0">
      <div className="flex flex-col flex-1 space-y-6 pt-4">

        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-8">Inbox</h1>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden">

          {/* Inbox Toolbar */}
          <div className="h-14 px-2 md:px-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900/60 flex-shrink-0 relative z-20">
            <div className="flex items-center gap-3 w-1/3">
              <button onClick={() => refetch()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-500" title="Refresh">
                <RefreshCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              </button>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

              <button
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className="hidden sm:flex items-center gap-2 group focus:outline-none"
                title={isAutoRefresh ? "Disable Auto Refresh" : "Enable Auto Refresh"}
              >
                {/* Custom CSS Toggle Switch */}
                <div
                  className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors duration-200 ease-in-out ${
                    isAutoRefresh ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition duration-200 ease-in-out shadow-sm ${
                      isAutoRefresh ? 'translate-x-3.5' : 'translate-x-0.5'
                    }`}
                  />
                </div>
                <span className={`text-xs font-medium transition-colors ${
                  isAutoRefresh ? 'text-orange-600 dark:text-orange-500' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                }`}>Auto-refresh</span>
              </button>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto">
              <EmailSelector
                username={username}
                setUsernameState={setUsernameState}
                selectedDomain={selectedDomain}
                setSelectedDomain={setSelectedDomain}
                currentUser={currentUser}
              />
            </div>

            <div className="flex items-center justify-end gap-4 text-sm text-gray-500 dark:text-gray-400 w-1/3">
              <span className="hidden sm:inline font-medium">
                {total > 0 ? `${startIdx}-${endIdx} of ${total}` : '0 total'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => hasPrevPage && setPage(p => p - 1)}
                  disabled={!hasPrevPage}
                  className={`p-1.5 rounded-md transition-colors border border-transparent ${hasPrevPage ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500' : 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-600'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <button
                  onClick={() => hasNextPage && setPage(p => p + 1)}
                  disabled={!hasNextPage}
                  className={`p-1.5 rounded-md transition-colors border border-transparent ${hasNextPage ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500' : 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-600'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto">
            {emails.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No emails yet for <span className="font-mono text-orange-600 dark:text-orange-500">{currentAddress}</span>.<br />
                <span className="text-sm">Waiting for incoming messages...</span>
              </div>
            )}
            {emails.map((email) => {
              const senderMatch = email.from?.match(/^([^<]+)/)
              const senderName = senderMatch ? senderMatch[1].trim() : email.from || 'Unknown'

              return (
                <Link key={email.id} to={`/inbox/${email.id}`} className={`email-row group flex items-center px-4 py-2 border-b border-gray-100 dark:border-gray-800/40 cursor-pointer relative z-0 block ${email.is_read ? 'bg-white dark:bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30' : 'bg-white dark:bg-gray-800/40 font-bold text-gray-900 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60'}`}>
                  <div className="w-32 md:w-48 shrink-0 text-sm truncate pr-2">
                    {senderName}
                  </div>
                  <div className="flex-1 text-sm min-w-0 pr-4">
                    <span className="truncate block">{email.subject || 'No Subject'}</span>
                  </div>
                  <div className="w-16 md:w-24 text-right text-xs shrink-0">
                    {formatEmailDate(email.received_at)}
                  </div>

                  <div className={`absolute right-0 top-0 bottom-0 hidden group-hover:flex items-center z-10 ${email.is_read ? 'bg-gradient-to-l from-gray-50 via-gray-50 dark:from-[#212328] dark:via-[#212328]' : 'bg-gradient-to-l from-gray-50 via-gray-50 dark:from-[#26282d] dark:via-[#26282d]'} to-transparent pl-8 pr-4`}>
                    <button
                      onClick={(e) => handleDelete(e, email.id)}
                      className="p-2 hover:bg-gray-200/60 dark:hover:bg-gray-600/50 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
