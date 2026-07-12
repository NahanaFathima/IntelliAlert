import React from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { Train, LogOut, Bell, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#003399] text-white px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center w-full" id="header-container">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-4 hover:opacity-90">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
            <Train className="h-6 w-6 text-[#003399]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight uppercase leading-none">IntelliAlert</h1>
            <p className="text-[10px] sm:text-xs font-medium text-blue-100 opacity-80 uppercase tracking-widest mt-0.5">
              Railway Accessibility Suite
            </p>
          </div>
        </Link>

        {/* User actions */}
        {userProfile && (
          <div className="flex items-center space-x-4" id="header-actions">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-white">
                {userProfile.name}
              </span>
              <span className="text-xs text-blue-100/80 font-mono">
                {userProfile.email}
              </span>
            </div>
            
            <Link 
              to="/alerts" 
              className="p-2 text-blue-100 hover:text-white hover:bg-blue-800 rounded-full relative transition-all border border-blue-400/20 shadow-sm"
              title="Alert History"
              id="alert-history-link"
            >
              <Bell className="h-5 w-5" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all border border-blue-400/30 shadow-sm"
              title="Sign Out"
              id="signout-button"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
