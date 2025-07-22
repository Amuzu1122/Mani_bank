import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function TransactionCreate({ token }) {
  const [formData, setFormData] = useState({
    account: '',
    amount: '',
    description: '',
    transaction_type: 'deposit',
    recipient_account: '',
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = { ...formData }
      if (data.transaction_type !== 'transfer') delete data.recipient_account
      await axios.post('http://localhost:8000/api/transactions/create/', data, {
        headers: { Authorization: `Token ${token}` },
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Transaction creation failed')
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Transaction</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="account">
              Account ID
            </label>
            <input
              type="number"
              id="account"
              name="account"
              value={formData.account}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="amount">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="description">
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="transaction_type">
              Transaction Type
            </label>
            <select
              id="transaction_type"
              name="transaction_type"
              value={formData.transaction_type}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          {formData.transaction_type === 'transfer' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700" htmlFor="recipient_account">
                Recipient Account ID
              </label>
              <input
                type="number"
                id="recipient_account"
                name="recipient_account"
                value={formData.recipient_account}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Create Transaction
          </button>
        </form>
      </div>
    </div>
  )
}

export default TransactionCreate