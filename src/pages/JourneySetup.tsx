import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axios.ts";
import Header from "../components/Header.tsx";
import JourneyForm from "../components/JourneyForm.tsx";
import LoadingScreen from "../components/LoadingScreen.tsx";
import { Train, Info } from "lucide-react";

export default function JourneySetup() {
  const { userProfile } = useAuth();
  const [initialJourney, setInitialJourney] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadJourney() {
      if (!userProfile?.userId) return;
      try {
        const response = await apiClient.get(`/users/${userProfile.userId}/journey`);
        setInitialJourney(response.data);
      } catch (err) {
        console.log("No previous active journey found for user.");
      } finally {
        setPageLoading(false);
      }
    }
    loadJourney();
  }, [userProfile]);

  const handleJourneySubmit = async (formData: {
    trainNumber: string;
    destination: string;
    source: string;
    platform: string;
  }) => {
    if (!userProfile?.userId) return;
    setSaveLoading(true);
    setMessage("");

    try {
      await apiClient.post(`/users/${userProfile.userId}/journey`, formData);
      setMessage("Journey configured successfully!");
      // Redirect to dashboard where listening resides
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.error || "Failed to configure journey.");
    } finally {
      setSaveLoading(false);
    }
  };

  if (pageLoading) {
    return <LoadingScreen message="Checking active journeys..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#003399]/40"></div>
          
          <div className="text-center space-y-2">
            <h1 className="font-sans font-black text-2xl tracking-tight text-slate-800 uppercase">
              Configure Your Journey 🗺️
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Set up your active commute to match and filter audio announcements.
            </p>
          </div>

          {message && (
            <div
              className={`p-3.5 rounded-2xl text-sm font-semibold text-center border ${
                message.includes("success")
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-blue-50 border-blue-200 text-[#003399]"
              }`}
              id="journey-setup-message"
            >
              {message}
            </div>
          )}

          {/* Form */}
          <JourneyForm
            initialData={initialJourney || undefined}
            onSubmit={handleJourneySubmit}
            isLoading={saveLoading}
          />

          {/* Guidance Banner */}
          <div className="bg-[#F0F8FF] rounded-2xl p-4 border border-[#003399]/15 flex gap-3 text-xs leading-relaxed text-[#3B5480]">
            <Info className="h-5 w-5 text-[#003399] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 font-bold block mb-1">
                Why is this required?
              </strong>
              IntelliAlert filters out thousands of noisy station broadcasts to protect you from sensory overload. We ONLY show and pulse alerts that match your Train Number, Destination, or current Platform.
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Status Bar */}
      <footer className="bg-slate-100 border-t border-slate-200 px-8 py-4 flex justify-between items-center mt-auto">
        <div className="flex space-x-8">
          <div className="flex items-center space-x-2 text-slate-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs font-bold uppercase">Gemini 2.5 Connected</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs font-bold uppercase">Whisper Engine Optimal</span>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-medium hidden sm:block">
          Hackathon Build v1.0.4 — Project IntelliAlert
        </div>
      </footer>
    </div>
  );
}
