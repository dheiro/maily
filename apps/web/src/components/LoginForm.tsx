import { useState } from 'react'
import { InboxIcon } from 'lucide-react'
import { api } from '../lib/api'

interface LoginFormProps {
  onLogin: (username: string) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = await api.auth.login(username, password)
      onLogin(data.username)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      alert(message)
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-sans antialiased min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-md mb-4">
            <InboxIcon className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">Welcome to Maily</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Access your disposable inbox control panel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
            <div className="relative">
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-medium dark:text-white"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm dark:text-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full bg-orange-600 text-white py-2.5 rounded-lg hover:bg-orange-700 font-semibold shadow-sm transition-colors mt-2">
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
