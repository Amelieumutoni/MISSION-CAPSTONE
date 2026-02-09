import { useState } from "react"

function Footer() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    // DOM/state manipulation demo
    setSubmitted(true)
    console.log("Subscribed:", email)
    setEmail("")
  }

  const platformLinks = [
    { label: "Home", href: "#" },
    { label: "Exhibitions", href: "#exhibitions" },
    { label: "Shop", href: "#" },
    { label: "Archive", href: "#" },
    { label: "Community", href: "#" },
  ]

  const designerLinks = [
    { label: "Learn More", href: "#" },
    { label: "My Work", href: "#" },
    { label: "Create Exhibition", href: "#" },
    { label: "Resources", href: "#" },
  ]

  const supportLinks = [
    { label: "Help Center", href: "#" },
    { label: "Guidelines", href: "#" },
    { label: "Terms & Privacy", href: "#" },
    { label: "Feedback", href: "#" },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-3">Preserving Rwanda&apos;s Creative Legacy</h3>
            <p className="text-gray-400 text-sm mb-4">
              Stay updated with new exhibitions, artist spotlights, and platform news.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
              <button
                type="submit"
                className="w-full bg-amber-500 text-gray-900 py-2.5 rounded font-medium hover:bg-amber-400 transition-colors"
              >
                Subscribe
              </button>
            </form>
            {submitted && (
              <p className="text-amber-400 text-sm mt-2">Thanks for subscribing!</p>
            )}
          </div>

          {/* Link columns */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">For Designers</h4>
            <ul className="space-y-2">
              {designerLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-gray-500 text-sm text-center">
          © 2024 Rwanda Creative Platform. All rights reserved. Website by Cursor.
        </div>
      </div>
    </footer>
  )
}

export default Footer
