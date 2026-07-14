import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, LogOut, Settings as SettingsIcon, User } from 'lucide-react'
import { useClickOutside } from '../hooks/useClickOutside'
import { api } from '../lib/api'

interface UserMenuProps {
  user: string
  onLogout: () => void
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))

  const handleLogout = async () => {
    await api.auth.logout().catch(() => {})
    setOpen(false)
    onLogout()
    window.location.href = '/'
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 pl-3 pr-2 text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 bg-gray-50 dark:bg-gray-900 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-orange-200 dark:hover:border-gray-700"
      >
        <User className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:block truncate max-w-[100px] capitalize">{user}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-100 dark:border-gray-800 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 sm:hidden">
            <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate capitalize">{user}</p>
          </div>
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
          >
            <SettingsIcon className="w-4 h-4" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
