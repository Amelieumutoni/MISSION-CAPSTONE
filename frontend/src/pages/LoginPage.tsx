import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useNavigate } from "react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import AuthService from "@/api/services/authService";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      toast.error("Invalid Input", {
        description: "Please provide both email and password.",
      });
      return;
    }

    setIsLoading(true);

    const loginPromise = AuthService.login({
      email: credentials.email,
      password: credentials.password,
    });

    toast.promise(loginPromise, {
      loading: "Verifying credentials...",
      success: (data) => {
        setIsLoading(false);

        const role = data.user.role;

        if (data.user.status === "INACTIVE" && role === "AUTHOR") {
          toast.info("Account Pending", {
            description: "An admin is currently reviewing your artist profile.",
          });
        }

        if (role === "AUTHOR" || role === "ADMIN") {
          setTimeout(() => {
            navigate("/dashboard");
          }, 1000);
          return `Welcome back, ${data.user.name}`;
        } else {
          setTimeout(() => {
            navigate("/dashboard");
          }, 1000);
          return `Welcome back, ${data.user.name}`;
        }
      },
      error: (err) => {
        setIsLoading(false);
        return err.response?.data?.message || "Authentication failed";
      },
    });
  };
  const artImages = [
    "https://lirp.cdn-website.com/09ed37c1/dms3rep/multi/opt/Nziza%2BArt%2BInitiative-inema-nomad-agency-12-1920w.JPG",
    "https://lirp.cdn-website.com/09ed37c1/dms3rep/multi/opt/timothy-inema-nomad-15-1920w.jpg",
    "https://lirp.cdn-website.com/09ed37c1/dms3rep/multi/opt/timothy-inema-nomad-14-1920w.jpg",
    "https://lirp.cdn-website.com/09ed37c1/dms3rep/multi/opt/timothy-inema-nomad-16-1920w.jpg",
  ];

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      <Toaster position="top-right" duration={3000} richColors />{" "}
      {/* 3. Add Toaster component */}
      {/* Left Section - Image Gallery */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-50">
        <div className="absolute inset-0 grid grid-cols-2 gap-0">
          {artImages.map((img, idx) => (
            <div key={idx} className="relative overflow-hidden group">
              <img
                src={img}
                alt={`Rwandan craft ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors duration-500" />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 flex items-end justify-start p-12 bg-linear-to-t from-slate-900/80 via-transparent to-transparent">
          <div className="text-white">
            <h2 className="text-5xl font-serif font-bold mb-3 tracking-tight">
              Rwandan Artistry
            </h2>
            <p className="text-xs tracking-[0.4em] uppercase font-accent text-slate-300">
              Heritage • Craft • Excellence
            </p>
          </div>
        </div>
      </div>
      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <h1 className="text-4xl font-serif font-bold tracking-tight text-slate-900 mb-2">
              Craftfolio
            </h1>
            <p className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-sans font-semibold">
              Documentation System
            </p>
          </div>

          <Card className="border border-slate-200 shadow-none rounded-none">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-serif font-bold text-slate-900">
                Welcome back
              </CardTitle>
              <CardDescription className="text-slate-500 font-sans text-sm">
                Sign in to manage your exhibitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    disabled={isLoading}
                    value={credentials.email}
                    onChange={(e) =>
                      setCredentials({ ...credentials, email: e.target.value })
                    }
                    placeholder="artist@rwanda.art"
                    className="border-slate-200 rounded-none focus-visible:ring-slate-900 font-sans"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans"
                    >
                      Password
                    </Label>

                    <a
                      href="#"
                      className="text-[10px] uppercase font-bold text-slate-400 hover:text-slate-900 transition-colors font-sans"
                    >
                      Forgot?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    disabled={isLoading}
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        password: e.target.value,
                      })
                    }
                    className="border-slate-200 rounded-none focus-visible:ring-slate-900 font-sans"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-none font-sans text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300"
                >
                  {isLoading ? "Verifying..." : "Login"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-500 text-center font-sans uppercase tracking-widest">
                  New to the Artisan?{" "}
                  <a
                    href="/register"
                    className="font-bold text-slate-900 hover:underline"
                  >
                    Register
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-[9px] tracking-[0.3em] uppercase text-slate-300 font-sans font-medium">
              Authenticated Connection • Stripe Secured
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
