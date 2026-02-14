import { BrowserRouter as Router, Routes, Route } from "react-router";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import { ProtectedRoute } from "@/components/protectedRoute";
import UnauthorizedPage from "./pages/UnauthorizedPate";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<>This is home page</>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        {/* --- Protected Artisan/Admin Section --- */}
        <Route element={<ProtectedRoute allowedRoles={["AUTHOR", "ADMIN"]} />}>
          <Route
            path="/dashboard"
            element={
              <div className="p-8 font-serif">
                <h1 className="text-2xl font-bold">Welcome Eric, here it is</h1>
                <p className="text-slate-500 uppercase tracking-widest text-xs mt-2">
                  Artisan Management Console
                </p>
              </div>
            }
          />
        </Route>
        {/* --- Fallback --- */}
        <Route path="*" element={<NotFoundPage />} />{" "}
      </Routes>
    </Router>
  );
}
