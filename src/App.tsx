import React, { useState, useEffect, useRef } from "react";
import { initialSlides } from "./slidesData";
import { SlideData, SlidePersona } from "./types";
import exhaustedDeveloperJinja from "../assets/exhausted_developer_jinja.jpg";
import oliverImg from "../assets/oliver.jpg";

import {
  JinjaTemplateSandbox,
  AIChefSandbox,
  LazyAPISandbox,
  OptimisticUISandbox
} from "./components/Sandboxes";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Clock,
  Layout,
  Sliders,
  Maximize2,
  Minimize2,
  FileText,
  Sparkles,
  Users,
  Code,
  PenTool,
  Save,
  Undo,
  RotateCcw,
  Zap,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  Award,
  Terminal,
  Volume2
} from "lucide-react";

interface FloatingReaction {
  id: string;
  emoji: string;
  left: number;
}

export default function App() {
  // --- Slides State ---
  const [slides, setSlides] = useState<SlideData[]>(initialSlides);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const currentSlide = slides[currentSlideIndex];

  // --- Display Modes ---
  // "presenter" = split view with notes
  // "fullscreen" = maximum cinematic view of the slide
  // "grid" = directory view of all slides
  const [viewMode, setViewMode] = useState<"presenter" | "fullscreen" | "grid">("presenter");

  // --- Speaker Settings ---
  const [autoScrollNotes, setAutoScrollNotes] = useState(true);
  const [fontSizeSetting, setFontSizeSetting] = useState<"sm" | "md" | "lg">("md");
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  // --- Timer State ---
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // --- Editor State ---
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedSubheading, setEditedSubheading] = useState("");
  const [editedPoints, setEditedPoints] = useState<string[]>([]);
  const [editedPunchline, setEditedPunchline] = useState("");
  const [editedSpeakerNotes, setEditedSpeakerNotes] = useState("");
  const [newPointInput, setNewPointInput] = useState("");

  const notesEndRef = useRef<HTMLDivElement>(null);

  // --- Fullscreen API & Netflix-style Controls Auto-hide ---
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && viewMode === "fullscreen") {
        setViewMode("presenter");
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === "fullscreen") {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.error("Error enabling fullscreen:", err);
        });
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error("Error exiting fullscreen:", err);
        });
      }
    }
  }, [viewMode]);

  useEffect(() => {
    if (viewMode !== "fullscreen") {
      setShowControls(true);
      return;
    }

    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    };

    window.addEventListener("mousemove", handleMouseMove);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2500);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [viewMode]);

  // --- Timer effect ---
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // --- Handle Keyboard Arrow Triggers ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) return; // ignore typing
      if (e.key === "ArrowRight") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "f" || e.key === "F") {
        setViewMode((prev) => (prev === "fullscreen" ? "presenter" : "fullscreen"));
      } else if (e.key === "g" || e.key === "G") {
        setViewMode("grid");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlideIndex, isEditing]);

  // --- Sync Edit Fields with current slide ---
  useEffect(() => {
    if (currentSlide) {
      setEditedTitle(currentSlide.title);
      setEditedSubheading(currentSlide.content.subheading || "");
      setEditedPoints([...currentSlide.content.points]);
      setEditedPunchline(currentSlide.content.punchline || "");
      setEditedSpeakerNotes(currentSlide.speakerNotes);
    }
  }, [currentSlideIndex]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const triggerReaction = (emoji: string) => {
    const newId = Math.random().toString();
    const newLeft = Math.floor(Math.random() * 80) + 10; // random percentage
    setReactions((prev) => [...prev, { id: newId, emoji, left: newLeft }]);

    // Clear after animation
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newId));
    }, 1800);
  };

  // --- Save Edited Slide state ---
  const saveSlideChanges = () => {
    const updated = slides.map((slide, idx) => {
      if (idx === currentSlideIndex) {
        return {
          ...slide,
          title: editedTitle,
          speakerNotes: editedSpeakerNotes,
          content: {
            ...slide.content,
            subheading: editedSubheading,
            points: editedPoints,
            punchline: editedPunchline
          }
        };
      }
      return slide;
    });
    setSlides(updated);
    setIsEditing(false);
  };

  // --- Reset slides deck to initial ---
  const resetSlidesToDefault = () => {
    if (window.confirm("לחזור למצגת המקורית ולמחוק את השינויים שביצעת?")) {
      setSlides(initialSlides);
      setCurrentSlideIndex(0);
      setIsEditing(false);
    }
  };

  // --- Font size class mapping ---
  const getFontSizeClass = () => {
    switch (fontSizeSetting) {
      case "sm": return "text-[12px] leading-relaxed";
      case "lg": return "text-[16px] leading-loose font-medium";
      default: return "text-[14px] leading-relaxed";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative antialiased overflow-x-hidden">

      <style dangerouslySetInnerHTML={{
        __html: `
        .fullscreen-active .grid-cols-1.md\:grid-cols-2 {
          gap: 1.5rem !important;
        }
        .fullscreen-active .border-4 {
          border-width: 4px !important;
          padding: 1.25rem !important;
          border-radius: 1.5rem !important;
        }
        .fullscreen-active .min-h-\[105px\\],
        .fullscreen-active .min-h-\[300px\] {
          min-height: 120px !important;
          margin-bottom: 0.75rem !important;
        }
        .fullscreen-active .mb-4,
        .fullscreen-active .my-4,
        .fullscreen-active .mb-3 {
          margin-bottom: 0.75rem !important;
          margin-top: 0.5rem !important;
        }
        .fullscreen-active p:not(.slide-bullet-point):not(.slide-punchline-text),
        .fullscreen-active .text-xs:not(.slide-bullet-point):not(.slide-punchline-text),
        .fullscreen-active .text-sm:not(.slide-bullet-point):not(.slide-punchline-text) {
          font-size: 0.85rem !important;
          line-height: 1.4 !important;
        }
        .fullscreen-active h4 {
          font-size: 1rem !important;
        }
        .fullscreen-active form {
          margin-bottom: 0.75rem !important;
        }
        .fullscreen-active input,
        .fullscreen-active button {
          font-size: 0.85rem !important;
          padding-top: 0.4rem !important;
          padding-bottom: 0.4rem !important;
        }
        .fullscreen-active pre {
          font-size: 0.85rem !important;
        }
        .fullscreen-active .max-h-\[220px\] {
          max-height: 180px !important;
        }
        .fullscreen-active .max-h-\[120px\] {
          max-height: 180px !important;
        }
        .fullscreen-active .gap-6,
        .fullscreen-active .gap-5 {
          gap: 1.5rem !important;
        }
        .fullscreen-active .lg\:w-1\/2.justify-between {
          justify-content: flex-start !important;
        }
        .fullscreen-active .lg\:w-1\/2.justify-between pre {
          margin-top: 0 !important;
          flex: 1 !important;
          height: auto !important;
          max-height: none !important;
        }
        .fullscreen-active .bg-amber-50 {
          padding: 0.5rem 0.75rem !important;
          margin-bottom: 0.75rem !important;
        }
        .fullscreen-active .lg\:w-1\/3 {
          width: 33.333% !important;
        }
      `}} />

      {/* Decorative Grid Line Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* REACT FLOATING REACTIONS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
        {reactions.map((r) => (
          <span
            key={r.id}
            className="absolute bottom-16 text-4xl animate-reaction pointer-events-none select-none"
            style={{ left: `${r.left}%` }}
          >
            {r.emoji}
          </span>
        ))}
      </div>

      {/* TOP DECK HEADER BAR */}
      <header className="border-b border-slate-950 bg-slate-900 px-6 py-4 flex items-center justify-between z-10 sticky top-0 text-white" dir="rtl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg shadow">
            <Layout className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-[10px] text-blue-400 font-mono tracking-widest block uppercase font-bold">Interactive Platform</span>
            <h1 className="font-sans font-black text-base text-white">
              Jinja2 vs HTMX: סיפור של שפיות וקוד
            </h1>
          </div>
        </div>

        {/* Central Display mode controls */}
        <div className="flex items-center gap-1.5 bg-slate-850 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setViewMode("presenter")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === "presenter" ? "bg-slate-750 text-blue-400 border border-slate-650 shadow-sm" : "text-slate-300 hover:text-white"}`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>תצוגת מרצה</span>
          </button>
          <button
            onClick={() => setViewMode("fullscreen")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === "fullscreen" ? "bg-slate-750 text-blue-400 border border-slate-650 shadow-sm" : "text-slate-300 hover:text-white"}`}
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>מסך מלא</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === "grid" ? "bg-slate-750 text-blue-400 border border-slate-650 shadow-sm" : "text-slate-300 hover:text-white"}`}
          >
            <Layout className="h-3.5 w-3.5" />
            <span>קטלוג שקופיות</span>
          </button>
        </div>

        {/* Right Timer or Quick action controls */}
        <div className="flex items-center gap-4">
          {/* Deck Reset to defaults */}
          <button
            onClick={resetSlidesToDefault}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            title="אפס מצגת למקור"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 bg-blue-950/50 border border-blue-900/40 px-3 py-1.5 rounded-lg font-mono text-xs text-blue-400">
            <Clock className="h-3.5 w-3.5" />
            <span>זמן כולל: {formatTimer(elapsedTime)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="hover:text-blue-300 ml-1 shrink-0"
            >
              {isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </header>

      {/* CORE DISPLAY ROUTER */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* VIEW 1: BENTO OVERVIEW GRID */}
        {viewMode === "grid" && (
          <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full text-right" dir="rtl">
            <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold font-sans text-slate-900">קטלוג שקופיות מקיף ({slides.length} שקפים)</h2>
                <p className="text-xs text-slate-500 mt-1">תוכל/י לקפוץ במהירות לכל שקף, לערוך את תכניו או לצפות באפיון האישיות הלוגית שלו.</p>
              </div>
              <button
                onClick={() => setViewMode("presenter")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition-all"
              >
                חזור למצגת
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  onClick={() => {
                    setCurrentSlideIndex(idx);
                    setViewMode("presenter");
                  }}
                  className={`border group cursor-pointer bg-white rounded-2xl p-5 hover:border-blue-500/50 transition-all hover:translate-y-[-2px] flex flex-col justify-between min-h-[220px] shadow-sm ${currentSlideIndex === idx ? "border-blue-600 ring-2 ring-blue-600/10 shadow-md bg-slate-50/50" : "border-slate-200"
                    }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-mono text-slate-400 font-bold">שקף {slide.number} מתוך {slides.length}</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-wider font-semibold border ${slide.persona === "technical"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : slide.persona === "marketing"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}>
                        {slide.persona === "technical" ? "טכני" : slide.persona === "marketing" ? "שיווקי" : "משותף"}
                      </span>
                    </div>

                    <h3 className="font-sans font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                      {slide.title}
                    </h3>
                    <p className="text-slate-500 text-[11px] mt-2 line-clamp-2 leading-relaxed">
                      {slide.content.points[0]}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
                    <span className="truncate max-w-[170px] italic text-slate-500">💡 {slide.content.punchline}</span>
                    <span className="text-[10px] text-blue-600 font-semibold underline group-hover:no-underline font-mono">צפה בשקף ←</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: SPLIT VIEW PRESENTER MODE (DEFAULT) */}
        {viewMode === "presenter" && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

            {/* PRESENTER SIDEBAR: SPEECH NOTES & INTERACTIVE SIMULATION OPTIONS */}
            <div className="w-full lg:w-[410px] border-l border-slate-200 bg-white flex flex-col justify-between max-h-full overflow-hidden shrink-0 text-right" dir="rtl">

              {/* Timing & Persona metrics */}
              <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">איפיון וסגנון השקף:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold border ${currentSlide.persona === "technical"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : currentSlide.persona === "marketing"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-purple-50 text-purple-700 border-purple-200"
                    }`}>
                    {currentSlide.persona === "technical" ? "טכנולוגי (Technical)" : currentSlide.persona === "marketing" ? "שיווקי (Marketing)" : "שיתופי (Shared)"}
                  </span>
                </div>

                {/* Persona summary */}
                <div className="bg-white p-2.5 rounded-lg text-[11px] text-slate-600 leading-relaxed border border-slate-150 shadow-sm">
                  {currentSlide.persona === "technical" && "💻 דגש טכנולוגי: שקופית קוד, לוגואים של FastAPI, סכמות תהליכים, וחוויות פיתוח פנימיות."}
                  {currentSlide.persona === "marketing" && "📢 דגש עסקי/שיווקי: סימולציה של חסכון בזמן עבודה, אופטימיזציה מקסימלית למפתח, ומסרים עסקיים."}
                  {currentSlide.persona === "shared" && "✨ דגש חוויתי: החלפת סיפורים, פאנטצ'ים הומוריסטיים, דוקו-פיתוח, וחיבור אישי עם קהל המאזינים."}
                </div>
              </div>

              {/* SPEAKER PROMPTER NOTES (SCROLLABLE) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-xs font-mono font-bold text-blue-600 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> הערות הדובר (Teleprompter)
                  </span>

                  {/* Font adjustments */}
                  <div className="flex gap-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-[10px]">
                    <button
                      onClick={() => setFontSizeSetting("sm")}
                      className={`px-1.5 py-0.5 rounded ${fontSizeSetting === "sm" ? "bg-white text-slate-900 shadow-sm border border-slate-250 font-bold" : "text-slate-400"}`}
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setFontSizeSetting("md")}
                      className={`px-1.5 py-0.5 rounded ${fontSizeSetting === "md" ? "bg-white text-slate-900 shadow-sm border border-slate-250 font-bold" : "text-slate-400"}`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => setFontSizeSetting("lg")}
                      className={`px-1.5 py-0.5 rounded ${fontSizeSetting === "lg" ? "bg-white text-slate-900 shadow-sm border border-slate-250 font-bold" : "text-slate-400"}`}
                    >
                      A+
                    </button>
                  </div>
                </div>

                <div className={`${getFontSizeClass()} text-slate-700 font-sans leading-relaxed whitespace-pre-wrap bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-inner`}>
                  {currentSlide.speakerNotes}
                </div>

                {/* Quick Editor Toggle when in presenter view */}
                <div className="pt-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-250 transition-colors shadow-sm"
                    >
                      <PenTool className="h-3.5 w-3.5 text-blue-600" />
                      ערוך שקופית זו וצפה בשינויים
                    </button>
                  ) : (
                    <div className="bg-slate-50 border border-blue-200 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-bold text-blue-600 font-sans">עורך תכנים מהיר</span>
                        <span className="text-[10px] text-slate-400">שמור כדי לעדכן במקום</span>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] text-slate-600 font-semibold">כותרת שקף:</label>
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-sans text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] text-slate-600 font-semibold font-sans">הערות מרצה:</label>
                        <textarea
                          rows={4}
                          value={editedSpeakerNotes}
                          onChange={(e) => setEditedSpeakerNotes(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-sans text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-2.5 py-1 text-slate-400 hover:text-slate-800 text-xs"
                        >
                          ביטול
                        </button>
                        <button
                          onClick={saveSlideChanges}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs flex items-center gap-1 shadow-sm"
                        >
                          <Save className="h-3 w-3" /> שמור שינויים
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AUDIENCE SIMULATION REACT BOARD */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 select-none">
                <span className="text-[10px] font-mono block text-slate-500 mb-2 font-bold flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-blue-600" /> אינטראקטיביות קהל (סימולציה)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => triggerReaction("👏")}
                    className="py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-sm flex flex-col items-center justify-center transition-all hover:scale-105 shadow-sm text-slate-800"
                    title="מחיאות כפיים"
                  >
                    <span>👏</span> <span className="text-[9px] text-slate-400 mt-1">כפיים</span>
                  </button>
                  <button
                    onClick={() => triggerReaction("😂")}
                    className="py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-sm flex flex-col items-center justify-center transition-all hover:scale-105 shadow-sm text-slate-800"
                    title="צחוק מהפאנץ'"
                  >
                    <span>😂</span> <span className="text-[9px] text-slate-400 mt-1">צחוק</span>
                  </button>
                  <button
                    onClick={() => triggerReaction("😮")}
                    className="py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-sm flex flex-col items-center justify-center transition-all hover:scale-105 shadow-sm text-slate-800"
                    title="השתוממות מהשגיאה!"
                  >
                    <span>😮</span> <span className="text-[9px] text-slate-400 mt-1">וואו</span>
                  </button>
                  <button
                    onClick={() => triggerReaction("🔥")}
                    className="py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-sm flex flex-col items-center justify-center transition-all hover:scale-105 shadow-sm text-slate-800"
                    title="קוד לוהט"
                  >
                    <span>🔥</span> <span className="text-[9px] text-slate-400 mt-1">אש</span>
                  </button>
                </div>
              </div>
            </div>

            {/* PRESENTATION DISPLAY SCREEN (CENTERED SPLIT) */}
            <div className="flex-1 bg-slate-100 p-6 flex flex-col justify-between overflow-y-auto min-h-0 border-r border-slate-200">

              {/* SLIDE WRAPPER CARD */}
              <div className="flex-1 flex items-center justify-center">
                <PresenterPageSlide key={currentSlide.id} slide={currentSlide} />
              </div>

              {/* SLIDE CONTROLS FOOTER */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4" dir="rtl">
                <button
                  onClick={prevSlide}
                  disabled={currentSlideIndex === 0}
                  className="px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-30 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition-all shadow-sm"
                >
                  <ChevronRight className="h-4 w-4" /> קודם
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono">
                    Slide {currentSlideIndex + 1} of {slides.length}
                  </span>
                  <div className="flex gap-1">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlideIndex(i)}
                        className={`h-2 rounded-full transition-all ${i === currentSlideIndex
                          ? "w-6 bg-blue-600 shadow-sm"
                          : "w-2 bg-slate-350 hover:bg-slate-400"
                          }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={nextSlide}
                  disabled={currentSlideIndex === slides.length - 1}
                  className="px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-30 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition-all shadow-sm"
                >
                  הבא <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: FULLSCREEN PRESENTATION MODE */}
        {viewMode === "fullscreen" && (
          <div className="fixed inset-0 z-50 w-screen h-screen bg-[#f4f7fa] flex flex-col justify-between overflow-hidden transition-all duration-300 fullscreen-active" dir="rtl">

            {/* Minimal floating navigation header */}
            <div className={`absolute top-6 left-6 right-6 flex items-center justify-between z-50 px-4 transition-opacity duration-500 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-mono text-slate-800 border border-slate-200 shadow-md">
                שקף {currentSlideIndex + 1} מתוך {slides.length}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("presenter")}
                  className="px-3 py-1.5 bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 text-[11px] font-semibold rounded-lg hover:text-blue-655 hover:bg-slate-50 transition-colors shadow-md cursor-pointer"
                >
                  סגור מסך מלא
                </button>
              </div>
            </div>

            {/* Slides display maximized */}
            <div className="flex-1 w-full h-full">
              <PresenterPageSlide key={currentSlide.id} slide={currentSlide} isFullscreen />
            </div>

            {/* Floating Navigation Controls */}
            <div className={`transition-opacity duration-500 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              <button
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/90 backdrop-blur-md hover:bg-slate-50 disabled:opacity-30 rounded-full border border-slate-200 text-slate-700 hover:text-blue-600 transition-all shadow-lg cursor-pointer"
                title="הקודם"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <button
                onClick={nextSlide}
                disabled={currentSlideIndex === slides.length - 1}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/90 backdrop-blur-md hover:bg-slate-50 disabled:opacity-30 rounded-full border border-slate-200 text-slate-700 hover:text-blue-600 transition-all shadow-lg cursor-pointer"
                title="הבא"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

function PresenterPageSlide({ slide, isFullscreen = false }: { slide: SlideData; isFullscreen?: boolean; key?: React.Key }) {
  // Choose layout tokens based on slide's persona skin
  const getSkinTheme = (persona: SlidePersona) => {
    switch (persona) {
      case "technical":
        return {
          banner: "bg-emerald-50 text-emerald-800",
          border: "border-emerald-200 shadow-emerald-100/50",
          fontTitle: "font-sans font-black tracking-tight text-slate-900",
          iconColor: "text-emerald-600",
          accentBg: "bg-emerald-100/70",
          indicatorBubble: "🟢 מצג טכנולוגי (TECHNICAL)"
        };
      case "marketing":
        return {
          banner: "bg-amber-50 text-amber-800",
          border: "border-amber-200 shadow-amber-100/50",
          fontTitle: "font-sans font-black tracking-tight text-slate-900",
          iconColor: "text-amber-600",
          accentBg: "bg-amber-100/70",
          indicatorBubble: "📢 מצג עסקי (MARKETING)"
        };
      default: // shared
        return {
          banner: "bg-purple-50 text-purple-800",
          border: "border-purple-200 shadow-purple-100/50",
          fontTitle: "font-sans font-black tracking-tight text-slate-900",
          iconColor: "text-purple-600",
          accentBg: "bg-purple-100/70",
          indicatorBubble: "✨ סיפור חוויתי (SHARED STORY)"
        };
    }
  };

  const skin = getSkinTheme(slide.persona);

  return (
    <div
      className={`w-full flex flex-col justify-between animate-fade-in relative transition-all duration-300 ${isFullscreen
          ? "w-full h-screen max-h-screen bg-[#f4f7fa] p-4 md:p-8 lg:p-10 text-slate-900 overflow-hidden"
          : "max-w-5xl rounded-3xl border-8 border-slate-200 bg-white shadow-xl shadow-slate-200/50 min-h-[460px] p-6 md:p-8 text-slate-900"
        }`}
      dir="rtl"
    >
      {/* Decorative Slide Background elements */}
      {!isFullscreen && (
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-blue-600 via-indigo-600 to-transparent opacity-90" />
      )}

      {/* Slide Header Info / Persona Category indicator */}
      <div className={`flex justify-between items-center ${isFullscreen ? "mb-2 lg:mb-3" : "mb-6"}`}>
        <span className="font-mono text-[10px] tracking-widest text-slate-400 font-bold">
          SLIDEDECK • NO.{slide.number} PAGE
        </span>

        <div className="flex items-center gap-2.5">
          <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded font-mono font-bold">
            {skin.indicatorBubble}
          </span>
          <img
            src={oliverImg}
            alt="Oliver"
            className={`${isFullscreen ? "w-20 h-20" : "w-12 h-12"} rounded-full border-2 border-slate-200 shadow-md object-cover`}
          />
        </div>
      </div>

      {/* Main Slide Grid layout Content panel */}
      <div className={`flex-1 flex flex-col justify-center ${isFullscreen ? "space-y-3 lg:space-y-4" : "space-y-5"}`}>
        <div>
          {slide.content.subheading && (
            <span className={`inline-block border font-bold rounded-sm w-fit font-sans ${isFullscreen
                ? "px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs md:text-sm mb-1.5"
                : "px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs md:text-sm mb-2.5"
              }`}>
              {slide.content.subheading}
            </span>
          )}
          <h2 className={`font-sans tracking-tight leading-none font-extrabold ${skin.fontTitle} ${isFullscreen ? "text-2xl md:text-3xl lg:text-4xl" : "text-2xl md:text-4xl"
            }`}>
            {slide.title}
          </h2>
        </div>

        {/* Bullet points mapping */}
        <div className={`pt-1 ${isFullscreen ? "space-y-2 lg:space-y-2.5" : "space-y-3"}`}>
          {slide.content.points.map((point, index) => (
            <div key={index} className="flex items-start gap-2.5 text-right">
              <span className={`mt-2 shrink-0 h-1.5 w-1.5 rounded-full ${slide.persona === "technical" ? "bg-emerald-500" : slide.persona === "marketing" ? "bg-amber-500" : "bg-purple-500"}`} />
              <p className={`slide-bullet-point leading-relaxed font-sans ${isFullscreen ? "text-slate-900 text-base md:text-lg lg:text-xl font-medium" : "text-slate-700 text-sm md:text-base"
                }`}>
                {point}
              </p>
            </div>
          ))}
        </div>

        {/* DYNAMIC SANDBOX INTEGRATION DEPENDING ON ACTIVE SLIDE */}
        <div className={`pt-4 min-h-0 ${isFullscreen ? "mt-2" : "mt-2"}`}>
          {slide.number === 1 && (
            <div className={`bg-slate-50 border border-slate-250 text-center shadow-sm flex flex-col items-center ${isFullscreen ? "p-6 rounded-2xl max-w-3xl mx-auto" : "p-4 rounded-xl"}`}>
              <div className={`relative rounded-lg overflow-hidden border border-slate-200 ${isFullscreen ? "w-[680px] h-[360px] max-w-full mb-3" : "w-full max-w-xs h-28 mb-3"}`}>
                <img src={exhaustedDeveloperJinja} alt="Exhausted developer looking at spaghetti code" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-2 justify-center">
                  <span className="text-white text-xs font-bold font-sans drop-shadow-md">"קרב אבוד מראש"</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 block mb-1 font-mono uppercase font-bold">ויז'ואל קונספט</span>
              <p className="text-slate-655 font-sans text-xs md:text-sm font-medium italic">
                {slide.concept}
              </p>
              <div className="mt-4 flex justify-center">
                <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl max-w-sm flex items-center gap-3 shadow-xs">
                  <Terminal className="h-4 w-4 text-blue-600" />
                  <span className="text-[11px] font-sans text-blue-800 font-bold">
                    מערך: FastAPI + Jinja2 (קרב אבוד מראש)
                  </span>
                </div>
              </div>
            </div>
          )}

          {slide.number === 2 && (
            <div className={`bg-slate-50 border border-slate-250 shadow-sm ${isFullscreen ? "p-6 rounded-2xl max-w-3xl mx-auto" : "p-4 rounded-xl"}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-[10px] bg-emerald-100 border border-emerald-250 text-emerald-800 rounded font-mono font-bold">FastAPI Check</span>
                <span className="text-[11px] text-slate-500 font-sans">Reality Check: סימולציה של חלוקת תהליכי Async</span>
              </div>
              <div className={`bg-slate-900 rounded-lg border border-slate-950 overflow-auto font-mono text-zinc-300 text-left shadow-inner whitespace-pre ${isFullscreen ? "p-5 text-sm leading-relaxed" : "p-3.5 text-[11.5px]"}`} dir="ltr">
                <span className="text-emerald-400 font-bold">@app.get("/")</span>{"\n"}
                <span className="text-purple-400 font-bold">async def</span> <span className="text-blue-400">home</span>(request: Request):{"\n"}
                {"  "}<span className="text-zinc-500"># Jinja2 rendering inside Event Loop!</span>{"\n"}
                {"  "}<span className="text-zinc-500"># Blocked event loops lead to UI choking...</span>{"\n"}
                {"  "}<span className="text-purple-400 font-bold">return</span> templates.TemplateResponse(<span className="text-amber-400">"index.html"</span>, {"{"}<span className="text-amber-400">"request"</span>: request{"}"})
              </div>
            </div>
          )}

          {slide.number === 3 && (
            <div className={`space-y-2 ${isFullscreen ? "max-w-3xl mx-auto w-full" : ""}`}>
              <span className="text-[10px] text-blue-600 font-mono block font-bold">עדויות ופעולת Sandbox לעדות החיסכון:</span>
              <JinjaTemplateSandbox />
            </div>
          )}

          {slide.number === 4 && (
            <div className={`space-y-2 ${isFullscreen ? "max-w-5xl mx-auto w-full" : ""}`}>
              <span className="text-[10px] text-purple-600 font-mono block font-bold">סימולטור Prompting של שף ה-AI מבוסס Gemini:</span>
              <AIChefSandbox />
            </div>
          )}

          {slide.number === 5 && (
            <div className={`space-y-2 ${isFullscreen ? "max-w-3xl mx-auto w-full" : ""}`}>
              <span className="text-[10px] text-blue-600 font-mono block font-bold">התבונה שברכיבה מהירה על גלגלים קיימים:</span>
              <LazyAPISandbox />
            </div>
          )}

          {slide.number === 6 && (
            <div className={`bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-250 text-center space-y-3 shadow-xs ${isFullscreen ? "p-8 rounded-2xl max-w-3xl mx-auto" : "p-5 rounded-2xl"}`}>
              <div className="flex justify-center flex-col items-center">
                <Award className="h-10 w-10 text-blue-600 animate-bounce mb-2" />
                <h4 className="text-sm md:text-base font-extrabold text-slate-900">מסקנה מהפרויקט: הפרודוקטיביות החדשה 🚀</h4>
              </div>
              <p className="text-xs md:text-sm text-slate-655 max-w-lg mx-auto leading-relaxed">
                פה אמנם השתמשתי בAI לכתוב לרוב קומנטים (ולמצגת כמובן), אבל בכללי אולי כן לעבוד עם AI?
              </p>
              <div className="pt-2 flex justify-center">
                <a
                  href="https://github.com/David-Beninson/recipe_project/blob/main/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-sans transition-all shadow-md hover:translate-y-[-1px] cursor-pointer"
                >
                  <span>📂</span>
                  מעבר מהיר ל-README בפרויקט
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide Punchline Footer panel */}
      {slide.content.punchline && (
        <div className={`px-4 py-3 rounded-xl border flex items-center justify-between text-right relative overflow-hidden shadow-xs ${isFullscreen ? "max-w-2xl mx-auto w-full mt-4" : "w-full mt-6"
          } ${slide.persona === "technical"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : slide.persona === "marketing"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-purple-50 border-purple-200 text-purple-800"
          }`}>
          <div className="flex items-center gap-2">
            <Zap className={`h-4 w-4 shrink-0 ${slide.persona === "technical" ? "text-emerald-600" : slide.persona === "marketing" ? "text-amber-600" : "text-purple-600"}`} />
            <span className={`slide-punchline-text font-sans font-bold ${isFullscreen ? "text-sm md:text-base lg:text-lg" : "text-xs md:text-sm"}`}>
              {slide.content.punchline}
            </span>
          </div>

          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-450 font-bold shrink-0">
            PUNCHLINE
          </span>
        </div>
      )}
    </div>
  );
}
