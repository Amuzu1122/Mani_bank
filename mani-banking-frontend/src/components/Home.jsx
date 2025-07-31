import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, TrendingUp, Clock, CreditCard, PieChart, Lock } from 'lucide-react'

function Home() {
  const navigate = useNavigate()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    { icon: Shield, title: "Bank-Grade Security", desc: "256-bit encryption & biometric authentication" },
    { icon: TrendingUp, title: "Smart Investments", desc: "AI-powered portfolio management" },
    { icon: Clock, title: "24/7 Support", desc: "Round-the-clock customer assistance" },
    { icon: CreditCard, title: "Premium Cards", desc: "Exclusive rewards & cashback programs" },
    { icon: PieChart, title: "Financial Insights", desc: "Advanced analytics & spending tracking" },
    { icon: Lock, title: "Fraud Protection", desc: "Real-time transaction monitoring" }
  ]

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Animated background gradient */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.2) 25%, transparent 50%)`
        }}
      />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Navigation */}
      <nav className="relative z-20 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 group hover:scale-105 transition-transform duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-200">
              <span className="text-white font-bold text-sm">CGF</span>
            </div>
            <span className="text-white font-bold text-xl group-hover:text-blue-400 transition-colors duration-200">
              CrownGate Finance
            </span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                Banking
                <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Reimagined
                </span>
              </h1>
              <p className="text-xl text-slate-300 max-w-lg leading-relaxed">
                Experience the future of financial services with AI-powered insights, 
                unparalleled security, and seamless digital experiences.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center">
                  Get Started Free
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 border-2 border-slate-600 text-white font-semibold rounded-xl hover:border-blue-500 hover:bg-blue-500/10 transition-all duration-300"
              >
                Sign In
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center space-x-6 pt-8">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm text-slate-400">FDIC Insured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-green-400" />
                <span className="text-sm text-slate-400">256-bit SSL</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">★★★★★ 4.9/5</span>
              </div>
            </div>
          </div>

          {/* Right Content - Floating Cards */}
          <div className="relative lg:pl-16">
            <div className="relative w-full h-96">
              {/* Main Card */}
              <div className={`absolute top-0 right-0 w-80 h-48 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl transform hover:scale-105 transition-all duration-500 ${isVisible ? 'animate-float' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-slate-400 text-sm">Total Balance</p>
                    <p className="text-white text-2xl font-bold">$24,580.32</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Checking</span>
                    <span className="text-white text-sm">$8,420.15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Savings</span>
                    <span className="text-white text-sm">$16,160.17</span>
                  </div>
                </div>
              </div>

              {/* Transaction Card */}
              <div className={`absolute bottom-0 left-0 w-72 h-40 bg-gradient-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-5 shadow-2xl transform hover:scale-105 transition-all duration-500 ${isVisible ? 'animate-float-delayed' : ''}`}>
                <h3 className="text-white font-semibold mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  {[
                    { name: "Netflix", amount: "-$15.99", color: "text-red-400" },
                    { name: "Salary Deposit", amount: "+$5,200", color: "text-green-400" }
                  ].map((transaction, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-slate-300 text-sm">{transaction.name}</span>
                      <span className={`text-sm font-medium ${transaction.color}`}>
                        {transaction.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Why Choose CrownGate Finance?
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Advanced technology meets personalized service to deliver exceptional banking experiences
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite 2s;
        }
      `}</style>
    </div>
  )
}

export default Home