import {
  LayoutDashboard,
  User,
  Image as ImageIcon,
  PlusSquare,
  GalleryThumbnails,
  Plus,
  List,
  Eye,
  Users,
  UserCheck,
  UserCog,
  ShoppingCart,
  Archive,
  Receipt,
  ListCollapse,
} from "lucide-react";

export const NAVIGATION_CONFIG = [
  {
    group: "Dashboard",
    roles: ["ADMIN", "AUTHOR"],
    items: [
      {
        id: "overview",
        label: "Overview",
        icon: LayoutDashboard,
        path: "/dashboard",
        roles: ["ADMIN", "AUTHOR"],
      },
      {
        id: "profile",
        label: "My Profile",
        icon: User,
        path: "/dashboard/profile",
        roles: ["AUTHOR"],
      },
    ],
  },
  {
    group: "Portfolio",
    roles: ["AUTHOR"],
    items: [
      {
        id: "artworks",
        label: "My Artworks",
        icon: ImageIcon,
        path: "/dashboard/artworks",
        roles: ["AUTHOR"],
      },
      {
        id: "new-artwork",
        label: "Add New Artwork",
        icon: PlusSquare,
        path: "/dashboard/artworks/new",
        roles: ["AUTHOR"],
        variant: "outline",
      },
    ],
  },
  {
    group: "Artworks",
    roles: ["ADMIN"],
    items: [
      {
        id: "artworks",
        label: "Artworks",
        icon: ListCollapse,
        path: "/dashboard/artworks",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    group: "Exhibitions",
    roles: ["AUTHOR", "ADMIN"],
    items: [
      {
        id: "exhibitions",
        label: "My Exhibitions",
        icon: GalleryThumbnails,
        path: "/dashboard/exhibitions",
        roles: ["AUTHOR"],
      },
      {
        id: "new-exhibition",
        label: "Create Exhibition",
        icon: Plus,
        path: "/dashboard/exhibitions/new",
        roles: ["AUTHOR"],
      },
      {
        id: "all-exhibitions",
        label: "All Exhibitions",
        icon: List,
        path: "/dashboard/exhibitions/all",
        roles: ["ADMIN"],
      },
      {
        id: "manage-visibility",
        label: "Publish Control",
        icon: Eye,
        path: "/dashboard/exhibitions/publish",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    group: "Management",
    roles: ["ADMIN"],
    items: [
      {
        id: "artists",
        label: "Artists",
        icon: Users,
        path: "/dashboard/artists",
        roles: ["ADMIN"],
      },
      {
        id: "artist-approval",
        label: "Pending Approvals",
        icon: UserCheck,
        path: "/dashboard/admin/approvals",
        roles: ["ADMIN"],
        badge: "pending",
      },
      {
        id: "all-users",
        label: "All Users",
        icon: UserCog,
        path: "/dashboard/users/all",
        roles: ["ADMIN"],
      },
      {
        id: "orders",
        label: "All Orders",
        icon: ShoppingCart,
        path: "/dashboard/orders",
        roles: ["ADMIN"],
      },
      {
        id: "archive",
        label: "Archived Content",
        icon: Archive,
        path: "/dashboard/admin/archive",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    group: "Sales & Orders",
    roles: ["AUTHOR"],
    items: [
      {
        id: "my-orders",
        label: "Finance",
        icon: Receipt,
        path: "/dashboard/finance",
        roles: ["AUTHOR"],
      },
    ],
  },
];
export const TRENDING_WORKS = [
  {
    id: 1,
    title: "Heritage Agaseke",
    artist: "Marie Uwase",
    price: "$120",
    image:
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: "Modern Imigongo Panel",
    artist: "Samuel Bakame",
    price: "$350",
    image:
      "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "Volcanic Clay Pot",
    artist: "Nyanza Collective",
    price: "$210",
    image:
      "https://images.unsplash.com/photo-1565193998946-247f1ecb9ca9?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 4,
    title: "Hand-Woven Peace Basket",
    artist: "Divine Ineza",
    price: "$85",
    image:
      "https://images.unsplash.com/photo-1616486788371-62d930495c44?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 5,
    title: "Intore Shield Sculpture",
    artist: "Eric Kwizera",
    price: "$520",
    image:
      "https://images.unsplash.com/photo-1513519247388-4e28265dd2bf?auto=format&fit=crop&q=80&w=800",
  },
];

export const ARTISANS = [
  {
    name: "Samuel Bakame",
    specialty: "Imigongo Master",
    location: "Nyakarambi",
    works: 48,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800", // Portrait of a craftsman
  },
  {
    name: "Divine Mukanoheli",
    specialty: "Basket Weaver",
    location: "Kigali",
    works: 156,
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=800", // Portrait of a female artisan
  },
  {
    name: "Jean-Pierre Nkurunziza",
    specialty: "Wood Sculptor",
    location: "Butare",
    works: 92,
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800", // Portrait of a focused artist
  },
];

export const COLLECTIONS = [
  {
    title: "The Renaissance Collection",
    curator: "Maria Uwase",
    pieces: 24,
    description:
      "Contemporary interpretations of traditional Rwandan motifs, blending ancestral wisdom with modern aesthetics.",
    image:
      "https://images.unsplash.com/photo-1590736961141-72ec0b982941?auto=format&fit=crop&q=80&w=1200",
  },
  {
    title: "Ancestral Voices",
    curator: "Patrick Mugabo",
    pieces: 18,
    description:
      "A deep dive into the visual language of Rwanda’s history, preserving oral traditions through masterful sculpture.",
    image:
      "https://images.unsplash.com/photo-1561839561-b13bcfe95249?auto=format&fit=crop&q=80&w=1200",
  },
  {
    title: "Imigongo Revival",
    curator: "CraftFolio Editorial",
    pieces: 32,
    description: "Sacred geometric patterns of the Kakira region.",
    image:
      "https://images.unsplash.com/photo-1544413660-299165566b1d?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Basket Stories",
    curator: "Agnes Mukankusi",
    pieces: 45,
    description: "Agaseke peace baskets through generations.",
    image:
      "https://images.unsplash.com/photo-1621293291580-73f858204680?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Metal & Memory",
    curator: "Emmanuel Nkusi",
    pieces: 16,
    description: "Traditional metalwork meets modern design.",
    image:
      "https://images.unsplash.com/photo-1533413158231-30e702c4b181?auto=format&fit=crop&q=80&w=800",
  },
];

export const LIVE_EVENTS = [
  {
    title: "The Potters of Nyanza",
    artist: "Inema Collective",
    status: "LIVE",
    viewers: "1.2k",
    image:
      "https://images.unsplash.com/photo-1565193998946-247f1ecb9ca9?auto=format&fit=crop&q=80&w=1200", // High-detail pottery close-up
  },
  {
    title: "Modern Metalwork",
    artist: "Jean-Pierre",
    status: "UPCOMING",
    date: "Feb 18, 14:00 CAT",
    image:
      "https://images.unsplash.com/photo-1504198458649-0128b936ca91?auto=format&fit=crop&q=80&w=1200", // Sparks/Metalwork studio
  },
  {
    title: "Canvas & Cattle",
    artist: "Divine Art",
    status: "RECORDED",
    viewers: "4.5k",
    image:
      "https://images.unsplash.com/photo-1513519247388-4e28265dd2bf?auto=format&fit=crop&q=80&w=1200", // Artistic studio shot
  },
];

export const DARK_JOURNAL_ARTICLES = [
  {
    category: "Culture",
    title: "The Geometry of Memory: Understanding Imigongo Patterns",
    author: "Lisa Uwera",
    readTime: "8 min",
    date: "Feb 12, 2026",
    image:
      "https://images.unsplash.com/photo-1544413660-299165566b1d?auto=format&fit=crop&q=80&w=1200", // Geometric texture
  },
  {
    category: "Process",
    title: "From Clay to Canvas: A Potter's 40-Year Journey",
    author: "David Habimana",
    readTime: "12 min",
    date: "Feb 10, 2026",
    image:
      "https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?auto=format&fit=crop&q=80&w=1200", // Moody pottery close-up
  },
];

export const EXHIBITIONS = [
  // --- LIVE EVENTS ---
  {
    id: "live-01",
    type: "LIVE",
    title: "The Potters of Nyanza: Live Masterclass",
    curator: "Inema Collective",
    banner:
      "https://images.unsplash.com/photo-1565193998946-247f1ecb9ca9?auto=format&fit=crop&q=80&w=1600",
    streamLink: "https://stream.craftfolio.rw/live/nyanza",
    viewers: "1.2k",
    description:
      "Witness the rhythmic creation of traditional Nyanza ceramics in real-time from the royal court workshops.",
  },

  // --- UPCOMING EVENTS (For the Exhibition Schedule) ---
  {
    id: "up-01",
    type: "UPCOMING",
    title: "The Iron Smelters of Bugesera",
    curator: "Jean-Paul Ndahiro",
    banner:
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1600",
    date: "MAR 14, 2026",
    time: "14:00",
    description:
      "A rare live broadcast of ancestral iron-work techniques once used for the King's weaponry.",
  },
  {
    id: "up-02",
    type: "UPCOMING",
    title: "Barkcloth Reimagined: Live Studio Visit",
    curator: "Cedric Mizero",
    banner:
      "https://images.unsplash.com/photo-1511135232973-c3ee300403dd?auto=format&fit=crop&q=80&w=1600",
    date: "APR 02, 2026",
    time: "10:30",
    description:
      "Exploring the revival of Mutuba barkcloth in high-fashion contemporary silhouettes.",
  },

  // --- CLASSIFICATIONS (For the Collections Page) ---
  {
    id: "archive-01",
    type: "CLASSIFICATION",
    title: "Sacred Geometry: The Imigongo Collection",
    curator: "Maria Uwase",
    banner:
      "https://images.unsplash.com/photo-1544413660-299165566b1d?auto=format&fit=crop&q=80&w=1200",
    itemCount: 42,
    description:
      "A comprehensive digital archive of 18th-century geometric patterns reconstructed for the modern era.",
  },
  {
    id: "archive-02",
    type: "CLASSIFICATION",
    title: "Threads of Heritage: Agaseke Weaving",
    curator: "Agnes Mukankusi",
    banner:
      "https://images.unsplash.com/photo-1621293291580-73f858204680?auto=format&fit=crop&q=80&w=1200",
    itemCount: 28,
    description:
      "Exploring the socio-political history of peace baskets through three generations of master weavers.",
  },
  {
    id: "archive-03",
    type: "CLASSIFICATION",
    title: "The Obsidian Archive: Smoked Ceramics",
    curator: "David Habimana",
    banner:
      "https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?auto=format&fit=crop&q=80&w=1200",
    itemCount: 15,
    description:
      "A record of the distinct 'Obsidian' finish achieved through the ancestral smoking process of Nyanza pottery.",
  },
  {
    id: "archive-04",
    type: "CLASSIFICATION",
    title: "Regalia: Traditional Rwandan Jewelry",
    curator: "Ishimwe Gaelle",
    banner:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200",
    itemCount: 64,
    description:
      "Documentation of beaded jewelry, intricate headpieces, and the material symbolism of royal status.",
  },
  {
    id: "archive-05",
    type: "CLASSIFICATION",
    title: "Materiality: Wood & Stone Carving",
    curator: "Emmanuel Ruzindana",
    banner:
      "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=1200",
    itemCount: 31,
    description:
      "Categorizing the tactile languages of Rwandan woodworkers and the tools used for ritual sculpture.",
  },
];

export const ARTISTS = [
  {
    id: "lisa-uwera",
    name: "Lisa Uwera",
    specialty: "Imigongo Specialist",
    location: "Kirehe, Rwanda",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?auto=format&fit=crop&q=80&w=800",
    bio: "Lisa is a third-generation Imigongo artist. She specializes in the traditional cow dung paintings, preserving the mathematical precision of geometric patterns while introducing contemporary natural pigments.",
    artworks: [
      {
        id: "geo-01",
        title: "The Geometry of Memory",
        year: "2026",
        medium: "Natural Pigments on Wood",
        dimensions: "120cm x 120cm",
        image:
          "https://images.unsplash.com/photo-1544413660-299165566b1d?auto=format&fit=crop&q=80&w=800",
        story:
          "This piece explores the rhythmic repetition of the 'Ikaze' pattern, symbolizing the welcoming nature of Rwandan homes.",
      },
      {
        id: "geo-02",
        title: "Volcanic Ash Series",
        year: "2025",
        medium: "Ash and Clay on Canvas",
        dimensions: "80cm x 100cm",
        image:
          "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800",
        story:
          "A study of texture using materials sourced directly from the Virunga mountain range.",
      },
    ],
  },
  {
    id: "david-habimana",
    name: "David Habimana",
    specialty: "Master Potter",
    location: "Nyanza, Rwanda",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    bio: "With over 40 years of experience, David is a guardian of the royal pottery traditions of the Nyanza court. His work is known for its thin walls and deep, smoked obsidian finishes.",
    artworks: [
      {
        id: "pot-01",
        title: "The King's Vessel",
        year: "2026",
        medium: "Smoked Terra Cotta",
        dimensions: "40cm x 60cm",
        image:
          "https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?auto=format&fit=crop&q=80&w=800",
        story:
          "A replica of the traditional vessels used in the King's Palace, finished with a 24-hour smoking process.",
      },
    ],
  },
  {
    id: "agnes-mukankusi",
    name: "Agnes Mukankusi",
    specialty: "Master Weaver",
    location: "Gitarama, Rwanda",
    image:
      "https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?auto=format&fit=crop&q=80&w=800",
    bio: "Agnes leads a collective of sixty women in Gitarama. Her Agaseke baskets are celebrated globally for their microscopic stitch density and narrative-driven designs.",
    artworks: [
      {
        id: "wea-01",
        title: "Peace Basket (Large)",
        year: "2026",
        medium: "Sisal and Sweetgrass",
        dimensions: "20cm x 45cm",
        image:
          "https://images.unsplash.com/photo-1621293291580-73f858204680?auto=format&fit=crop&q=80&w=800",
        story:
          "Hand-dyed using organic tea and beetroot, this basket features the 'Unity' pattern.",
      },
    ],
  },
];

// Helper to get all artworks for the Artwork Page
export const ALL_ARTWORKS = ARTISTS.flatMap((artist) =>
  artist.artworks.map((work) => ({
    ...work,
    artistId: artist.id,
    artistName: artist.name,
  })),
);

export const SPECIALTIES = [
  "Painter",
  "Sculptor",
  "Photographer",
  "Digital Artist",
  "Ceramicist",
  "Illustrator",
  "Textile Artist",
  "Mixed Media",
];

export const RWANDA_LOCATIONS = [
  "Nyarugenge, Kigali",
  "Kicukiro, Kigali",
  "Gasabo, Kigali",
  "Musanze, Northern",
  "Burera, Northern",
  "Gicumbi, Northern",
  "Rulindo, Northern",
  "Gakenke, Northern",
  "Huye, Southern",
  "Nyanza, Southern",
  "Gisagara, Southern",
  "Kamonyi, Southern",
  "Muhanga, Southern",
  "Nyamagabe, Southern",
  "Nyaruguru, Southern",
  "Ruhango, Southern",
  "Rwamagana, Eastern",
  "Kayonza, Eastern",
  "Bugesera, Eastern",
  "Gatsibo, Eastern",
  "Kirehe, Eastern",
  "Ngoma, Eastern",
  "Nyagatare, Eastern",
  "Rubavu, Western",
  "Karongi, Western",
  "Ngororero, Western",
  "Nyabihu, Western",
  "Nyamasheke, Western",
  "Rutsiro, Western",
  "Rusizi, Western",
];
