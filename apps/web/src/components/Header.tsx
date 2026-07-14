import { Link } from 'react-router-dom'
import { InboxIcon } from 'lucide-react'
import { DarkModeToggle } from './DarkModeToggle'
import { UserMenu } from './UserMenu'

interface HeaderProps {
  user: string
  isDarkMode: boolean
  onToggleDarkMode: () => void
  onLogout: () => void
}

export function Header({ user, isDarkMode, onToggleDarkMode, onLogout }: HeaderProps) {
  return (
    <header className="w-full border-b border-gray-100 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-gray-950 z-10">
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 h-16 max-w-6xl w-full mx-auto">
        <Link to="/inbox" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <InboxIcon className="w-5 h-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">Maily</span>
        </Link>

        <div className="flex items-center justify-end gap-2 w-1/2 md:w-1/4">
          <DarkModeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  )
}
