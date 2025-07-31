import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, X, Bell, ChevronDown } from 'lucide-react'

function Navbar({ token, onLogout, isSidebarOpen, toggleSidebar }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogoClick = () => {
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  const handleNavClick = (path) => {
    navigate(path)
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMobileMenuOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navigationItems = ['Personal', 'Business', 'Investments', 'About']

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-xl' 
          : 'bg-slate-900/80 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Dashboard Sidebar Toggle */}
            <div className="flex items-center space-x-4">
              {/* Dashboard sidebar toggle (only show for signed-in users on dashboard) */}
              {token && window.location.pathname === '/dashboard' && (
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
                >
                  {isSidebarOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* Logo */}
              <button
                onClick={handleLogoClick}
                className="flex items-center space-x-2 group hover:scale-105 transition-transform duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-200">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-white font-bold text-lg sm:text-xl group-hover:text-blue-400 transition-colors duration-200">
                  Mani Banking
                </span>
              </button>
            </div>

            {/* Center - Navigation Links (Desktop) */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item}
                  onClick={() => handleNavClick(`/${item.toLowerCase()}`)}
                  className="text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-all duration-200 font-medium"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Right side - User actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {token ? (
                <>
                  {/* Notifications - only show on dashboard */}
                  {window.location.pathname === '/dashboard' && (
                    <button className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200">
                      <Bell className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    </button>
                  )}

                  {/* User Menu Dropdown (Mobile & Desktop) */}
                  <div className="relative">
                    <button
                      onClick={onLogout}
                      className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 transition-all duration-200 text-sm"
                    >
                      Logout
                    </button>
                  </div>

                  {/* Mobile hamburger menu (only when not on dashboard or dashboard sidebar is closed) */}
                  {(!token || window.location.pathname !== '/dashboard') && (
                    <button
                      onClick={toggleMobileMenu}
                      className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
                    >
                      {isMobileMenuOpen ? (
                        <X className="w-5 h-5" />
                      ) : (
                        <Menu className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* Login/Signup buttons for non-authenticated users (Desktop) */}
                  <div className="hidden sm:flex items-center space-x-3">
                    <button
                      onClick={() => handleNavClick('/login')}
                      className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors duration-200"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleNavClick('/signup')}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all duration-200"
                    >
                      Get Started
                    </button>
                  </div>

                  {/* Mobile hamburger menu for non-authenticated users */}
                  <button
                    onClick={toggleMobileMenu}
                    className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <Menu className="w-5 h-5" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu Panel */}
          <div className="fixed top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl animate-fade-in">
            <div className="px-4 py-6 space-y-4">
              {/* Navigation Links */}
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleNavClick(`/${item.toLowerCase()}`)}
                    className="w-full text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 font-medium"
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Authentication buttons for non-authenticated users */}
              {!token && (
                <div className="pt-4 border-t border-slate-700/50 space-y-3">
                  <button
                    onClick={() => handleNavClick('/login')}
                    className="w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 font-medium text-left"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavClick('/signup')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  )
}

export default Navbar