import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Dashboard({ token, onLogout }) {
  const [userData, setUserData] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/dashboard/', {
          headers: { Authorization: `Token ${token}` },
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
  }, [token, navigate, onLogout])

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-red-500">{error}</p>
    </div>
  )

  if (!userData) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p>Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Welcome, {userData.first_name} {userData.last_name}</h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Account Details</h3>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Username:</strong> {userData.username}</p>
            <p><strong>Phone:</strong> {userData.phone_number || 'Not provided'}</p>
            <p><strong>Date of Birth:</strong> {userData.date_of_birth || 'Not provided'}</p>
            <p><strong>Address:</strong> {userData.address || 'Not provided'}</p>
            <p><strong>Email Verified:</strong> {userData.is_email_verified ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Account</h3>
            <p><strong>Account Number:</strong> {userData.account.account_number}</p>
            <p><strong>Type:</strong> {userData.account.account_type}</p>
            <p><strong>Balance:</strong> ${userData.account.balance}</p>
            <p><strong>Status:</strong> {userData.account.status}</p>
            {userData.account_status_message && (
              <p className="text-red-500 mt-2">{userData.account_status_message}</p>
            )}
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={() => navigate('/transactions')}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 mr-2"
          >
            View Transactions
          </button>
          <button
            onClick={() => navigate('/transactions/create')}
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
          >
            Create Transaction
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard