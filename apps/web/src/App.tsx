import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { LoginForm } from './components/LoginForm'
import Inbox from './pages/Inbox'
import EmailDetail from './pages/EmailDetail'
import Settings from './pages/Settings'
import { useDarkMode } from './hooks/useDarkMode'
import { useCurrentUser } from './hooks/useCurrentUser'
import { queryKeys } from './lib/query-keys'

const AppContent = ({
  user, selectedUsername, setSelectedUsername, selectedDomain, setSelectedDomain, isAutoRefresh, setIsAutoRefresh,
}: {
  user: string,
  selectedUsername: string, setSelectedUsername: (u: string) => void,
  selectedDomain: string, setSelectedDomain: (d: string) => void,
  isAutoRefresh: boolean, setIsAutoRefresh: (v: boolean) => void,
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  // Redirect to inbox if username or domain changes while viewing a detail page
  useEffect(() => {
    if (location.pathname.match(/^\/inbox\/.+/)) {
      navigate('/inbox')
    }
  }, [selectedUsername, selectedDomain])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inbox" replace />} />
      <Route path="/inbox" element={<Inbox
        username={selectedUsername}
        setUsernameState={setSelectedUsername}
        selectedDomain={selectedDomain}
        setSelectedDomain={setSelectedDomain}
        currentUser={user}
        isAutoRefresh={isAutoRefresh}
        setIsAutoRefresh={setIsAutoRefresh}
      />} />
      <Route path="/inbox/:id" element={<EmailDetail />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

export default function App() {
  const { user, loading } = useCurrentUser()
  const queryClient = useQueryClient()
  const [isDarkMode, setIsDarkMode] = useDarkMode()

  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [selectedUsername, setSelectedUsername] = useState<string>('')
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLogin={() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
    }} />
  }

  const handleLogout = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
  }

  return (
    <BrowserRouter>
      <div className="bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans antialiased h-screen flex flex-col overflow-hidden">
        <Header
          user={user}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onLogout={handleLogout}
        />

        <main className="flex-1 flex flex-col bg-white dark:bg-gray-950 min-w-0 max-w-6xl w-full mx-auto shadow-[0_0_40px_rgba(0,0,0,0.02)] dark:shadow-none pt-0 overflow-hidden">
          <AppContent
            user={user}
            selectedUsername={selectedUsername}
            setSelectedUsername={setSelectedUsername}
            selectedDomain={selectedDomain}
            setSelectedDomain={setSelectedDomain}
            isAutoRefresh={isAutoRefresh}
            setIsAutoRefresh={setIsAutoRefresh}
          />
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}
