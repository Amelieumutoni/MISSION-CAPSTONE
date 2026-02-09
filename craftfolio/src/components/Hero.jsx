import { useState } from "react"

function Hero() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    // DOM manipulation demo: could filter results, show modal, etc.
    console.log("Searching for:", searchQuery)
    alert(`Searching for: "${searchQuery}"`)
  }

  return (
    <section className="pt-16 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Discover & Showcase Exceptional Art
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Connect with talented artists, explore curated exhibitions, and build your creative portfolio on the platform designed for art lovers and creators.
        </p>

        {/* CTA Buttons - responsive stacking */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <button className="bg-gray-900 text-white px-8 py-3.5 rounded-md font-medium hover:bg-gray-800 transition-colors">
            Explore Art
          </button>
          <button className="bg-amber-100 text-gray-800 px-8 py-3.5 rounded-md font-medium hover:bg-amber-200 transition-colors border border-amber-200">
            Sell Your Art
          </button>
        </div>

        {/* Search area */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <a href="#archive" className="text-amber-600 hover:text-amber-700 font-medium">
            Research Archive
          </a>
          <form onSubmit={handleSearch} className="flex w-full sm:w-auto max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search artwork"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button type="submit" className="ml-2 px-4 py-3 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors">
              Search
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Hero
