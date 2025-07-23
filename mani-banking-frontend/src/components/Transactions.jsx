import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Transactions({ token }) {
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const storedToken = token || localStorage.getItem('authToken')

  useEffect(() => {
    if (!storedToken) {
      navigate('/login')
      return
    }
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/transactions/', {
          headers: { Authorization: `Token ${storedToken}` },
        })
        setTransactions(response.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load transactions')
      }
    }
    fetchTransactions()
  }, [storedToken, navigate])

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <p className="text-red-600 text-lg font-medium">{error}</p>
    </div>
  )

  if (!transactions.length) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <p className="text-gray-600 text-lg font-medium">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Transactions</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        {transactions.map((trans, index) => (
          <div key={index} className="border-b pb-4 mb-4 last:border-b-0 last:mb-0">
            <p className="text-gray-900 font-medium">{trans.description || 'N/A'}</p>
            <p className="text-gray-600">Amount: ${trans.amount || 0}</p>
            <p className="text-gray-600">Date: {trans.date || 'N/A'}</p>
            <p className="text-gray-600">Status: {trans.status || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Transactions