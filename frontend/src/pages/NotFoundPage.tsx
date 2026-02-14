import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="text-center">
        <span className="text-[120px] font-serif font-light text-slate-100 leading-none">
          404
        </span>

        <div className="relative -mt-16">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
            Exhibit Not Found
          </h2>
          <p className="text-slate-500 font-sans text-sm mb-8 max-w-sm mx-auto uppercase tracking-widest leading-loose">
            The masterpiece or page you are looking for has been moved,
            archived, or never existed in our collection.
          </p>
        </div>

        <Button
          onClick={() => navigate("/")}
          className="rounded-none bg-slate-900 hover:bg-black text-white px-8 py-6 text-xs font-bold uppercase tracking-[0.2em]"
        >
          Return to Gallery
        </Button>

        <div className="mt-16 grid grid-cols-3 gap-2 max-w-xs mx-auto opacity-20">
          <div className="h-1 bg-slate-900"></div>
          <div className="h-1 bg-slate-400"></div>
          <div className="h-1 bg-slate-900"></div>
        </div>
      </div>
    </div>
  );
}
