// src/pages/ArchiveApplicationPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import ArchiveService from "@/api/services/archiveService";
import { toast } from "sonner";

export default function ArchiveApplicationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    institution: "",
    research_purpose: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ArchiveService.submitApplication(formData);
      toast.success(
        "Application submitted. You will be contacted if approved.",
      );
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-32 px-8 md:px-16 lg:px-24 min-h-screen">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="border border-slate-200 p-16">
            <h1 className="text-5xl font-serif mb-6">Application Received</h1>
            <p className="text-slate-600 mb-8">
              Your request for archival access has been submitted. Our team will
              review your application and respond within 5–7 business days.
            </p>
            <Link
              to="/archives"
              className="inline-block bg-slate-900 text-white px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all"
            >
              Return to Archive
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 px-8 md:px-16 lg:px-24 pb-32">
      {/* Back link */}
      <nav className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-12">
        <Link
          to="/archives"
          className="flex items-center gap-2 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Archives
        </Link>
        <span className="text-slate-200">/</span>
        <span className="text-slate-900">Access Request</span>
      </nav>

      <div className="grid lg:grid-cols-12 gap-20">
        <div className="lg:col-span-5">
          <h1 className="text-5xl md:text-7xl font-serif mb-6 tracking-tighter leading-tight">
            Request Archival Access
          </h1>
          <p className="text-lg text-slate-600 font-light leading-relaxed mb-8">
            Complete the form to request access to our digital archive of
            completed exhibitions. Approved researchers will receive a secure
            link to view the materials.
          </p>
          <div className="space-y-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            <div className="flex items-start gap-4 p-6 bg-slate-50/50 border border-slate-100">
              <div className="w-1 h-1 bg-slate-900 rounded-full mt-1.5" />
              <span>All fields are required unless marked optional.</span>
            </div>
            <div className="flex items-start gap-4 p-6 bg-slate-50/50 border border-slate-100">
              <div className="w-1 h-1 bg-slate-900 rounded-full mt-1.5" />
              <span>Applications are reviewed within 5 business days.</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6 border border-slate-200 p-8 md:p-12">
              <div>
                <label className="block text-[9px] uppercase tracking-[0.3em] font-black text-slate-400 mb-2">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b border-slate-200 py-3 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                  placeholder="e.g., Dr. Marie Curie"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-[0.3em] font-black text-slate-400 mb-2">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b border-slate-200 py-3 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                  placeholder="researcher@institution.edu"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-[0.3em] font-black text-slate-400 mb-2">
                  Institution / Affiliation (optional)
                </label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-slate-200 py-3 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                  placeholder="University, Museum, etc."
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-[0.3em] font-black text-slate-400 mb-2">
                  Research Purpose <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="research_purpose"
                  value={formData.research_purpose}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full bg-transparent border border-slate-200 p-4 text-sm focus:outline-none focus:border-slate-900 transition-colors resize-none"
                  placeholder="Describe your research objectives and how you plan to use the archive materials..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-6 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Application
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
