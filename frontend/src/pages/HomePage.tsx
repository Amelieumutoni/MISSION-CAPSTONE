import { LiveTicker } from "@/components/layout/LiveTicker";
import { Navbar } from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      <LiveTicker />
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
