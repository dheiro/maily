import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Copy, Check, ChevronDown, X } from 'lucide-react'
import { Menu } from '@headlessui/react'
import { api } from '../lib/api'
import { queryKeys } from '../lib/query-keys'

interface EmailSelectorProps {
  username: string
  setUsernameState: (u: string) => void
  selectedDomain: string
  setSelectedDomain: (d: string) => void
  currentUser: string
}

export default function EmailSelector({ username, setUsernameState, selectedDomain, setSelectedDomain }: EmailSelectorProps) {
  const [copied, setCopied] = useState(false)
  const [localUsername, setLocalUsername] = useState(username)

  useEffect(() => {
    setLocalUsername(username)
  }, [username])

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localUsername !== username) {
        setUsernameState(localUsername)
      }
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [localUsername, username, setUsernameState])

  const { data: domainsData } = useQuery({
    queryKey: queryKeys.domains.list(),
    queryFn: api.domains.list,
    staleTime: Infinity,
  })

  const domains = domainsData?.domains || []

  useEffect(() => {
    if (domains.length > 0 && !selectedDomain) {
      setSelectedDomain(domains[0].name)
    }
  }, [domains])

  const handleCopy = () => {
    const fullAddress = `${username}@${selectedDomain}`
    navigator.clipboard.writeText(fullAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex-shrink-0">

      {/* Desktop Version (lg+) */}
      <div className="hidden lg:flex items-center justify-end">
        <div className="flex items-center bg-gray-50/50 dark:bg-gray-900/50 rounded-lg p-1 border border-gray-200/60 dark:border-gray-800 shadow-sm hover:bg-white dark:hover:bg-gray-900 hover:border-orange-300 dark:hover:border-orange-500/50">

          {/* Username Input */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Username"
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
              className="appearance-none bg-transparent text-gray-800 dark:text-gray-200 text-sm font-semibold focus:outline-none w-32 md:w-56 py-1.5 pl-3 pr-8 placeholder-gray-400 dark:placeholder-gray-600 focus:ring-0"
            />
            <div className="absolute right-0 flex items-center pr-2">
              {localUsername && (
                <button
                  onClick={() => { setLocalUsername(''); setUsernameState(''); }}
                  className="p-0.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 z-10"
                  title="Clear"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <span className="text-gray-300 dark:text-gray-600 px-1 font-light">@</span>

          {/* Domain Dropdown via Headless UI */}
          <Menu as="div" className="relative inline-block text-left">
            {({ open }) => (
              <>
                <Menu.Button className="flex items-center justify-between appearance-none bg-transparent text-gray-500 dark:text-gray-400 text-sm font-medium focus:outline-none w-28 md:w-40 py-1.5 pl-2 pr-2 cursor-pointer hover:text-orange-600 dark:hover:text-orange-500">
                  <span className="truncate">{selectedDomain || 'select domain'}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
                </Menu.Button>

                <Menu.Items className="absolute right-0 mt-2 w-full origin-top-right rounded-md bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50 overflow-hidden border border-gray-100 dark:border-gray-800">
                  <div className="py-0 max-h-60 overflow-y-auto">
                    {domains.map((d) => (
                      <Menu.Item key={d.id}>
                        {({ active }) => (
                          <button
                            onClick={() => setSelectedDomain(d.name)}
                            className={`block w-full text-left px-4 py-2 text-sm cursor-pointer ${
                              active || selectedDomain === d.name ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {d.name}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </>
            )}
          </Menu>

          <div className="h-5 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>
          <button
            onClick={handleCopy}
            className="p-1.5 ml-1 text-gray-400 hover:text-orange-600 dark:text-gray-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-md"
            title="Copy Address"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Version */}
      <div className="lg:hidden flex items-center bg-gray-50/50 dark:bg-gray-900/50 rounded-lg p-1 border border-gray-200/60 dark:border-gray-800 shadow-sm w-full justify-between hover:bg-white dark:hover:bg-gray-900 hover:border-orange-300 dark:hover:border-orange-500/50">

        {/* Username Input */}
        <div className="relative flex-1">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Username..."
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
              className="appearance-none bg-transparent text-gray-800 dark:text-gray-200 text-sm font-semibold focus:outline-none w-full py-1.5 pl-3 pr-8 placeholder-gray-400 dark:placeholder-gray-600 focus:ring-0"
            />
            <div className="absolute right-0 flex items-center pr-2">
              {localUsername && (
                <button
                  onClick={() => { setLocalUsername(''); setUsernameState(''); }}
                  className="p-0.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 z-10"
                  title="Clear"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <span className="text-gray-300 dark:text-gray-600 px-0.5 font-light">@</span>

        {/* Domain Dropdown via Headless UI */}
        <Menu as="div" className="relative flex-1 text-left">
          {({ open }) => (
            <>
              <Menu.Button className="flex items-center justify-end appearance-none bg-transparent text-gray-500 dark:text-gray-400 text-sm font-medium focus:outline-none w-full py-1.5 pl-1 pr-2 cursor-pointer hover:text-orange-600 dark:hover:text-orange-500 text-right">
                <span className="truncate">{selectedDomain || 'select domain'}</span>
                <ChevronDown className={`w-3.5 h-3.5 ml-1 text-gray-400 dark:text-gray-500 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
              </Menu.Button>

              <Menu.Items className="absolute right-0 mt-2 w-full min-w-[150px] origin-top-right rounded-md bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50 overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="py-0 max-h-60 overflow-y-auto">
                  {domains.map((d) => (
                    <Menu.Item key={d.id}>
                      {({ active }) => (
                        <button
                          onClick={() => setSelectedDomain(d.name)}
                          className={`${
                            active || selectedDomain === d.name ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
                          } group flex w-full items-center px-4 py-2.5 text-sm font-medium`}
                        >
                          <span className="truncate">{d.name}</span>
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </>
          )}
        </Menu>

        <div className="h-5 w-px bg-gray-200 dark:bg-gray-800 mx-1 shrink-0"></div>
        <button
          onClick={handleCopy}
          className="p-1.5 text-gray-400 hover:text-orange-600 dark:text-gray-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-md shrink-0"
          title="Copy Address"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

    </div>
  )
}
