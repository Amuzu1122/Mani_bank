import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Chart } from 'chart.js/auto'
import { 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  List, 
  LogOut, 
  Eye, 
  EyeOff,
  Menu,
  X,
  DollarSign,
  Activity,
  Users,
  Calendar,
  ChevronRight,
  User
} from 'lucide-react'

function Dashboard({ token, onLogout, isSidebarOpen, setIsSidebarOpen }) {
  const [userData, setUserData] = useState(null)
  const [error, setError] = useState('')
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const navigate = useNavigate()
  const storedToken = token || localStorage.getItem('authToken')

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (!storedToken) {
      onLogout()
      navigate('/login')
      return
    }
    const fetchDashboard = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/dashboard/', {
          headers: { Authorization: `Token ${storedToken}` },
        })
        setUserData(response.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard')
        if (err.response?.status === 403 || err.response?.status === 401) {
          onLogout()
          navigate('/login')
        }
      }
    }
    fetchDashboard()
  }, [storedToken, navigate, onLogout])

  useEffect(() => {
    if (userData && chartRef.current && userData.transactions) {
      if (chartInstance.current) chartInstance.current.destroy()
      const ctx = chartRef.current.getContext('2d')
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: userData.transactions.map(t => t.date || 'Unknown'),
          datasets: [{
            label: 'Transaction Amount',
            data: userData.transactions.map(t => t.amount || 0),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: { y: { beginAtZero: true } },
          responsive: true,
          maintainAspectRatio: false
        }
      })
    }
  }, [userData])

  // Close sidebar when clicking outside on mobile or when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false)
      }
    }

    const handleClickOutside = (e) => {
      if (window.innerWidth < 1024 && isSidebarOpen) {
        if (!e.target.closest('.sidebar-overlay')) {
          setIsSidebarOpen(false)
        }
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('click', handleClickOutside)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('click', handleClickOutside)
    }
  }, [isSidebarOpen, setIsSidebarOpen])

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-red-400 text-lg font-medium">{error}</p>
      </div>
    </div>
  )

  if (!userData) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg font-medium">Loading your dashboard...</p>
      </div>
    </div>
  )

  const accounts = userData.accounts || []
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
  const recentTransactions = userData.transactions || []

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden flex flex-col">
      {/* Animated background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.2) 25%, transparent 50%)`
        }}
      />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="flex flex-1 relative z-10">
        {/* Sidebar - Desktop */}
        <aside className={`bg-slate-800/80 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 min-h-screen ${
          isSidebarOpen ? 'w-64' : 'w-16'
        } hidden lg:block fixed top-0 left-0 z-40`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-700/50 mt-16">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-2 ${!isSidebarOpen && 'justify-center'}`}>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                {isSidebarOpen && (
                  <span className="text-white font-bold text-lg">Mani Banking</span>
                )}
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              >
                {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-slate-700/50">
            <div className={`flex items-center ${!isSidebarOpen && 'justify-center'}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">
                  {userData.first_name?.[0]}{userData.last_name?.[0]}
                </span>
              </div>
              {isSidebarOpen && (
                <div className="ml-3">
                  <h3 className="text-white font-semibold">
                    {userData.first_name} {userData.last_name}
                  </h3>
                  <p className="text-slate-400 text-sm">Premium Account</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            <button
              onClick={() => navigate('/transactions/create')}
              className="w-full flex items-center p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
              title="New Transaction"
            >
              <Plus className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && (
                <>
                  <span className="ml-3 font-medium">New Transaction</span>
                  <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
            
            <button
              onClick={() => navigate('/transactions')}
              className="w-full flex items-center p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
              title="All Transactions"
            >
              <List className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && (
                <>
                  <span className="ml-3 font-medium">All Transactions</span>
                  <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/accounts')}
              className="w-full flex items-center p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
              title="Accounts"
            >
              <CreditCard className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && (
                <>
                  <span className="ml-3 font-medium">Accounts</span>
                  <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/investments')}
              className="w-full flex items-center p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
              title="Investments"
            >
              <TrendingUp className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && (
                <>
                  <span className="ml-3 font-medium">Investments</span>
                  <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>

            {/* Conditional Dashboard link */}
            {window.location.pathname !== '/dashboard' && (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
                title="Dashboard"
              >
                <User className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && (
                  <>
                    <span className="ml-3 font-medium">Dashboard</span>
                    <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            )}
          </nav>

          {/* User Actions */}
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
              title="Profile"
            >
              <User className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && (
                <>
                  <span className="ml-3 font-medium">Profile</span>
                  <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="ml-3 font-medium">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={toggleSidebar}>
            <div 
              className="bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 w-80 max-w-[85vw] min-h-screen p-4 z-50 sidebar-overlay"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between mb-6 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                  <span className="text-white font-bold text-lg">Mani Banking</span>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile */}
              <div className="border-b border-slate-700/50 mb-6 pb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {userData.first_name?.[0]}{userData.last_name?.[0]}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-white font-semibold">
                      {userData.first_name} {userData.last_name}
                    </h3>
                    <p className="text-slate-400 text-sm">Premium Account</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2 mb-6">
                <button
                  onClick={() => { navigate('/transactions/create'); toggleSidebar(); }}
                  className="w-full flex items-center p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                  title="New Transaction"
                >
                  <Plus className="w-5 h-5 flex-shrink-0" />
                  <span className="ml-3 font-medium">New Transaction</span>
                </button>
                
                <button
                  onClick={() => { navigate('/transactions'); toggleSidebar(); }}
                  className="w-full flex items-center p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                  title="All Transactions"
                >
                  <List className="w-5 h-5 flex-shrink-0" />
                  <span className="ml-3 font-medium">All Transactions</span>
                </button>

                <button
                  onClick={() => { navigate('/accounts'); toggleSidebar(); }}
                  className="w-full flex items-center p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                  title="Accounts"
                >
                  <CreditCard className="w-5 h-5 flex-shrink-0" />
                  <span className="ml-3 font-medium">Accounts</span>
                </button>

                <button
                  onClick={() => { navigate('/investments'); toggleSidebar(); }}
                  className="w-full flex items-center p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                  title="Investments"
                >
                  <TrendingUp className="w-5 h-5 flex-shrink-0" />
                  <span className="ml-3 font-medium">Investments</span>
                </button>

                {window.location.pathname !== '/dashboard' && (
                  <button
                    onClick={() => { navigate('/dashboard'); toggleSidebar(); }}
                    className="w-full flex items-center p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                    title="Dashboard"
                  >
                    <User className="w-5 h-5 flex-shrink-0" />
                    <span className="ml-3 font-medium">Dashboard</span>
                  </button>
                )}
              </nav>

              {/* User Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => { navigate('/profile'); toggleSidebar(); }}
                  className="w-full flex items-center p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                  title="Profile"
                >
                  <User className="w-5 h-5 flex-shrink-0" />
                  <span className="ml-3 font-medium">Profile</span>
                </button>
                <button
                  onClick={() => { handleLogout(); toggleSidebar(); }}
                  className="w-full flex items-center p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span className="ml-3 font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen && !isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'} pt-16`}>
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-grow">
            {/* Welcome Header */}
            <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Welcome back, {userData.first_name}!
                  </h1>
                  <p className="text-slate-400 text-sm sm:text-base">Here's what's happening with your finances today.</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-slate-400 text-sm mb-1">Total Portfolio Value</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl sm:text-3xl font-bold text-white">
                      {balanceVisible ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
                    </span>
                    <button
                      onClick={() => setBalanceVisible(!balanceVisible)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                      title={balanceVisible ? "Hide Balance" : "Show Balance"}
                    >
                      {balanceVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" title="Total Balance" />
                  </div>
                  <span className="text-green-400 text-xs sm:text-sm font-medium">+12.5%</span>
                </div>
                <h3 className="text-white font-semibold text-sm sm:text-lg">Total Balance</h3>
                <p className="text-slate-400 text-xs sm:text-sm">Across all accounts</p>
              </div>

              <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" title="Monthly Income" />
                  </div>
                  <span className="text-green-400 text-xs sm:text-sm font-medium">+8.2%</span>
                </div>
                <h3 className="text-white font-semibold text-sm sm:text-lg">Monthly Income</h3>
                <p className="text-slate-400 text-xs sm:text-sm">$5,200.00</p>
              </div>

              <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" title="Transactions" />
                  </div>
                  <span className="text-purple-400 text-xs sm:text-sm font-medium">{recentTransactions.length}</span>
                </div>
                <h3 className="text-white font-semibold text-sm sm:text-lg">Transactions</h3>
                <p className="text-slate-400 text-xs sm:text-sm">This month</p>
              </div>

              <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" title="Investments" />
                  </div>
                  <span className="text-green-400 text-xs sm:text-sm font-medium">+15.3%</span>
                </div>
                <h3 className="text-white font-semibold text-sm sm:text-lg">Investments</h3>
                <p className="text-slate-400 text-xs sm:text-sm">Portfolio growth</p>
              </div>
            </div>

            {/* Accounts Section */}
            <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Your Accounts</h2>
                <button
                  onClick={() => navigate('/accounts')}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 text-sm sm:text-base"
                >
                  View All →
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {accounts.map((acc, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-600/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 group"
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" title={`${acc.account_type} Account`} />
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        acc.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {acc.status}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-base sm:text-lg mb-1">{acc.account_type}</h3>
                    <p className="text-slate-400 text-xs sm:text-sm mb-2 sm:mb-3">{acc.account_number}</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">
                      ${acc.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Recent Transactions</h2>
                <button
                  onClick={() => navigate('/transactions')}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 text-sm sm:text-base"
                >
                  View All →
                </button>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {recentTransactions.slice(0, 5).map((trans, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 sm:p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${
                        trans.type === 'credit' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trans.type === 'credit' ? (
                          <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" title="Credit Transaction" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" title="Debit Transaction" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-white font-medium text-sm sm:text-base truncate">{trans.description}</h4>
                        <p className="text-slate-400 text-xs sm:text-sm">{trans.date} • {trans.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-sm sm:text-lg ${
                        trans.type === 'credit' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {trans.type === 'credit' ? '+' : ''}${Math.abs(trans.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction Reports */}
            <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Transaction Reports</h2>
              <div className="h-48 sm:h-64">
                <canvas ref={chartRef}></canvas>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard