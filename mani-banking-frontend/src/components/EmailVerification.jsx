import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

function EmailVerification() {
  const { token } = useParams()
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/verify-email/${token}/`)
        setMessage(response.data.message)
        setTimeout(() => navigate('/login'), 3000)
      } catch (err) {
        setMessage(err.response?.data?.error || 'Verification failed')
      }
    }
    verifyEmail()
  }, [token, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Email Verification</h2>
        <p>Please wait while we verify your email address</p>
        <p className={message.includes('success') ? 'text-green-500' : 'text-red-500'}>
          {message}
        </p>
      </div>
    </div>
  )
}

export default EmailVerification