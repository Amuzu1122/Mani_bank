import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Dashboard from './components/Dashboard'
import Home from './components/Home'
import Login from './components/Login'
import Transactions from './components/Transactions'
import TransactionCreate from './components/TransactionCreate'
import EmailVerification from './components/EmailVerification'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken') || null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogin = (newToken) => {
    setToken(newToken)
    localStorage.setItem('authToken', newToken)
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('authToken')
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Navbar
        token={token}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <div className="flex flex-1">
        <div className="w-full flex flex-col">
          {/* Offset for fixed navbar */}
          <div className="pt-16 flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/verify-email/:token" element={<EmailVerification />} />
              <Route path="/dashboard" element={
                <ErrorBoundary>
                  <Dashboard 
                    token={token} 
                    onLogout={handleLogout} 
                    isSidebarOpen={isSidebarOpen} 
                    setIsSidebarOpen={setIsSidebarOpen} 
                  />
                </ErrorBoundary>
              } />
              <Route path="/transactions" element={<Transactions token={token} />} />
              <Route path="/transactions/create" element={<TransactionCreate token={token} />} />
              {/* Optional: Fallback route */}
              <Route path="*" element={<Login onLogin={handleLogin} />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default App