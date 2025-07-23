import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Chart } from 'chart.js/auto'

function Dashboard({ token, onLogout }) {
  const [userData, setUserData] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const storedToken = token || localStorage.getItem('authToken')
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

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
        console.log('Dashboard Data:', response.data) // Debug log
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
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
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

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <p className="text-red-600 text-lg font-medium">{error}</p>
    </div>
  )

  if (!userData) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <p className="text-gray-600 text-lg font-medium">Loading...</p>
    </div>
  )

  const totalBalance = userData.accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-md">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {userData.first_name} {userData.last_name}</h1>
          <p className="text-xl text-gray-600 mt-2">Total Balance: ${totalBalance.toFixed(2)}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
        >
          Logout
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Accounts</h2>
        <div className="space-y-4">
          {userData.accounts && userData.accounts.length > 0 ? (
            userData.accounts.map((acc, index) => (
              <div key={index} className="border-b pb-2">
                <p className="text-gray-900 font-medium">Account #{acc.account_number || 'N/A'}</p>
                <p className="text-gray-600">Type: {acc.account_type || 'N/A'}</p>
                <p className="text-gray-600">Balance: ${acc.balance || 0}</p>
                <p className="text-gray-600">Status: {acc.status || 'N/A'}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No accounts found.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {userData.transactions && userData.transactions.length > 0 ? (
              userData.transactions.slice(0, 5).map((trans, index) => (
                <div key={index} className="border-b pb-2">
                  <p className="text-gray-900 font-medium">{trans.description || 'N/A'}</p>
                  <p className="text-gray-600">Amount: ${trans.amount || 0}</p>
                  <p className="text-gray-600">Date: {trans.date || 'N/A'}</p>
                  <p className="text-gray-600">Status: {trans.status || 'N/A'}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No recent transactions.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Transaction Reports</h2>
          <div className="h-64">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
      </div>

      <div className="mt-6 flex space-x-4">
        <button
          onClick={() => navigate('/transactions')}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
        >
          View All Transactions
        </button>
        <button
          onClick={() => navigate('/transactions/create')}
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition duration-200"
        >
          Create Transaction
        </button>
      </div>
    </div>
  )
}

export default Dashboard