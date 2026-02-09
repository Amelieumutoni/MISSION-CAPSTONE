function Navbar() {
  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-500 rounded" />
            <span className="text-xl font-semibold text-gray-800">Craftolio</span>
          </a>

          {/* Desktop nav links - center */}
          <ul className="hidden md:flex items-center gap-8 text-gray-700">
            <li><a href="#explore" className="hover:text-amber-600 transition-colors">Explore</a></li>
            <li><a href="#exhibitions" className="hover:text-amber-600 transition-colors">Exhibitions</a></li>
            <li><a href="#about" className="hover:text-amber-600 transition-colors">About</a></li>
            <li><a href="#marketplace" className="hover:text-amber-600 transition-colors">Market Place</a></li>
          </ul>

          {/* Right side - Sign In & Get Started */}
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors hidden sm:inline">Sign In</a>
            <button className="bg-gray-900 text-white px-5 py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
