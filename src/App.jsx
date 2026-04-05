import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { Layout } from './components/Layout/Layout'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { DashboardPage } from './pages/DashboardPage'
import { TracksPage } from './pages/TracksPage'
import { TrackDetailPage } from './pages/TrackDetailPage'
import { QuestionBankPage } from './pages/QuestionBankPage'
import { QuestionDetailPage } from './pages/QuestionDetailPage'
import { AddQuestionPage } from './pages/AddQuestionPage'
import { ResourcesPage } from './pages/ResourcesPage'
import { AddResourcePage } from './pages/AddResourcePage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { JournalPage } from './pages/JournalPage'

function ProtectedRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">PT</span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <DataProvider>
      <Layout />
    </DataProvider>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tracks" element={<TracksPage />} />
            <Route path="/tracks/:id" element={<TrackDetailPage />} />
            <Route path="/questions" element={<QuestionBankPage />} />
            <Route path="/questions/new" element={<AddQuestionPage />} />
            <Route path="/questions/:id" element={<QuestionDetailPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/resources/new" element={<AddResourcePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/journal" element={<JournalPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-sm font-medium',
          style: { borderRadius: '10px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
          duration: 3000,
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
        }}
      />
    </HashRouter>
  )
}
