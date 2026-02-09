// Images from src/assets/images – add: heritage-craft.jpg, heritage-gallery.jpg
const imageModules = import.meta.glob("../assets/images/*.{jpg,jpeg,png}", { eager: true, as: "url" })
const getAsset = (name) => {
  const key = Object.keys(imageModules).find((k) => k.includes(name))
  return key ? imageModules[key] : null
}

const stats = [
  { value: "500+", label: "Artists/designers" },
  { value: "120+", label: "Curated Exhibitions" },
  { value: "45+", label: "Creative Hubs" },
  { value: "30K+", label: "Global Visitors" },
]

function AboutStats() {
  return (
    <section id="about" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Preserving Rwanda&apos;s Creative Heritage
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-10">
              Rwanda&apos;s premier platform dedicated to documenting, archiving, and showcasing the extraordinary talent of local designers and artisans. We empower creators and connect their work with audiences worldwide.
            </p>

            {/* Stats grid - responsive */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            <button className="mt-10 bg-gray-900 text-white px-8 py-3.5 rounded-md font-medium hover:bg-gray-800 transition-colors">
              Learn More About Our Mission
            </button>
          </div>

          {/* Right: Images */}
          <div className="grid gap-4">
            <div className="aspect-[4/3] rounded-lg overflow-hidden">
              <img
                src={getAsset("heritage-craft") || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"}
                alt="Traditional craft"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"; }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-[4/3] rounded-lg overflow-hidden">
              <img
                src={getAsset("heritage-gallery") || "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=600&fit=crop"}
                alt="Art gallery"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=600&fit=crop"; }}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutStats
