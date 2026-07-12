import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.tsx";
import AlertCard from "../components/AlertCard.tsx";
import LoadingScreen from "../components/LoadingScreen.tsx";
import apiClient from "../api/axios.ts";
import { Mic, MicOff, AlertCircle, Upload, Volume2, Settings, RefreshCw, AudioLines, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Listening() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  // Route protection - must have active journey to monitor
  const [activeJourney, setActiveJourney] = useState<any>(null);
  const [loadingJourney, setLoadingJourney] = useState(true);

  // Audio & Recording State
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);

  // Settings
  const [autoRecordEnabled, setAutoRecordEnabled] = useState(false);
  const [dbThreshold, setDbThreshold] = useState(40); // threshold out of 100

  // Server result alerts
  const [latestAlert, setLatestAlert] = useState<any>(null);
  const [processingStatus, setProcessingStatus] = useState("");
  const [recentBroadcasts, setRecentBroadcasts] = useState<any[]>([]);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<any>(null);
  const autoRecordTimeoutRef = useRef<any>(null);

  // Load journey details
  useEffect(() => {
    async function checkJourney() {
      if (!userProfile?.userId) return;
      try {
        const response = await apiClient.get(`/users/${userProfile.userId}/journey`);
        setActiveJourney(response.data);
      } catch (err) {
        console.warn("No active journey configured!");
      } finally {
        setLoadingJourney(false);
      }
    }
    checkJourney();
  }, [userProfile]);

  // Handle timer countdown during active recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Clean up mic streams when unmounting
  useEffect(() => {
    return () => {
      stopMonitoring();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (autoRecordTimeoutRef.current) clearTimeout(autoRecordTimeoutRef.current);
    };
  }, []);

  const startMonitoring = async () => {
    try {
      setProcessingStatus("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      // Audio setup for volume monitoring
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      setIsMonitoring(true);
      monitorVolume();
    } catch (err) {
      console.error("Microphone access denied:", err);
      setProcessingStatus("Microphone access denied. Please check site permissions.");
    }
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setVolumeLevel(0);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
  };

  // Real-time voice visualizer & automatic sound level detection
  const monitorVolume = () => {
    if (!analyserRef.current || !isMonitoring) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume level
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength;
    const normalizedLevel = Math.min(100, Math.round((average / 128) * 100));
    setVolumeLevel(normalizedLevel);

    // Auto-record trigger check (if audio exceeds threshold and we are not currently recording or processing)
    if (autoRecordEnabled && normalizedLevel > dbThreshold && !isRecording && !processingStatus) {
      console.log(`Volume (${normalizedLevel}) exceeded threshold (${dbThreshold}). Triggering 8s automatic recording...`);
      startRecording(8); // Auto record 8 seconds
    }

    animationFrameRef.current = requestAnimationFrame(monitorVolume);
  };

  // Start recording audio chunks
  const startRecording = (durationSeconds: number = 0) => {
    if (!micStreamRef.current) {
      setProcessingStatus("Microphone stream not active.");
      return;
    }

    try {
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(micStreamRef.current);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
        await uploadAudioFile(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setProcessingStatus("");

      // If duration specified (e.g. 8 seconds for auto), schedule stop
      if (durationSeconds > 0) {
        autoRecordTimeoutRef.current = setTimeout(() => {
          stopRecording();
        }, durationSeconds * 1000);
      }
    } catch (err: any) {
      console.error("Failed to start MediaRecorder:", err);
      setProcessingStatus("Failed to start recording hardware.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (autoRecordTimeoutRef.current) clearTimeout(autoRecordTimeoutRef.current);
    }
  };

  // Upload recorded or selected audio
  const uploadAudioFile = async (audioBlob: Blob) => {
    if (!userProfile?.userId) return;

    setProcessingStatus("Uploading and analyzing announcement...");
    const formData = new FormData();
    formData.append("audio", audioBlob, "announcement.wav");
    formData.append("user_id", userProfile.userId);

    try {
      const response = await apiClient.post("/announcement/process", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const alert = response.data;
      setProcessingStatus("");
      setLatestAlert(alert);

      // Track broadcast history in state
      setRecentBroadcasts((prev) => [
        {
          id: Date.now(),
          title: alert.title,
          message: alert.message,
          priority: alert.priority,
          relevant: alert.relevant,
          timestamp: new Date().toISOString(),
          recommendedAction: alert.recommendedAction,
          timeRemaining: alert.timeRemaining,
          routeRequired: alert.routeRequired,
        },
        ...prev.slice(0, 4),
      ]);
    } catch (err: any) {
      console.error(err);
      setProcessingStatus("Analysis failed. Unable to transcribe speech.");
    }
  };

  // Drag & drop or manual file selection handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAudioFile(file);
    }
  };

  if (loadingJourney) {
    return <LoadingScreen message="Loading station monitoring dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8" id="listening-container">
        
        {/* Left Column: Listener State Panel */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Journey Status Ribbon */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 flex items-center justify-between shadow-sm" id="listening-journey-ribbon">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                Active Match Target
              </span>
              {activeJourney ? (
                <div>
                  <h2 className="font-sans font-extrabold text-xl text-[#003399]">
                    Train {activeJourney.trainNumber}
                  </h2>
                  <p className="text-sm font-semibold text-slate-600 mt-0.5">
                    {activeJourney.source ? `${activeJourney.source} ` : ""}➔ {activeJourney.destination}
                  </p>
                  {activeJourney.platform && (
                    <span className="inline-block bg-blue-50 text-[#003399] border border-blue-200/50 font-mono text-xs font-bold px-3 py-1 rounded-full mt-2">
                      Platform {activeJourney.platform}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-red-500 font-bold">
                  ⚠️ No active journey. Alerts will NOT be targeted.
                </p>
              )}
            </div>
            
            <button
              onClick={() => navigate("/journey")}
              className="text-xs bg-white hover:bg-slate-50 text-blue-600 font-bold py-2.5 px-4 rounded-full border border-slate-200 shadow-sm transition-all uppercase tracking-wider"
              id="change-journey-btn"
            >
              Configure
            </button>
          </div>

          {/* Active Sound Sensor */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center space-y-8 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#003399]/40"></div>

            <div className="space-y-1.5">
              <h3 className="font-sans font-black text-2xl text-slate-800 uppercase tracking-tight">
                Station Audio Analyzer 🎚️
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Keep your sensor on. We transcribe live announcements, translate speech, and trigger alert matches.
              </p>
            </div>

            {/* Glowing Microphone Waveform simulation */}
            <div className="relative flex items-center justify-center h-56 w-full">
              {isMonitoring && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.15, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                    className="absolute w-52 h-52 bg-blue-50 rounded-full blur-xl"
                  />
                  <div className="absolute w-64 h-64 border-2 border-blue-50 rounded-full animate-pulse opacity-45"></div>
                </>
              )}

              <button
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                className={`relative z-10 w-36 h-36 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                  isMonitoring
                    ? "bg-[#003399] text-white hover:bg-blue-800 scale-105"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 border border-slate-200"
                }`}
                id="mic-monitoring-btn"
              >
                {isMonitoring ? (
                  <Mic className="h-14 w-14 animate-pulse" />
                ) : (
                  <MicOff className="h-14 w-14" />
                )}
              </button>
            </div>

            {/* Status indicator text */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <span className={`w-2.5 h-2.5 rounded-full mr-2 ${isMonitoring ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
                {isMonitoring ? "LIVE MONITORING ACTIVE" : "SENSOR IS IDLE"}
              </span>
              
              {isRecording && (
                <span className="text-sm font-black text-red-500 font-mono animate-pulse bg-red-50 border border-red-200 px-4 py-1 rounded-full">
                  🔴 RECORDING FEED: {recordingDuration}s / 8s
                </span>
              )}
            </div>

            {/* Live Visual Waveform Level Indicator */}
            <div className="w-full max-w-xs space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400 font-bold px-1">
                <span>Input Level</span>
                <span>{volumeLevel}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                <motion.div
                  animate={{ width: `${volumeLevel}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 10 }}
                  className={`h-full rounded-full ${volumeLevel > dbThreshold ? "bg-[#FF4D4D]" : "bg-[#003399]"}`}
                />
              </div>

              {/* Bento Waveform Simulation bars */}
              <div className="flex space-x-1.5 items-end h-16 pt-4 justify-center">
                {[4, 8, 12, 10, 6, 9, 11, 5, 8].map((h, i) => {
                  const baseHeight = h * 4;
                  const dynamicHeight = isMonitoring ? Math.max(4, Math.min(64, (volumeLevel / 100) * baseHeight * 1.5)) : h * 1.5;
                  return (
                    <motion.div
                      key={i}
                      animate={{ height: `${dynamicHeight}px` }}
                      className={`w-2 rounded-full transition-all duration-100 ${
                        isMonitoring 
                          ? volumeLevel > dbThreshold 
                            ? "bg-[#FF4D4D]" 
                            : "bg-[#003399]" 
                          : "bg-slate-200"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Upload status message */}
            {processingStatus && (
              <div className="bg-blue-50/70 p-4 border border-blue-200/50 rounded-2xl flex items-center gap-3 text-xs justify-center max-w-sm w-full animate-pulse shadow-sm">
                <RefreshCw className="h-4 w-4 text-[#003399] animate-spin flex-shrink-0" />
                <span className="text-[#003399] font-bold">{processingStatus}</span>
              </div>
            )}

            {/* Bottom Actions Row: Manual File Selection or Manual Record Triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-6 border-t border-slate-100">
              
              {/* Manual Record Trigger */}
              <button
                disabled={!isMonitoring || isRecording}
                onClick={() => startRecording(8)}
                className="bg-slate-50 hover:bg-slate-100 disabled:opacity-40 border border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-full text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <AudioLines className="h-4 w-4 text-[#003399]" />
                Manual Record (8s)
              </button>

              {/* Manual Upload audio */}
              <label className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-full text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm">
                <Upload className="h-4 w-4 text-[#003399]" />
                Upload Audio File
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Configuration Settings for Automatic Listening */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#003399]" />
                Mic Voice-Activation
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRecordEnabled}
                  onChange={(e) => setAutoRecordEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003399]" />
              </label>
            </div>

            {autoRecordEnabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="space-y-3 pt-4 border-t border-slate-100"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Trigger Threshold Level</span>
                  <span className="font-mono text-[#003399] font-bold">{dbThreshold} dB</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={dbThreshold}
                  onChange={(e) => setDbThreshold(Number(e.target.value))}
                  className="w-full accent-[#003399] h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 leading-normal">
                  If ambient announcement volume exceeds <span className="text-[#003399] font-bold font-mono">{dbThreshold}%</span>, the system immediately begins recording 8 seconds of speech, translates it, and verifies it.
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Live Targeted Alert display */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-sans font-black text-xl text-slate-800 uppercase tracking-tight">
              Targeted Alerts 🚨
            </h3>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">
              Only Matches Shown
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            {latestAlert ? (
              <div className="space-y-4">
                <AlertCard alert={latestAlert} />
                
                {/* Reset button */}
                <button
                  onClick={() => setLatestAlert(null)}
                  className="w-full py-3 px-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 font-bold text-xs rounded-full shadow-sm transition-all uppercase tracking-wider"
                >
                  Clear Active Alert Box
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-slate-200 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center text-center space-y-5 shadow-sm"
              >
                <div className="bg-blue-50 p-4 rounded-full">
                  <Sparkles className="h-8 w-8 text-[#003399] animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="font-extrabold text-slate-800 block text-base">
                    No active alert
                  </span>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Waiting to process a station announcement. Once the system detects a match, your personalized card will appear instantly here.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Historical broadcasts list */}
          {recentBroadcasts.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-2">
                Session Streams
              </span>
              <div className="space-y-3">
                {recentBroadcasts.map((b) => (
                  <div
                    key={b.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between text-xs shadow-sm ${
                      b.relevant
                        ? "bg-[#F0F8FF] border-[#003399]/20 text-[#002266]"
                        : "bg-white border-slate-200 text-slate-500"
                    }`}
                  >
                    <div className="space-y-0.5 max-w-[75%]">
                      <span className="font-bold text-slate-800 block truncate">
                        {b.title}
                      </span>
                      <p className="text-slate-500 truncate leading-normal">
                        {b.message}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold ${
                      b.relevant ? "bg-[#003399]/15 text-[#003399]" : "bg-slate-100 text-slate-400"
                    }`}>
                      {b.relevant ? "MATCH" : "IGNORED"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
