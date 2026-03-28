import React from "react";
import { ArrowRight } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="bg-white text-slate-900 min-h-screen px-6 py-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3 font-semibold">
            Contact
          </h3>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Get in Touch
          </h1>
          <p className="text-slate-600 mt-4 max-w-lg">
            For inquiries related to exhibitions, partnerships, or platform
            access, please use the form below or contact us directly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-10">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-2">Office</p>
              <p className="text-lg leading-relaxed">
                Kigali City Tower, Floor 14 <br />
                Kigali, Rwanda
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 mb-2">Email</p>
              <p className="text-lg">ops@craftfolio.rw</p>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-6 border border-slate-200 p-8 rounded-lg bg-white">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Inquiry Type
              </label>
              <select className="w-full border border-slate-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900">
                <option>Artist Onboarding</option>
                <option>Collector Inquiry</option>
                <option>Research Access</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full border border-slate-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            <button className="w-full py-3 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition flex items-center justify-center gap-2">
              Send Message <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
