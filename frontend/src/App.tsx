import { BrowserRouter as Router, Routes, Route } from "react-router";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import { ProtectedRoute } from "@/components/protectedRoute";
import UnauthorizedPage from "./pages/UnauthorizedPate";
import NotFoundPage from "./pages/NotFoundPage";
import HomePage from "./pages/HomePage";
import CollectionsPage from "./pages/CollectionsPage";
import ArtistsPage from "./pages/ArtistsPage";
import ArtistDetailPage from "./pages/ArtistsDetailsPage";
import ExhibitionsPage from "./pages/ExhibitionsPage";
import ArtworksPage from "./pages/ArtworksPage";
import ArtworkDetailPage from "./pages/ArtworkDetailPage";
import AdminDashboard from "./pages/dashboard/DashboardPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import ShopPage from "./pages/ShopPage";
import { CartProvider } from "./context/CartContext";
import Layout from "./pages/HomePage";
import Index from "./pages/Index";

// App.tsx
export default function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
          {/* Main Layout Wrap */}
          <Route element={<Layout />}>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/exhibitions" element={<ExhibitionsPage />} />
            <Route path="/artists" element={<ArtistsPage />} />
            <Route path="/artists/:id" element={<ArtistDetailPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/artworks" element={<ArtworksPage />} />
            <Route path="/artwork/:id" element={<ArtworkDetailPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Route>

          {/* Auth Routes (Usually no Navbar/Footer here) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Dashboard Section */}
          <Route
            element={<ProtectedRoute allowedRoles={["AUTHOR", "ADMIN"]} />}
          >
            <Route path="/dashboard" element={<AdminDashboard />}>
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </CartProvider>
    </Router>
  );
}
