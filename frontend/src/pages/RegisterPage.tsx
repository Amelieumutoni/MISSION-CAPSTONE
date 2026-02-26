import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import AuthService from "@/api/services/authService";
import { useNavigate } from "react-router";
import Autocomplete from "@/components/autoComplet";
import { RWANDA_LOCATIONS, SPECIALTIES } from "@/utils/consts";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "author",
    fullName: "",
    bio: "",
    specialty: "",
    location: "",
    yearsExperience: "",
    phoneContact: "",
  });

  const artImages = [
    "https://lirp.cdn-website.com/09ed37c1/dms3rep/multi/opt/timothy-inema-nomad-14-1920w.jpg",
    "https://lirp.cdn-website.com/09ed37c1/dms3rep/multi/opt/Nziza%2BArt%2BInitiative-inema-nomad-agency-10-1920w.JPG",
    "https://lirp.cdn-website.com/09ed37c1/dms3rep/multi/opt/Nziza%2BArt%2BInitiative-inema-nomad-agency-11-1920w.JPG",
    "https://lirp.cdn-website.com/09ed37c1/dms3rep/multi/opt/timothy-inema-nomad-17-1920w.jpg",
  ];

  const navigate = useNavigate();

  const handleNextStep = () => {
    if (!formData.email || !formData.password) {
      toast.error("Required Fields", {
        description: "Credentials are required.",
      });
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    setIsLoading(true);
    const registrationPromise = AuthService.register({
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formData.role === "author" ? "AUTHOR" : "BUYER",
      bio: formData.bio,
      specialty: formData.specialty,
      location: formData.location,
      years_experience: formData.yearsExperience,
      phone_contact: formData.phoneContact,
    });

    toast.promise(registrationPromise, {
      loading: "Creating your Craftfolio...",
      success: () => {
        setIsLoading(false);
        setTimeout(() => navigate("/login", { replace: true }), 1000);
        return "Account created successfully!";
      },
      error: (err) => {
        setIsLoading(false);
        return err.response?.data?.message || "Registration failed.";
      },
    });
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900">
      <Toaster position="top-right" richColors />

      {/* Left Section - Static UI */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-50">
        <div className="absolute inset-0 grid grid-cols-2 gap-0">
          {artImages.map((img, idx) => (
            <div key={idx} className="relative overflow-hidden group">
              <img
                src={img}
                alt="Gallery"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex items-end p-12 bg-gradient-to-t from-slate-900/80">
          <div className="text-white">
            <h2 className="text-5xl font-serif font-bold mb-3">
              Join the Heritage
            </h2>
            <p className="text-xs tracking-[0.4em] uppercase text-slate-300">
              Heritage • Craft • Excellence
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">
              Register
            </h1>
            <p className="text-[10px] tracking-[0.3em] uppercase text-slate-400">
              Step {step} of 2
            </p>
          </div>

          <div className="mb-12">
            <button
              onClick={() => navigate(-1)}
              className="text-sm flex items-center gap-x-4 font-bold text-slate-700 hover:text-slate-900 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
          </div>

          <Card className="border-slate-200 shadow-none rounded-none">
            <CardHeader>
              <CardTitle className="font-serif">
                {step === 1 ? "Authentication" : "Profile Details"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === 1 ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      Account Type
                    </Label>
                    <Select
                      onValueChange={(val) =>
                        setFormData({ ...formData, role: val })
                      }
                      defaultValue={formData.role}
                    >
                      <SelectTrigger className="rounded-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="author">Artisan / Artist</SelectItem>
                        <SelectItem value="buyer">Collector / Buyer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      Email
                    </Label>
                    <Input
                      type="email"
                      className="rounded-none"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      Password
                    </Label>
                    <Input
                      type="password"
                      className="rounded-none"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    onClick={handleNextStep}
                    className="w-full bg-slate-900 py-6 rounded-none text-xs font-bold uppercase tracking-widest"
                  >
                    Continue
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      Full Name
                    </Label>
                    <Input
                      className="rounded-none"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                    />
                  </div>

                  {formData.role === "author" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Specialty Field - Changed to Suggestion List */}
                        {/* Specialty Field - Autosearch & Custom Logic */}
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            Specialty
                          </Label>
                          <Input
                            className="rounded-none border-slate-200 focus:border-slate-900 transition-colors"
                            placeholder="Start typing specialty..."
                            value={formData.specialty}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specialty: e.target.value,
                              })
                            }
                          />

                          <div className="flex flex-wrap gap-1.5 mt-2 max-h-32 overflow-y-auto p-1 border border-transparent">
                            {/* Filter the list based on input */}
                            {SPECIALTIES.filter((s) =>
                              s
                                .toLowerCase()
                                .includes(formData.specialty.toLowerCase()),
                            ).map((spec) => (
                              <button
                                key={spec}
                                type="button"
                                onClick={() =>
                                  setFormData({ ...formData, specialty: spec })
                                }
                                className={`text-[9px] px-2 py-1 border transition-all uppercase font-bold ${
                                  formData.specialty.toLowerCase() ===
                                  spec.toLowerCase()
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400"
                                }`}
                              >
                                {spec}
                              </button>
                            ))}

                            {/* Fallback: If typing something NOT in the list, show what they are writing as a "New" option */}
                            {formData.specialty &&
                              !SPECIALTIES.some(
                                (s) =>
                                  s.toLowerCase() ===
                                  formData.specialty.toLowerCase(),
                              ) && (
                                <div className="flex items-center gap-2 w-full mt-1">
                                  <span className="text-[10px] text-slate-400 italic">
                                    No match found. Using:
                                  </span>
                                  <button
                                    type="button"
                                    className="text-[9px] px-2 py-1 border border-dashed border-slate-400 bg-slate-50 text-slate-900 uppercase font-bold"
                                  >
                                    {formData.specialty}
                                  </button>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Location Field - Unchanged as requested */}
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            Location
                          </Label>
                          <Autocomplete
                            options={RWANDA_LOCATIONS}
                            value={formData.location}
                            placeholder="Select Location"
                            onChange={(val) =>
                              setFormData({ ...formData, location: val })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider">
                            Experience (Years)
                          </Label>
                          <Input
                            type="number"
                            className="rounded-none"
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                yearsExperience: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider">
                            Phone
                          </Label>
                          <Input
                            className="rounded-none"
                            placeholder="+250..."
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phoneContact: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      Bio
                    </Label>
                    <Textarea
                      className="rounded-none min-h-20"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="rounded-none text-xs font-bold uppercase"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleRegister}
                      disabled={isLoading}
                      className="bg-slate-900 rounded-none text-xs font-bold uppercase"
                    >
                      {isLoading ? "Saving..." : "Complete"}
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-sans uppercase tracking-widest">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="font-bold text-slate-900 hover:underline"
                  >
                    Login
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
