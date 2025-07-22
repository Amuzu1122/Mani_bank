import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import EmailVerification from './components/EmailVerification'
import TransactionCreate from './components/TransactionCreate'
import TransactionList from './components/TransactionList'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null)

  const handleLogin = (newToken) => {
    setToken(newToken)
    localStorage.setItem('token', newToken)
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('token')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        <Route
          path="/dashboard"
          element={token ? <Dashboard token={token} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/transactions/create"
          element={token ? <TransactionCreate token={token} /> : <Navigate to="/login" />}
        />
        <Route
          path="/transactions"
          element={token ? <TransactionList token={token} /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

export default App