import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom' // Removed BrowserRouter import
import Login from './components/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
import Transactions from './components/Transactions.jsx'
import TransactionCreate from './components/TransactionCreate.jsx'
import EmailVerification from './components/EmailVerification.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken'))

  const handleLogin = (newToken) => {
    setToken(newToken)
    localStorage.setItem('authToken', newToken)
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('authToken')
  }

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/dashboard" element={
        <ErrorBoundary>
          <Dashboard token={token} onLogout={handleLogout} />
        </ErrorBoundary>
      } />
      <Route path="/transactions" element={<Transactions token={token} />} />
      <Route path="/transactions/create" element={<TransactionCreate token={token} />} />

      <Route path="/verify-email/:token" element={<EmailVerification />} />
      <Route path="/" element={<Login onLogin={handleLogin} />} />
    </Routes>
  )
}

export default App