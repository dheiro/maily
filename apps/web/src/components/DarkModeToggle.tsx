import { Moon, Sun } from 'lucide-react'

interface DarkModeToggleProps {
  isDarkMode: boolean
  onToggle: () => void
}

export function DarkModeToggle({ isDarkMode, onToggle }: DarkModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="p-2 text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
      title="Toggle Dark Mode"
    >
      {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}
