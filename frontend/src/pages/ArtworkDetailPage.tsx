import { useParams, Link } from "react-router";
import { ALL_ARTWORKS } from "@/utils/consts";
import { Share2, Info } from "lucide-react";
import Footer from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navigation";

export default function ArtworkDetailPage() {
  const { id } = useParams();
  const work = ALL_ARTWORKS.find((w) => w.id === id);

  if (!work)
    return (
      <div className="h-screen flex items-center justify-center">
        Plate Not Found
      </div>
    );

  return (
    <main className="bg-white min-h-screen">
      <Navbar />

      <div className="pt-32 px-8 md:px-16 lg:px-24">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-12">
          <Link to="/collections" className="hover:text-black">
            Archive
          </Link>
          <span className="text-slate-200">/</span>
          <Link to={`/artists/${work.artistId}`} className="hover:text-black">
            {work.artistName}
          </Link>
          <span className="text-slate-200">/</span>
          <span className="text-slate-900">{work.title}</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-20 pb-32">
          {/* LARGE VISUAL AREA */}
          <div className="lg:col-span-7">
            <div className="bg-slate-50 p-4 md:p-12">
              <img
                src={work.image}
                className="w-full h-auto shadow-2xl"
                alt={work.title}
              />
            </div>
          </div>

          {/* TECHNICAL DATA AREA */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h1 className="text-5xl md:text-7xl font-serif mb-4 tracking-tighter">
              {work.title}
            </h1>
            <p className="text-xl text-slate-500 font-light italic mb-12">
              "{work.story}"
            </p>

            <div className="space-y-0 border-t border-slate-100">
              <DetailRow
                label="Classification ID"
                value={`CF-${work.id.toUpperCase()}`}
              />
              <DetailRow
                label="Artisan"
                value={work.artistName}
                isLink
                href={`/artists/${work.artistId}`}
              />
              <DetailRow label="Material" value={work.medium} />
              <DetailRow label="Dimensions" value={work.dimensions} />
              <DetailRow label="Documentation Date" value={work.year} />
            </div>

            <div className="mt-12 flex gap-4">
              <button className="flex-1 bg-slate-900 text-white py-6 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-600 transition-colors">
                Request Archival Access
              </button>
              <button className="w-20 border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-8 flex items-start gap-4 p-6 bg-slate-50">
              <Info className="w-5 h-5 text-slate-400 shrink-0" />
              <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest font-bold">
                This item is part of the permanent digital classification.
                Authenticity verified by CraftFolio Rwanda.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

// Small helper for the technical rows
function DetailRow({
  label,
  value,
  isLink,
  href,
}: {
  label: string;
  value: string;
  isLink?: boolean;
  href?: string;
}) {
  return (
    <div className="flex justify-between items-center py-6 border-b border-slate-100">
      <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">
        {label}
      </span>
      {isLink ? (
        <Link
          to={href as string}
          className="text-sm font-medium border-b border-slate-900"
        >
          {value}
        </Link>
      ) : (
        <span className="text-sm font-medium text-slate-900">{value}</span>
      )}
    </div>
  );
}
