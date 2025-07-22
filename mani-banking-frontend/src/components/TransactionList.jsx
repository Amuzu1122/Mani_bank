import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function TransactionList({ token }) {
  const [transactions, setTransactions] = useState([])
  const [filters, setFilters] = useState({ type: '', status: '', date_from: '', date_to: '', search: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const params = new URLSearchParams(filters)
        const response = await axios.get(`http://localhost:8000/api/transactions/?${params.toString()}`, {
          headers: { Authorization: `Token ${token}` },
        })
        setTransactions(response.data.results || response.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load transactions')
        if (err.response?.status === 403 || err.response?.status === 401) {
          navigate('/login')
        }
      }
    }
    fetchTransactions()
  }, [filters, token, navigate])

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleApprove = async (id) => {
    try {
      await axios.post(`http://localhost:8000/api/transactions/${id}/approve/`, {}, {
        headers: { Authorization: `Token ${token}` },
      })
      setTransactions(transactions.map(tx => tx.id === id ? { ...tx, status: 'completed' } : tx))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve transaction')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Transactions</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="mt-1 p-2 w-full border rounded-md"
            >
              <option value="">All</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="mt-1 p-2 w-full border rounded-md"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Search description or amount"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Type</th>
                <th className="py-2 px-4 border-b">Amount</th>
                <th className="py-2 px-4 border-b">Description</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id}>
                  <td className="py-2 px-4 border-b">{tx.id}</td>
                  <td className="py-2 px-4 border-b">{tx.transaction_type}</td>
                  <td className="py-2 px-4 border-b">${tx.amount}</td>
                  <td className="py-2 px-4 border-b">{tx.description}</td>
                  <td className="py-2 px-4 border-b">{tx.status}</td>
                  <td className="py-2 px-4 border-b">{new Date(tx.date).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">
                    {tx.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(tx.id)}
                        className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}

export default TransactionList