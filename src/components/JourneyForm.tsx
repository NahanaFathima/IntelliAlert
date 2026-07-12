import React, { useState, useEffect } from "react";
import { Train, MapPin, ArrowRight, Save, Search } from "lucide-react";

// Indian railways mock search helpers for instant convenience
const INDIAN_TRAINS = [
  { number: "12625", name: "Kerala Express (Trivandrum - New Delhi)", src: "Trivandrum Central (TVC)", dest: "New Delhi (NDLS)", platform: "3" },
  { number: "12002", name: "Shatabdi Express (New Delhi - Habibganj)", src: "New Delhi (NDLS)", dest: "Bhopal Habibganj (HBJ)", platform: "1" },
  { number: "12951", name: "Mumbai Rajdhani (Mumbai - New Delhi)", src: "Mumbai Central (MMCT)", dest: "New Delhi (NDLS)", platform: "4" },
  { number: "12260", name: "Sealdah Duronto (New Delhi - Sealdah)", src: "New Delhi (NDLS)", dest: "Sealdah (SDAH)", platform: "12" },
  { number: "12004", name: "Lucknow Shatabdi (New Delhi - Lucknow)", src: "New Delhi (NDLS)", dest: "Lucknow Charbagh (LKO)", platform: "9" }
];

interface JourneyFormProps {
  initialData?: {
    trainNumber: string;
    destination: string;
    source: string;
    platform: string;
  };
  onSubmit: (data: {
    trainNumber: string;
    destination: string;
    source: string;
    platform: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export default function JourneyForm({ initialData, onSubmit, isLoading }: JourneyFormProps) {
  const [trainNumber, setTrainNumber] = useState(initialData?.trainNumber || "");
  const [destination, setDestination] = useState(initialData?.destination || "");
  const [source, setSource] = useState(initialData?.source || "");
  const [platform, setPlatform] = useState(initialData?.platform || "");
  const [error, setError] = useState("");

  // Handle auto-populating based on Indian railways train lists
  useEffect(() => {
    if (trainNumber.length === 5) {
      const match = INDIAN_TRAINS.find((t) => t.number === trainNumber);
      if (match) {
        setSource(match.src);
        setDestination(match.dest);
        setPlatform(match.platform);
        setError("");
      }
    }
  }, [trainNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainNumber.trim()) {
      setError("Train number is required.");
      return;
    }
    if (!destination.trim()) {
      setError("Destination station is required.");
      return;
    }
    if (trainNumber.trim().length !== 5) {
      setError("Indian train numbers must be exactly 5 digits (e.g., 12625).");
      return;
    }
    setError("");
    onSubmit({
      trainNumber: trainNumber.trim(),
      destination: destination.trim(),
      source: source.trim(),
      platform: platform.trim(),
    });
  };

  const selectQuickTrain = (train: typeof INDIAN_TRAINS[0]) => {
    setTrainNumber(train.number);
    setSource(train.src);
    setDestination(train.dest);
    setPlatform(train.platform);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="journey-form">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-2xl text-sm font-semibold animate-pulse" id="form-error">
          {error}
        </div>
      )}

      {/* Train Number Input */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
          Train Number (5 Digits)
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <Train className="h-5 w-5 text-[#003399]" />
          </span>
          <input
            type="text"
            maxLength={5}
            pattern="\d*"
            placeholder="e.g. 12625"
            value={trainNumber}
            onChange={(e) => setTrainNumber(e.target.value.replace(/\D/g, ""))}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-[#003399]/30 focus:border-[#003399] text-lg font-bold shadow-sm"
            id="input-train-number"
            required
          />
        </div>
        <p className="mt-2 text-xs text-slate-500 font-sans leading-relaxed">
          Type 5 digits. Try typing <span className="text-blue-600 font-bold font-mono">12625</span> or <span className="text-blue-600 font-bold font-mono">12002</span> to auto-fill sample routes.
        </p>
      </div>

      {/* Source and Destination Station Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Boarding Station (Source)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <MapPin className="h-5 w-5 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="e.g. Trivandrum Central (TVC)"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003399]/30 focus:border-[#003399] shadow-sm font-semibold text-sm"
              id="input-source"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Destination Station
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <MapPin className="h-5 w-5 text-[#003399]" />
            </span>
            <input
              type="text"
              placeholder="e.g. New Delhi (NDLS)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003399]/30 focus:border-[#003399] shadow-sm font-semibold text-sm"
              id="input-destination"
              required
            />
          </div>
        </div>
      </div>

      {/* Designated Platform Input */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
          Designated Platform (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g. 3"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003399]/30 focus:border-[#003399] font-mono text-base font-bold shadow-sm"
          id="input-platform"
        />
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          Our system checks this to notify you if your platform changes.
        </p>
      </div>

      {/* Quick Select Panel */}
      <div className="pt-4 border-t border-slate-100">
        <span className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5 text-[#003399]" /> Quick Select Indian Railways Samples
        </span>
        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
          {INDIAN_TRAINS.map((train) => (
            <button
              key={train.number}
              type="button"
              onClick={() => selectQuickTrain(train)}
              className="w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs flex justify-between items-center transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-bold text-[10px]">
                  {train.number}
                </span>
                <span className="text-slate-700 font-bold group-hover:text-[#003399] truncate max-w-xs md:max-w-md">
                  {train.name}
                </span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#003399] transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#003399] hover:bg-blue-800 disabled:opacity-40 text-white font-bold py-4 px-6 rounded-full flex items-center justify-center gap-2 transition-all shadow-md text-sm uppercase tracking-wider mt-4"
        id="btn-journey-submit"
      >
        <Save className="h-5 w-5" />
        {isLoading ? "Saving Journey..." : "Save Journey & Start Listening"}
      </button>
    </form>
  );
}
