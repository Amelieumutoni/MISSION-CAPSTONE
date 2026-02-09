// Images from src/assets/images – add: artist-sarah.jpg, artist-marcus.jpg, artist-clene.jpg
const imageModules = import.meta.glob("../assets/images/*.{jpg,jpeg,png}", { eager: true, as: "url" })
const getAsset = (name) => {
  const key = Object.keys(imageModules).find((k) => k.includes(name))
  return key ? imageModules[key] : null
}

const exhibitions = [
  { name: "Sarah Mitchell", role: "Abstract Painter", asset: "artist-sarah", fallback: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
  { name: "Marcus Chan", role: "Digital Sculptor", asset: "artist-marcus", fallback: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
  { name: "Clene Rodriguez", role: "Mixed Media Artist", asset: "artist-clene", fallback: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop" },
]

function Exhibitions() {
  return (
    <section id="exhibitions" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Discover <span className="text-amber-600">Current Exhibitions</span>
        </h2>
        <p className="text-gray-600 mb-12 max-w-2xl">
          Explore works from talented artists and designers showcasing their latest creations.
        </p>

        {/* Responsive grid: 1 col mobile, 2 tablet, 3 desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {exhibitions.map((artist) => (
            <article
              key={artist.name}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={getAsset(artist.asset) || artist.fallback}
                  alt={artist.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = artist.fallback; }}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg text-gray-900">{artist.name}</h3>
                <p className="text-gray-600 text-sm">{artist.role}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <button className="bg-amber-100 text-gray-800 px-8 py-3 rounded-md font-medium hover:bg-amber-200 transition-colors">
            View all exhibitions
          </button>
        </div>
      </div>
    </section>
  )
}

export default Exhibitions
