import { LiveTicker } from "@/components/layout/LiveTicker";
import { Navbar } from "@/components/layout/Navigation";
import HeroSection from "@/components/layout/Hero";
import TrendingSection from "@/components/layout/Trending";
import ArtistsSection from "@/components/layout/Artists";
import EditorialSection from "@/components/layout/EditorialSection";
import MansorySection from "@/components/layout/MansorySection";
import CollectionsSection from "@/components/layout/CollectionSection";
import LiveExhibitsSection from "@/components/layout/LiveExhibitions";
import StatItem from "@/components/layout/StatItem";
import CommunityHighlights from "@/components/layout/Gallary";
import Footer from "@/components/layout/Footer";
import DarkJournalSection from "@/components/layout/NewsLetter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      <LiveTicker />
      <Navbar />
      <HeroSection />
      <TrendingSection />
      <MansorySection />
      <ArtistsSection />
      <EditorialSection />
      <CollectionsSection />
      <LiveExhibitsSection />
      <DarkJournalSection />

      <section className="px-8 py-20 border-t border-b border-slate-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <StatItem number="1,247" label="Master Artisans" />
          <StatItem number="12,456" label="Works Documented" />
          <StatItem number="89" label="Active Collections" />
          <StatItem number="45k+" label="Global Members" />
        </div>
      </section>

      <section className="px-8 py-24 text-center bg-slate-50/50">
        <h4 className="text-5xl font-serif mb-6">Stay Documented</h4>
        <p className="text-slate-500 text-xs uppercase tracking-widest mb-10">
          Receive weekly curations and live exhibition schedules
        </p>
        <div className="max-w-md mx-auto flex gap-0">
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            className="flex-1 bg-white border border-slate-200 px-6 py-4 text-[10px] tracking-widest focus:outline-none focus:border-slate-900"
          />
          <button className="bg-slate-900 text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
            Subscribe
          </button>
        </div>
      </section>
      <CommunityHighlights />
      <Footer />
    </div>
  );
}
