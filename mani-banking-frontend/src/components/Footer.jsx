import { MapPin, Phone, Mail, Clock, Shield, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

function Footer() {
  const navigate = (path) => {
    console.log(`Navigating to: ${path}`)
    // In a real app, this would use react-router-dom
  }

  const branches = [
    {
      name: "Downtown Main Branch",
      address: "123 Financial District, Suite 100",
      city: "New York, NY 10004",
      phone: "(555) 123-4567",
      hours: "Mon-Fri: 9AM-5PM, Sat: 9AM-2PM"
    },
    {
      name: "Midtown Branch",
      address: "456 Business Avenue, Floor 2", 
      city: "New York, NY 10018",
      phone: "(555) 234-5678",
      hours: "Mon-Fri: 8:30AM-6PM, Sat: 9AM-3PM"
    },
    {
      name: "Brooklyn Heights Branch",
      address: "789 Heights Boulevard",
      city: "Brooklyn, NY 11201", 
      phone: "(555) 345-6789",
      hours: "Mon-Fri: 9AM-5PM, Sat: 10AM-2PM"
    }
  ]

  const quickLinks = [
    { name: "Personal Banking", path: "/personal" },
    { name: "Business Banking", path: "/business" },
    { name: "Loans & Mortgages", path: "/loans" },
    { name: "Investment Services", path: "/investments" },
    { name: "Credit Cards", path: "/cards" },
    { name: "Online Banking", path: "/online-banking" }
  ]

  const supportLinks = [
    { name: "Customer Support", path: "/support" },
    { name: "ATM Locations", path: "/atm-locations" }, 
    { name: "Security Center", path: "/security" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Careers", path: "/careers" }
  ]

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/manibanking", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/manibanking", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/manibanking", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com/company/manibanking", label: "LinkedIn" }
  ]

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">
          
          {/* Company Info & Contact */}
          <div className="lg:col-span-1 space-y-6">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="text-white font-bold text-xl">Mani Banking</span>
            </div>
            
            <p className="text-slate-400 leading-relaxed">
              Your trusted financial partner since 1985. We provide comprehensive banking solutions 
              with cutting-edge technology and personalized service.
            </p>

            {/* Main Contact Info */}
            <div className="space-y-3">
              <a 
                href="tel:+15556264226"
                className="flex items-center space-x-3 group hover:bg-slate-800/30 p-3 rounded-lg transition-all duration-200"
              >
                <Phone className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform duration-200" />
                <div>
                  <p className="text-white font-medium group-hover:text-blue-400 transition-colors duration-200">Customer Service</p>
                  <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-200">(555) MANI-BANK</p>
                </div>
              </a>
              
              <a 
                href="mailto:support@manibanking.com"
                className="flex items-center space-x-3 group hover:bg-slate-800/30 p-3 rounded-lg transition-all duration-200"
              >
                <Mail className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform duration-200" />
                <div>
                  <p className="text-white font-medium group-hover:text-blue-400 transition-colors duration-200">Email Support</p>
                  <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-200">support@manibanking.com</p>
                </div>
              </a>

              <a 
                href="tel:+15556264227"
                className="flex items-center space-x-3 group hover:bg-slate-800/30 p-3 rounded-lg transition-all duration-200"
              >
                <Clock className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform duration-200" />
                <div>
                  <p className="text-white font-medium group-hover:text-blue-400 transition-colors duration-200">24/7 Phone Banking</p>
                  <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-200">Always available</p>
                </div>
              </a>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-slate-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Branch Locations */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-lg">Branch Locations</h3>
            <div className="space-y-6">
              {branches.map((branch, index) => (
                <div key={index} className="group">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-white font-semibold group-hover:text-blue-400 transition-colors duration-200">
                        {branch.name}
                      </h4>
                      <p className="text-slate-400 text-sm">{branch.address}</p>
                      <p className="text-slate-400 text-sm">{branch.city}</p>
                      <p className="text-slate-300 text-sm font-medium">{branch.phone}</p>
                      <p className="text-slate-500 text-xs">{branch.hours}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => navigate('/locations')}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium hover:underline transition-colors duration-200"
            >
              View All Locations & ATMs →
            </button>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-lg">Services</h3>
            <div className="space-y-3">
              {quickLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => navigate(link.path)}
                  className="block text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>

          {/* Support Links */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-lg">Support</h3>
            <div className="space-y-3">
              {supportLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => navigate(link.path)}
                  className="block text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  {link.name}
                </button>
              ))}
            </div>

            {/* Security Badge */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold text-sm">FDIC Insured</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Your deposits are insured up to $250,000 per depositor, per bank.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-slate-400 text-sm">
              <p>&copy; 2025 Mani Banking. All rights reserved.</p>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/privacy')}
                  className="hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </button>
                <span>•</span>
                <button 
                  onClick={() => navigate('/terms')}
                  className="hover:text-white transition-colors duration-200"
                >
                  Terms of Service
                </button>
                <span>•</span>
                <button 
                  onClick={() => navigate('/accessibility')}
                  className="hover:text-white transition-colors duration-200"
                >
                  Accessibility
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-slate-400 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Online Banking Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer