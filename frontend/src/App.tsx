import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ProtectedRoute } from "@/components/protectedRoute";

// Public Pages
import Layout from "./pages/HomePage";
import Index from "./pages/Index";
import ShopPage from "./pages/ShopPage";
import ExhibitionsPage from "./pages/ExhibitionsPage";
import ArtistsPage from "./pages/ArtistsPage";
import ArtistDetailPage from "./pages/ArtistsDetailsPage";
import CollectionsPage from "./pages/CollectionsPage";
import ArtworksPage from "./pages/ArtworksPage";
import ArtworkDetailPage from "./pages/ArtworkDetailPage";

// Auth & Error Pages
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import UnauthorizedPage from "./pages/UnauthorizedPate";
import NotFoundPage from "./pages/NotFoundPage";

// Dashboard Pages
import AdminDashboard from "./pages/dashboard/DashboardPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import CreateArtworkPage from "./pages/dashboard/artworks/NewArtwork";
import MyArtworksPage from "./pages/dashboard/artworks/ArtworksPage";
import BuyerDashboard from "./pages/dashboard/buyer/BuyerDashboard";
import CartPage from "./pages/dashboard/buyer/CartPage";
import AdminArtistsPage from "./pages/dashboard/admin/ArtistPage";
import AdminUsersPage from "./pages/dashboard/admin/UsersPage";
import AdminOrdersPage from "./pages/dashboard/OrdersPage";
import ArtistFinancialsPage from "./pages/dashboard/FinancePage";
import ArtistDashboardOverview from "./pages/dashboard/IndexPage";
import AdminDashboardOverview from "./pages/dashboard/admin/IndexPage";

function DashboardIndex() {
  const { user } = useAuth();

  if (user?.role === "ADMIN") {
    // You can swap this for a specific AdminOverview later
    return <AdminDashboardOverview />;
  }

  if (user?.role === "AUTHOR") {
    return <ArtistDashboardOverview />;
  }

  return <Navigate to="/unauthorized" replace />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* 1. PUBLIC ROUTES */}
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/exhibitions" element={<ExhibitionsPage />} />
              <Route path="/artists" element={<ArtistsPage />} />
              <Route path="/artists/:id" element={<ArtistDetailPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/archives" element={<ArtworksPage />} />
              <Route path="/archives/:id" element={<ArtworkDetailPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
            </Route>

            {/* 2. AUTH ROUTES */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 3. SHARED DASHBOARD ROUTES (ADMIN & AUTHOR) */}
            <Route
              element={<ProtectedRoute allowedRoles={["AUTHOR", "ADMIN"]} />}
            >
              <Route path="/dashboard" element={<AdminDashboard />}>
                <Route index element={<DashboardIndex />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="artworks" element={<MyArtworksPage />} />
              </Route>
            </Route>

            {/* 4. ADMIN-ONLY ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/dashboard" element={<AdminDashboard />}>
                <Route path="artists" element={<AdminArtistsPage />} />
                <Route path="users/all" element={<AdminUsersPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
              </Route>
            </Route>

            {/* 5. AUTHOR-ONLY ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={["AUTHOR"]} />}>
              <Route path="/dashboard" element={<AdminDashboard />}>
                <Route path="finance" element={<ArtistFinancialsPage />} />
                <Route path="artworks/new" element={<CreateArtworkPage />} />
              </Route>
            </Route>

            {/* 6. BUYER ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={["BUYER"]} />}>
              <Route element={<Layout />}>
                <Route path="/buyer" element={<BuyerDashboard />} />
                <Route path="/cart" element={<CartPage />} />
              </Route>
            </Route>

            {/* 7. CATCH ALL */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
