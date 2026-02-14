import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-slate-50 rounded-full">
            <ShieldAlert
              className="w-12 h-12 text-slate-900"
              strokeWidth={1.5}
            />
          </div>
        </div>

        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">
          Access Restricted
        </h1>

        <p className="text-slate-500 font-sans text-sm mb-8 leading-relaxed uppercase tracking-widest">
          Your current account does not have the necessary permissions to view
          this collection or dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="rounded-none border-slate-200 text-xs font-bold uppercase tracking-widest"
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/login")}
            className="rounded-none bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest"
          >
            Switch Account
          </Button>
        </div>

        <p className="mt-12 text-[10px] text-slate-300 uppercase tracking-[0.3em]">
          Craftfolio Security Protocol
        </p>
      </div>
    </div>
  );
}
