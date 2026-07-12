import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import apiClient from "../api/axios.ts";
import Header from "../components/Header.tsx";
import AlertCard from "../components/AlertCard.tsx";
import LoadingScreen from "../components/LoadingScreen.tsx";
import { Bell, RefreshCw, AlertTriangle } from "lucide-react";

export default function Alert() {
  const { userProfile } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    if (!userProfile?.userId) return;
    try {
      const response = await apiClient.get(`/users/${userProfile.userId}/alerts`);
      setAlerts(response.data);
    } catch (err) {
      console.error("Failed to load alert history:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [userProfile]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  if (loading) {
    return <LoadingScreen message="Loading alert history..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow space-y-6" id="alerts-history-container">
        {/* Title row */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <h1 className="font-sans font-black text-2xl tracking-tight text-slate-800 flex items-center gap-2 uppercase">
              <Bell className="h-6 w-6 text-[#003399]" />
              My Alerts History
            </h1>
            <p className="text-xs text-slate-500">
              A historical log of railway announcements matching your active journey profiles.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#003399] px-4 py-2.5 rounded-full text-xs font-bold border border-slate-200 shadow-sm transition-all uppercase tracking-wider disabled:opacity-50"
            id="refresh-alerts-btn"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Alerts list */}
        {alerts.length > 0 ? (
          <div className="space-y-4 animate-fade-in" id="alerts-list">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} compact={false} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[32px] p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm" id="alerts-empty-state">
            <div className="bg-blue-50 p-4 rounded-full">
              <AlertTriangle className="h-8 w-8 text-[#003399]" />
            </div>
            <div className="space-y-1">
              <span className="font-extrabold text-slate-850 block text-base">No alerts recorded yet</span>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Once an announcement matches your Train Number or Destination, it will show up as a permanent card in your history logs.
              </p>
            </div>
          </div>
        )}
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
