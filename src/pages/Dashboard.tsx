import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../api/axios.ts";
import Header from "../components/Header.tsx";
import LoadingScreen from "../components/LoadingScreen.tsx";
import AlertCard from "../components/AlertCard.tsx";
import { Train, Volume2, Bell, MapPin, Calendar, Clock, Star, HelpCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export default function Dashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [journey, setJourney] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!userProfile?.userId) return;
      try {
        // Load active journey
        const jResponse = await apiClient.get(`/users/${userProfile.userId}/journey`);
        setJourney(jResponse.data);

        // Load recent alerts
        const aResponse = await apiClient.get(`/users/${userProfile.userId}/alerts`);
        setRecentAlerts(aResponse.data.slice(0, 2));
      } catch (err) {
        console.warn("No active journey or alert history found.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userProfile]);

  if (loading) {
    return <LoadingScreen message="Loading commuter dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow space-y-8" id="dashboard-container">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="font-sans font-extrabold text-3xl tracking-tight text-slate-800">
              Welcome back, {userProfile?.name}! 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Your personalized railway announcer accessibility companion is active.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-mono text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-4 py-2 flex items-center gap-1.5 self-start md:self-auto shadow-sm">
              <Clock className="h-4 w-4 text-[#003399]" />
              <span>Station Time: 2026-07-11 UTC</span>
            </div>
            <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full border border-blue-200/50 text-blue-800 font-semibold text-xs shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
              <span>LIVE TRACKING</span>
            </div>
          </div>
        </div>

        {/* Primary Command Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Journey Status (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Journey Status Card */}
            {journey ? (
              <section className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#003399]/40"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Journey</h3>
                  <button 
                    onClick={() => navigate("/journey")} 
                    className="text-blue-600 font-bold text-xs uppercase tracking-tight hover:underline transition-all"
                    id="edit-journey-btn"
                  >
                    Edit Setup
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-medium">Train Number</p>
                    <p className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Train className="h-5 w-5 text-[#003399]" />
                      {journey.trainNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-medium">Designated Platform</p>
                    <p className="text-xl font-bold text-slate-900">PLATFORM {journey.platform || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-medium">Source</p>
                    <p className="text-xl font-bold text-slate-900">{journey.source || "Station"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-medium">Destination</p>
                    <p className="text-xl font-bold text-[#003399]">{journey.destination}</p>
                  </div>
                </div>
              </section>
            ) : (
              <div className="bg-white border border-slate-200 border-dashed rounded-[32px] p-8 text-center space-y-6 flex flex-col items-center justify-center shadow-sm">
                <div className="bg-blue-50 p-4 rounded-full">
                  <Train className="h-8 w-8 text-[#003399]" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <span className="font-sans font-extrabold text-xl text-slate-800 block">No active journey set</span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Set up your train number and destination so that we can listen and filter station announcements for you.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/journey")}
                  className="bg-[#003399] hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-full transition-all shadow-md text-sm uppercase tracking-wider"
                  id="dashboard-setup-journey"
                >
                  Configure Journey Now
                </button>
              </div>
            )}

            {/* Direct Quick Launch Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Listening Widget Card */}
              <Link
                to="/listening"
                className="bg-white border border-slate-200 hover:border-[#003399]/40 rounded-[32px] p-6 block space-y-4 transition-all group shadow-sm hover:shadow-md"
                id="launch-sensor-card"
              >
                <div className="flex justify-between items-center">
                  <div className="bg-blue-50 text-[#003399] p-3 rounded-2xl group-hover:bg-[#003399] group-hover:text-white transition-all shadow-sm">
                    <Volume2 className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#003399] transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Station Audio Sensor</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Open the live analyzer deck to listen, transcribe and process active sound streams.
                  </p>
                </div>
              </Link>

              {/* Alert History Card */}
              <Link
                to="/alerts"
                className="bg-white border border-slate-200 hover:border-[#003399]/40 rounded-[32px] p-6 block space-y-4 transition-all group shadow-sm hover:shadow-md"
                id="launch-alerts-card"
              >
                <div className="flex justify-between items-center">
                  <div className="bg-slate-100 text-slate-600 p-3 rounded-2xl group-hover:bg-[#003399] group-hover:text-white transition-all shadow-sm">
                    <Bell className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#003399] transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">View Alert Logs</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Access historical archives of every announcement relevant to your profile.
                  </p>
                </div>
              </Link>

            </div>

          </div>

          {/* Right Column: Recent Matches & Guidance (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Title */}
            <div className="flex justify-between items-center px-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">
                Recent Alerts
              </span>
              <Link to="/alerts" className="text-xs text-blue-600 hover:text-blue-800 underline font-semibold">
                See All
              </Link>
            </div>

            {/* Alerts List summary */}
            {recentAlerts.length > 0 ? (
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} compact={true} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-[32px] p-8 text-center text-xs text-slate-500 shadow-sm leading-relaxed">
                No alerts detected recently. Open the Station Audio Sensor to process announcements.
              </div>
            )}

            {/* Commuter Tips Block */}
            <div className="bg-[#F0F8FF] border border-[#003399]/20 rounded-[32px] p-6 space-y-4 shadow-sm">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#003399] block">
                Quick Assist Guide
              </span>
              <ul className="space-y-3 text-xs text-[#3B5480] leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-[#003399] flex-shrink-0 mt-0.5" />
                  <span>Always double check if your mic is enabled in the browser settings.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-[#003399] flex-shrink-0 mt-0.5" />
                  <span>The platform-access route highlights matches that require immediate relocation.</span>
                </li>
              </ul>
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
