import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, Square, Plus, Trash2, Edit, Play, Download, ArrowLeft, Save, 
  CheckCircle2, Users, Calendar, Activity, Clock, Layers, Sparkles, 
  MessageSquare, ChevronRight, ChevronLeft, FileText, Share2, PlusCircle, UserPlus, Info, Check, Trash, Tag, X,
  History as HistoryIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Coach, ObservationPoint, ChecklistQuestion, Exercise, ObservationSession } from "./types";
import { DEFAULT_COACHES, FOOTBALL_ACTION_THEMES, DEFAULT_CHECK_QUESTIONS } from "./data";
import { SefNextGenLogo } from "./components/SefNextGenLogo";

export default function App() {
  // ---- APPLICATION VIEWS ----
  // "landing" | "setup" | "observation" | "finished"
  const [view, setViewState] = useState<"landing" | "setup" | "observation" | "finished">("landing");
  const [previousView, setPreviousView] = useState<"landing" | "setup" | "observation" | "finished" | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [tagToDeleteIndex, setTagToDeleteIndex] = useState<number | null>(null);

  const setView = (newView: "landing" | "setup" | "observation" | "finished") => {
    setPreviousView(view);
    setViewState(newView);
  };

  const handleGoBackFromFinished = () => {
    if (previousView === "observation") {
      setViewState("observation");
    } else {
      setViewState("landing");
      setViewingPastSession(null);
    }
  };

  const handleResetToLanding = () => {
    // Reset all active session state to defaults
    setCoaches([{ id: "c1", name: "", role: "Huvudtränare" }]);
    setTeam("");
    setTheme("");
    setMatchCycleMDPlus("Välj M+1 till M+2");
    setMatchCycleMDMinus("Välj M-7 till M-1");
    const today = new Date();
    setSessionsDate(today.toISOString().split('T')[0]);
    setNumExercises(3);
    setExercises([]);
    setSelectedFootballActions([]);
    setPlannedRPE(5);
    setPlannedDuration(90);
    setCustomCategories([]);
    setChecklist([]);
    setComments([]);
    setManualComment("");
    setActiveTag("allmant");
    setViewingPastSession(null);
    setIsBallInPlayActive(false);

    // Go back to landing page
    setViewState("landing");
  };
  
  // ---- ACTIVE SESSION DATA ----
  const [coaches, setCoaches] = useState<Coach[]>([
    { id: "c1", name: "", role: "Huvudtränare" }
  ]);
  const [team, setTeam] = useState("");
  const [theme, setTheme] = useState("");
  const [matchCycleMDPlus, setMatchCycleMDPlus] = useState("Välj M+1 till M+2");
  const [matchCycleMDMinus, setMatchCycleMDMinus] = useState("Välj M-7 till M-1");
  const [sessionsDate, setSessionsDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  // Custom date picker calendar state
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCustomCalendar(false);
      }
    }
    if (showCustomCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCustomCalendar]);
  const [numExercises, setNumExercises] = useState(3);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedFootballActions, setSelectedFootballActions] = useState<string[]>([]);
  const [plannedRPE, setPlannedRPE] = useState(5);
  const [plannedDuration, setPlannedDuration] = useState(90);
  
  // Custom headers/categories created on the fly
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  
  // Checklist templates & actual responses
  const [checklist, setChecklist] = useState<ChecklistQuestion[]>([]);
  const [isEditingChecklist, setIsEditingChecklist] = useState<boolean>(false);
  const [isEditingTags, setIsEditingTags] = useState<boolean>(false);
  
  // Audio & Comment Log state
  const [comments, setComments] = useState<ObservationPoint[]>([]);
  const [manualComment, setManualComment] = useState("");
  const [activeTag, setActiveTag] = useState<string>("allmant"); // "allmant" | "coachutvecklare" | coachId
  
  // ---- BEHAVIOR TAGGER ENGINE ----
  const [behaviorTags, setBehaviorTags] = useState<string[]>([
    "PEPP",
    "positiv förstärkning på beteende",
    "radiostyrning",
    "positiv förstärkning av IUP",
    "GNÄLL",
    "förstärkning av position",
    "förstärkning av tajming",
    "förstärkning av riktning",
    "förstärkning av fart"
  ]);

  // ---- BALL IN PLAY TIMER ----
  const [isBallInPlayActive, setIsBallInPlayActive] = useState<boolean>(false);
  
  // Navigation inside the complex observation mode
  // "planering" | "inramning" | "genomforande" | "utvardering_spelare" | "utvardering_tranareteamet" | "custom_[index]"
  const [activeTab, setActiveTab] = useState<string>("planering");
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [scrolledDown, setScrolledDown] = useState<boolean>(false);

  useEffect(() => {
    setScrolledDown(false);
  }, [activeTab, activeExerciseIndex]);

  // ---- RECORDING ENGINE ----
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingError, setRecordingError] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Checklist item specific audio recording states and refs
  const [recordingQuestionId, setRecordingQuestionId] = useState<string | null>(null);
  const [checklistRecordDuration, setChecklistRecordDuration] = useState<number>(0);
  const checklistMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const checklistAudioChunksRef = useRef<Blob[]>([]);
  const checklistTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ---- HISTORICAL SESSIONS ----
  const [savedSessions, setSavedSessions] = useState<ObservationSession[]>([]);
  const [viewingPastSession, setViewingPastSession] = useState<ObservationSession | null>(null);

  // Load past sessions from localStorage on init
  useEffect(() => {
    try {
      const stored = localStorage.getItem("football_coach_sessions");
      if (stored) {
        setSavedSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved sessions", e);
    }
  }, []);

  // Save changes to localStorage helper
  const saveToArchive = (sessionToSave: ObservationSession) => {
    try {
      const updated = [sessionToSave, ...savedSessions.filter(s => s.id !== sessionToSave.id)];
      setSavedSessions(updated);
      localStorage.setItem("football_coach_sessions", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to archive session", e);
    }
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToDelete(id);
  };

  const confirmDeleteSession = () => {
    if (sessionToDelete) {
      const updated = savedSessions.filter(s => s.id !== sessionToDelete);
      setSavedSessions(updated);
      localStorage.setItem("football_coach_sessions", JSON.stringify(updated));
      if (viewingPastSession?.id === sessionToDelete) {
        setViewingPastSession(null);
      }
      setSessionToDelete(null);
    }
  };

  // Setup initial list of Exercises when numExercises or layout loads
  useEffect(() => {
    const updated: Exercise[] = [];
    for (let i = 1; i <= numExercises; i++) {
      const existing = exercises.find(ex => ex.id === `ex-${i}`);
      updated.push({
        id: `ex-${i}`,
        title: existing?.title || `Övning ${i}`,
        focus: existing?.focus || ""
      });
    }
    setExercises(updated);
  }, [numExercises]);

  // Handle Recording Timer & 60s Auto-stop
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setRecordDuration(prev => {
          if (prev >= 59) {
            // Auto stop at 60s
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setRecordDuration(0);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  // Handle Checklist Audio Recording Timer & 120s Auto-stop to keep base64 sizes healthy
  useEffect(() => {
    if (recordingQuestionId) {
      checklistTimerIntervalRef.current = setInterval(() => {
        setChecklistRecordDuration(prev => {
          if (prev >= 119) {
            // Auto stop at 120s (2 minutes)
            stopChecklistRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (checklistTimerIntervalRef.current) {
        clearInterval(checklistTimerIntervalRef.current);
      }
      setChecklistRecordDuration(0);
    }
    return () => {
      if (checklistTimerIntervalRef.current) clearInterval(checklistTimerIntervalRef.current);
    };
  }, [recordingQuestionId]);

  const startChecklistRecording = async (questionId: string) => {
    if (isRecording) {
      stopRecording();
    }
    if (recordingQuestionId) {
      stopChecklistRecording();
    }

    setRecordingQuestionId(questionId);
    setChecklistRecordDuration(0);
    checklistAudioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg";
      } else if (MediaRecorder.isTypeSupported("audio/wav")) {
        mimeType = "audio/wav";
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      checklistMediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          checklistAudioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(checklistAudioChunksRef.current, { type: mimeType });
        stream.getTracks().forEach(track => track.stop());

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setChecklist(prev => prev.map(q => q.id === questionId ? { ...q, audioUrl: base64Audio } : q));
        };
      };

      recorder.start();
    } catch (err) {
      console.error("Microphone access denied for checklist recording", err);
      alert("Kunde inte starta mikrofonen. Kontrollera behörigheterna i din webbläsare.");
      setRecordingQuestionId(null);
    }
  };

  const stopChecklistRecording = () => {
    if (checklistMediaRecorderRef.current && checklistMediaRecorderRef.current.state !== "inactive") {
      checklistMediaRecorderRef.current.stop();
    }
    setRecordingQuestionId(null);
  };

  const handleDeleteChecklistAudio = (qId: string) => {
    if (confirm("Är du säker på att du vill ta bort det här röstmemot?")) {
      setChecklist(prev => prev.map(q => q.id === qId ? { ...q, audioUrl: undefined } : q));
    }
  };

  // Setup Checklist structure when custom categories are added or initialized
  const initializeSession = () => {
    // Basic verification
    const filteredCoaches = coaches.filter(c => c.name.trim() !== "");
    if (filteredCoaches.length === 0) {
      alert("Var god fyll i minst en tränare i tränarteamet.");
      return;
    }
    setCoaches(filteredCoaches);

    // Populate checklist responses
    const initialChecklist = DEFAULT_CHECK_QUESTIONS.map(q => ({ ...q }));

    const genomforandeQuestions = [
      "ÄR ALLT MATERIAL PÅ RIKTIG PLATS FÖRE TRÄNINGEN ÖVNINGEN STARTAR?",
      "ÄR SPELARNA MENTALT/FYSISKT FÖRBEREDA PÅ VAD MAN SKALL GÖRA UNDER ÖVNINGEN?",
      "VET SAMTIGA TRÄNARE VAD DE SKALL GÖRA OCH HAR DE EN UPPGIFT?",
      "HUR ÄR FLYTET GENOM ÖVNINGEN?",
      "HUR INTEGRERAS MÅLVAKTEN MED ÖVRIGA SPELARE OCH TRÄNINGENS SYFTE?",
      "HUR VÄL UPPNÅS ÖVNINGENS SYFTE? HUR VÄL STÄMMER PLANERINGEN ÖVERLAG MED UTFALLET (ÖVNINGSDESIGN, YTOR, BELASTNING, FOTBOLLSFYS, FOTBOLLSPSYKOLOGI) MED DET SOM SYNS I ÖVNINGEN?",
      "ÄR DET EN RÖD TRÅD I TRÄNINGEN? STÄMMER ÖVNINGEN IHOP MED SYFTET TOTALT SÄTT PÅ TRÄNINGEN?",
      "HUR SYNS VÄRDEGRUNDEN KONKRET I ÖVNINGEN?",
      "HUR VÄL LYCKAS TRÄNARNA GE FEEDBACK UNDER TRÄNING? SKER FEEDBACKEN I NÄRTID AV HÄNDELSEN?",
      "PÅ VILKA SETT GES FEEDBACK?",
      "HUR FINNS DET TÄVLING I ÖVNINGEN?"
    ];

    exercises.forEach(ex => {
      genomforandeQuestions.forEach((qText, idx) => {
        initialChecklist.push({
          id: `g-${ex.id}-${idx}`,
          category: "genomforande",
          exerciseId: ex.id,
          question: qText,
          answer: ""
        });
      });
    });

    setChecklist(initialChecklist);
    setComments([]);
    setManualComment("");
    setActiveTab("planering");
    setActiveExerciseIndex(0);
    setView("observation");
  };

  // ---- AUDIO RECORDER HOOKS ----
  const startRecording = async () => {
    setRecordingError("");
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine best audio mimeType supported natively by the browser
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg";
      } else if (MediaRecorder.isTypeSupported("audio/wav")) {
        mimeType = "audio/wav";
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        stream.getTracks().forEach(track => track.stop());
        await processAudio(audioBlob, mimeType);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Microphone access denied or unsupported", err);
      setRecordingError("Kunde inte starta mikrofonen. Kontrollera behörigheterna i din webbläsare.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Upload sound bytes to backend Express route and get structured feedback bullets
  const processAudio = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    try {
      // Convert audio blob to base64 string
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        const response = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audio: base64Data,
            mimeType: mimeType
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Misslyckades att tolka ljudet.");
        }

        const data = await response.json();
        if (data.points && data.points.length > 0) {
          // Append bullets returned from Gemini to the comments feed
          const timestamp = new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
          const newPoints: ObservationPoint[] = data.points.map((ptStr: string, idx: number) => ({
            id: `pt-${Date.now()}-${idx}`,
            timestamp,
            category: activeTab,
            exerciseId: activeTab === "genomforande" ? exercises[activeExerciseIndex]?.id : undefined,
            coachId: activeTag,
            text: ptStr
          }));
          
          setComments(prev => [...prev, ...newPoints]);
        } else {
          alert("Ingen rösttranskribering kunde genereras. Prata lite tydligare nära mikrofonen.");
        }
      };
    } catch (err: any) {
      console.error("Audio pipeline failed", err);
      alert(`Tolkningsfel: ${err.message || "Kontrollera att servern är aktiv och att din internetanslutning fungerar."}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Add a manual typed comment
  const handleAddManualComment = () => {
    if (!manualComment.trim()) return;
    const timestamp = new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
    
    const newPoint: ObservationPoint = {
      id: `pt-${Date.now()}`,
      timestamp,
      category: activeTab,
      exerciseId: activeTab === "genomforande" ? exercises[activeExerciseIndex]?.id : undefined,
      coachId: activeTag,
      text: manualComment.trim()
    };
    
    setComments(prev => [...prev, newPoint]);
    setManualComment("");
  };

  // Delete observation point
  const handleDeleteComment = (pointId: string) => {
    setComments(prev => prev.filter(p => p.id !== pointId));
  };

  // Quick edit of observation point inline
  const handleEditComment = (pointId: string, updatedText: string) => {
    setComments(prev => prev.map(p => p.id === pointId ? { ...p, text: updatedText } : p));
  };

  // ---- TIMERS & TAGGING ACTIONS ----
  // Increment active ball in play seconds every second
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isBallInPlayActive) {
      interval = setInterval(() => {
        setExercises(prev => prev.map((ex, idx) => {
          if (idx === activeExerciseIndex) {
            return {
              ...ex,
              ballInPlaySeconds: (ex.ballInPlaySeconds || 0) + 1
            };
          }
          return ex;
        }));
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBallInPlayActive, activeExerciseIndex]);

  // Pause active playtime timer if active exercise indexes shift
  useEffect(() => {
    setIsBallInPlayActive(false);
  }, [activeExerciseIndex]);

  // Modify Level 2 Behavior Tags in the tag panel
  const handleModifyBehaviorTags = () => {
    const action = prompt("Skriv in en ny tagg att lägga till i listan, eller skriv 'RENSA' för att tömma listan:");
    if (!action) return;
    if (action.toUpperCase() === "RENSA") {
      setBehaviorTags([]);
    } else {
      setBehaviorTags(prev => [...prev, action.trim()]);
    }
  };

  // Trigger behavior tag (clicking Nivå 2 instantly saves comment for the active Nivå 1 coach)
  const handleTriggerBehaviorTag = (tagLabel: string) => {
    const timestamp = new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
    
    const newPoint: ObservationPoint = {
      id: `pt-tag-${Date.now()}`,
      timestamp,
      category: activeTab,
      exerciseId: activeTab === "genomforande" ? exercises[activeExerciseIndex]?.id : undefined,
      coachId: activeTag,
      text: tagLabel
    };
    
    setComments(prev => [...prev, newPoint]);
  };

  // Helper selectors for layout checklists & comments
  const activeChecklistQuestions = checklist.filter(q => {
    if (activeTab === "genomforande") {
      return q.category === "genomforande" && q.exerciseId === exercises[activeExerciseIndex]?.id;
    }
    return q.category === activeTab;
  });

  const activeComments = comments.filter(c => {
    if (activeTab === "genomforande") {
      return c.category === "genomforande" && c.exerciseId === exercises[activeExerciseIndex]?.id;
    }
    return c.category === activeTab;
  });

  // Handle direct textarea answer updates
  const handleUpdateChecklistAnswer = (qId: string, textValue: string) => {
    setChecklist(prev => prev.map(item => item.id === qId ? { ...item, answer: textValue } : item));
  };

  // Add custom question dynamically to current category checklist
  const handleAddCustomQuestion = () => {
    const questionText = prompt("Skriv in din nya frågeställning till checklistan:");
    if (!questionText || !questionText.trim()) return;
    
    const newQ: ChecklistQuestion = {
      id: `custom-q-${Date.now()}`,
      category: activeTab,
      exerciseId: activeTab === "genomforande" ? exercises[activeExerciseIndex]?.id : undefined,
      question: questionText.trim().toUpperCase(),
      answer: ""
    };
    
    setChecklist(prev => [...prev, newQ]);
  };

  const handleAddCustomCategory = () => {
    const catName = prompt("Skriv in namnet på den nya kategorin/rubriken:");
    if (!catName || !catName.trim()) return;
    
    const slug = `custom_${catName.trim().toLowerCase().replace(/\s+/g, "_")}`;
    if (customCategories.includes(slug)) {
      alert("En kategori med det namnet finns redan.");
      return;
    }
    
    setCustomCategories(prev => [...prev, slug]);
    setActiveTab(slug);
    
    // Add an initial basic question for the custom category
    const initialQ: ChecklistQuestion = {
      id: `custom-q-${Date.now()}`,
      category: slug,
      question: `OBSERVATIONER OCH ANALYS AV: ${catName.trim().toUpperCase()}`,
      answer: ""
    };
    setChecklist(prev => [...prev, initialQ]);
  };

  // Compile full session details for final report
  const compileSession = (): ObservationSession => {
    const plannedLoad = plannedRPE * plannedDuration;
    return {
      id: `session-${Date.now()}`,
      date: sessionsDate,
      team: team || "Ej angett lag",
      theme: theme || "Allmänt observationspass",
      matchCycleMDPlus,
      matchCycleMDMinus,
      coaches,
      numExercises,
      exercises,
      footballActions: selectedFootballActions,
      plannedRPE,
      plannedDuration,
      plannedLoad,
      checklistAnswers: checklist,
      customObservations: comments,
      customCategories,
      createdAt: new Date().toISOString()
    };
  };

  // Complete and save observation
  const handleFinishSession = () => {
    const sessionObj = compileSession();
    saveToArchive(sessionObj);
    setViewingPastSession(sessionObj);
    setView("finished");
  };

  // Generate beautiful structured PDF with complete analytics report
  const handleGeneratePDF = async (session: ObservationSession) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4"
    });

    const primaryColor = [249, 115, 22]; // Orange SVG theme styling
    const darkGray = [44, 48, 60];
    const borderGray = [220, 220, 225];

    // Page margin settings
    const marginX = 15;
    let currentY = 18;

    // Helper functions for easy wrapping & formatting
    const writeSectionHeader = (title: string) => {
      // Draw background stripe banner
      doc.setFillColor(245, 246, 248);
      doc.rect(marginX, currentY - 5, 180, 8, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(249, 115, 22); // Orange Accent
      doc.text(title.toUpperCase(), marginX + 3, currentY);
      currentY += 8;
    };

    const writeKeyValue = (key: string, val: string, xPos: number) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`${key}: `, xPos, currentY);
      const keyWidth = doc.getTextWidth(`${key}: `);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(20, 20, 20);
      doc.text(val || "N/A", xPos + keyWidth, currentY);
    };

    // --- TITLE HEADER ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("ANALYS- OCH OBSERVATIONSRAPPORT", marginX, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Tränarutveckling i Elitfotboll — Digitalt underlag", marginX, currentY);
    
    // Draw a prominent orange outline line under title
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(1);
    doc.line(marginX, currentY + 3, 195, currentY + 3);
    currentY += 12;

    // --- SESSIONSINFO DETAILS BLOCKS (GRID) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text("ALLMÄN SESSIONSDATA", marginX, currentY);
    currentY += 6;

    // Row 1
    writeKeyValue("Datum", session.date, marginX);
    writeKeyValue("Lag / Grupp", session.team, marginX + 60);
    writeKeyValue("Huvudtema", session.theme, marginX + 120);
    currentY += 6;

    // Row 2
    writeKeyValue("Kondition MD+", session.matchCycleMDPlus, marginX);
    writeKeyValue("Kondition MD-", session.matchCycleMDMinus, marginX + 60);
    writeKeyValue("Antal övningar", `${session.numExercises} st`, marginX + 120);
    currentY += 6;

    // Row 3
    writeKeyValue("Planerad RPE", `${session.plannedRPE} / 10`, marginX);
    writeKeyValue("Planerad tid", `${session.plannedDuration} min`, marginX + 60);
    writeKeyValue("Belastningsindex", `${session.plannedRPE * session.plannedDuration} RPE*min`, marginX + 120);
    currentY += 6;

    // Row 4: Total active play time (Boll i spel)
    const totalBallInPlaySeconds = session.exercises.reduce((sum, curr) => sum + (curr.ballInPlaySeconds || 0), 0);
    const totalPct = session.plannedDuration > 0 ? ((totalBallInPlaySeconds / (session.plannedDuration * 60)) * 100).toFixed(1) : "0.0";
    const totalMins = Math.floor(totalBallInPlaySeconds / 60);
    const totalSecs = totalBallInPlaySeconds % 60;
    writeKeyValue("Total tid - Boll i spel", `${totalMins} min ${totalSecs} sek`, marginX);
    writeKeyValue("Andel av totaltid", `${totalPct}%`, marginX + 90);
    currentY += 8;

    // Selected soccer action themes list
    if (session.footballActions && session.footballActions.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text("Fotbollsaktioner i fokus: ", marginX, currentY);
      const actionStr = session.footballActions.join(", ");
      doc.setFont("helvetica", "normal");
      doc.setTextColor(20, 20, 20);
      const wrappedActions = doc.splitTextToSize(actionStr, 135);
      doc.text(wrappedActions, marginX + 45, currentY);
      currentY += (wrappedActions.length * 4) + 2;
    }

    // --- COACH LIST ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text("TRÄNARTEAM UNDER OBSERVATION", marginX, currentY);
    currentY += 5;

    session.coaches.forEach((coach, index) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text(`• ${coach.name || `Tränare ${index + 1}`} - Roll: ${coach.role}`, marginX + 4, currentY);
      currentY += 4.5;
    });
    currentY += 6;

    // Function to render category section safely supporting page splits
    const renderCategoryDataInPDF = (catSlug: string, catTitle: string) => {
      // Check if page overflow about to hit bottom
      if (currentY > 230) {
        doc.addPage();
        currentY = 18;
      }

      writeSectionHeader(catTitle);
      currentY += 4;

      // Extract template answers
      const catAnswers = session.checklistAnswers.filter(q => q.category === catSlug);
      
      // Extract custom points
      const catPoints = session.customObservations.filter(p => p.category === catSlug);

      // Render answers to checklist if any present
      catAnswers.forEach(ans => {
        if (!ans.answer.trim() && !ans.audioUrl) return; // skip if completely unanswered

        if (currentY > 260) {
          doc.addPage();
          currentY = 18;
        }

        // Draw subheader question
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        const wrappedQuestion = doc.splitTextToSize(ans.question, 175);
        doc.text(wrappedQuestion, marginX + 2, currentY);
        currentY += (wrappedQuestion.length * 3.5) + 1.5;

        // Draw response text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(20, 20, 20);

        let finalAnswer = ans.answer || "";
        if (ans.coachId) {
          const coachObj = session.coaches.find(c => c.id === ans.coachId);
          let tagText = "";
          if (ans.coachId === "coachutvecklare") tagText = "Coachutvecklare";
          else if (ans.coachId === "allmant") tagText = "Allmänt";
          else if (coachObj) tagText = coachObj.name || coachObj.role;
          if (tagText) {
            finalAnswer = `[gäller: ${tagText.toUpperCase()}] ${finalAnswer}`;
          }
        }

        if (ans.audioUrl) {
          finalAnswer = `${finalAnswer ? finalAnswer + " " : ""}[🎙️ LJUMBILAGA / RÖSTMEMO SPARAT I APPEN]`;
        }

        const wrappedAnswer = doc.splitTextToSize(finalAnswer, 172);
        doc.text(wrappedAnswer, marginX + 4, currentY);
        currentY += (wrappedAnswer.length * 4) + 5;
      });

      // Render custom observation logs for this section
      if (catPoints.length > 0) {
        if (currentY > 250) {
          doc.addPage();
          currentY = 18;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(110, 110, 110);
        doc.text("LÖPANDE OBSERVATIONSANTECKNINGAR:", marginX + 2, currentY);
        currentY += 5;

        catPoints.forEach(pt => {
          if (currentY > 265) {
            doc.addPage();
            currentY = 18;
          }

          const coachObj = session.coaches.find(c => c.id === pt.coachId);
          let tagIndicator = "Allmänt";
          if (pt.coachId === "coachutvecklare") tagIndicator = "Coachutvecklare";
          else if (coachObj) tagIndicator = coachObj.name || coachObj.role;

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(249, 115, 22); // Orange Tag styling!
          doc.text(`[${tagIndicator}]`, marginX + 3, currentY);
          const tagWidth = doc.getTextWidth(`[${tagIndicator}] `);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(20, 20, 20);
          const ptText = pt.text;
          const wrappedPt = doc.splitTextToSize(ptText, 175 - tagWidth);
          doc.text(wrappedPt, marginX + 4 + tagWidth, currentY);
          currentY += (wrappedPt.length * 4) + 3.5;
        });
        currentY += 3;
      } else if (catAnswers.filter(q => q.answer.trim()).length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(150, 150, 150);
        doc.text("Inga specifika observationer registrerade under denna rubrik.", marginX + 4, currentY);
        currentY += 6;
      }
      currentY += 4;
    };

    // Render generic categories
    renderCategoryDataInPDF("planering", "1. Planering (Före passet)");
    renderCategoryDataInPDF("inramning", "2. Inramning (Presentation)");

    // Render exercises dynamically
    session.exercises.forEach((ex, exIdx) => {
      if (currentY > 230) {
        doc.addPage();
        currentY = 18;
      }

      writeSectionHeader(`3. Genomförande: ${ex.title}`);
      currentY += 4;

      // Print Ball in play active time stats
      const ballInPlaySecs = ex.ballInPlaySeconds || 0;
      const exPct = session.plannedDuration > 0 ? ((ballInPlaySecs / (session.plannedDuration * 60)) * 100).toFixed(1) : "0.0";
      const exMinsDisplay = `${Math.floor(ballInPlaySecs / 60)} min ${ballInPlaySecs % 60} sek`;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(16, 124, 65); // Beautiful forest/emerald green color
      doc.text("Aktiv speltid (Boll i spel): ", marginX + 2, currentY);
      const labelW = doc.getTextWidth("Aktiv speltid (Boll i spel): ");

      doc.setFont("helvetica", "normal");
      doc.setTextColor(20, 20, 20);
      doc.text(`${exMinsDisplay} (${exPct}% av total planerad träningstid)`, marginX + 2 + labelW, currentY);
      currentY += 6;

      if (ex.focus) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text("Fokus/Viktiga moment i övningen: ", marginX + 2, currentY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(20, 20, 20);
        const wrappedFocus = doc.splitTextToSize(ex.focus, 120);
        doc.text(wrappedFocus, marginX + 50, currentY);
        currentY += (wrappedFocus.length * 4) + 4;
      }

      const exAnswers = session.checklistAnswers.filter(q => q.category === "genomforande" && q.exerciseId === ex.id);
      const exPoints = session.customObservations.filter(p => p.category === "genomforande" && p.exerciseId === ex.id);

      exAnswers.forEach(ans => {
        if (!ans.answer.trim() && !ans.audioUrl) return;

        if (currentY > 260) {
          doc.addPage();
          currentY = 18;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        const wrappedQuestion = doc.splitTextToSize(ans.question, 175);
        doc.text(wrappedQuestion, marginX + 2, currentY);
        currentY += (wrappedQuestion.length * 3.5) + 1.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(20, 20, 20);

        let finalAnswer = ans.answer || "";
        if (ans.coachId) {
          const coachObj = session.coaches.find(c => c.id === ans.coachId);
          let tagText = "";
          if (ans.coachId === "coachutvecklare") tagText = "Coachutvecklare";
          else if (ans.coachId === "allmant") tagText = "Allmänt";
          else if (coachObj) tagText = coachObj.name || coachObj.role;
          if (tagText) {
            finalAnswer = `[gäller: ${tagText.toUpperCase()}] ${finalAnswer}`;
          }
        }

        if (ans.audioUrl) {
          finalAnswer = `${finalAnswer ? finalAnswer + " " : ""}[🎙️ LJUMBILAGA / RÖSTMEMO SPARAT I APPEN]`;
        }

        const wrappedAnswer = doc.splitTextToSize(finalAnswer, 172);
        doc.text(wrappedAnswer, marginX + 4, currentY);
        currentY += (wrappedAnswer.length * 4) + 5;
      });

      if (exPoints.length > 0) {
        if (currentY > 250) {
          doc.addPage();
          currentY = 18;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(110, 110, 110);
        doc.text("MUNTLIGA/LÖPANDE FEEDBACKPUNKTER:", marginX + 2, currentY);
        currentY += 5;

        exPoints.forEach(pt => {
          if (currentY > 265) {
            doc.addPage();
            currentY = 18;
          }

          const coachObj = session.coaches.find(c => c.id === pt.coachId);
          let tagIndicator = "Allmänt";
          if (pt.coachId === "coachutvecklare") tagIndicator = "Coachutvecklare";
          else if (coachObj) tagIndicator = coachObj.name || coachObj.role;

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(249, 115, 22);
          doc.text(`[${tagIndicator}]`, marginX + 3, currentY);
          const tagWidth = doc.getTextWidth(`[${tagIndicator}] `);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(20, 20, 20);
          const ptText = pt.text;
          const wrappedPt = doc.splitTextToSize(ptText, 175 - tagWidth);
          doc.text(wrappedPt, marginX + 4 + tagWidth, currentY);
          currentY += (wrappedPt.length * 4) + 3.5;
        });
      } else if (exAnswers.filter(q => q.answer.trim()).length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(150, 150, 150);
        doc.text("Inga specifika observationer registrerade för denna övning.", marginX + 4, currentY);
        currentY += 5;
      }
      currentY += 8;
    });

    renderCategoryDataInPDF("utvardering_spelare", "4. Utvärdering med spelarna");
    renderCategoryDataInPDF("utvardering_tranareteamet", "5. Utvärdering med tränarteamet");
    renderCategoryDataInPDF("efterarbete", "6. Efterarbete");
    renderCategoryDataInPDF("avslutning", "7. Avslutning");

    // Custom sections
    session.customCategories.forEach(customSlug => {
      const prettyTitle = customSlug.replace("custom_", "").replace(/_/g, " ").toUpperCase();
      renderCategoryDataInPDF(customSlug, `Egen Rubrik: ${prettyTitle}`);
    });

    // Save with elegant filename
    const cleanDate = session.date.replace(/-/g, "");
    const cleanTeam = session.team.replace(/\s+/g, "_").substring(0, 12);
    doc.save(`Observation_${cleanTeam}_${cleanDate}.pdf`);
  };

  // State setup utilities
  const addCoachRow = () => {
    if (coaches.length >= 5) {
      alert("Du kan ha max 5 tränare under samma observation.");
      return;
    }
    const newId = `c-${Date.now()}`;
    setCoaches(prev => [...prev, { id: newId, name: "", role: "Assisterande" }]);
  };

  const removeCoachRow = (id: string) => {
    if (coaches.length <= 1) {
      alert("Tränarteamet måste innehålla minst en tränare.");
      return;
    }
    setCoaches(prev => prev.filter(c => c.id !== id));
  };

  const handleCoachNameChange = (id: string, name: string) => {
    setCoaches(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };

  const handleCoachRoleChange = (id: string, role: string) => {
    setCoaches(prev => prev.map(c => c.id === id ? { ...c, role } : c));
  };

  const toggleFootballAction = (action: string) => {
    setSelectedFootballActions(prev => 
      prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]
    );
  };

  return (
    <div className="min-h-screen bg-[#090b11] text-[#f4f4f5] flex flex-col font-sans select-none antialiased">
      {/* HEADER BAR */}
      <header className="sticky top-0 z-50 border-b border-[#252a36] bg-[#0c0f17]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <SefNextGenLogo size={36} className="shrink-0 drop-shadow-md animate-pulse-glow" />
          <div>
            <h1 className="text-base font-display font-semibold tracking-wide text-white uppercase leading-none">
              UPPFÖLJNING AV TRÄNARE
            </h1>
          </div>
        </div>


      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col justify-stretch">
        
        {/* =========================================================================
            VIEW 1: LANDING PAGE / STARTSIDA (Simple, modern, highly polished)
            ========================================================================= */}
        {view === "landing" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-8 items-stretch py-4"
          >
            {/* LEFT CALL TO ACTION CARD */}
            <div className="lg:col-span-7 flex flex-col justify-center items-start space-y-6 bg-gradient-to-b from-[#111624] to-[#0c0f18] p-8 rounded-3xl border border-[#1e2536] shadow-xl relative overflow-hidden">
              {/* Subtle orange glow effect in background */}
              <div className="absolute top-1/4 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-3">
                <SefNextGenLogo size={56} className="drop-shadow-lg" />
              </div>
              
              <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-white leading-tight">
                TRÄNARUTVECKLING I <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400">SVENSK ELITFOTBOLL</span>
              </h2>
              
              <p className="text-sm md:text-base text-gray-400 max-w-lg leading-relaxed">
                ETT DIGITALT ANALYSSTÖD ANPASSAT FÖR FÄLTBRUK UNDER FOTBOLLSTRÄNING PÅ ELITNIVÅ. SPELA IN DINA OBSERVATION OCH TAGGA RELEVANT TRÄNARE, DIREKT VID FOTBOLLSPLANEN. AI HJÄLPER DIG ATT STRUKTURERA ALL DATA OCH EN PDF-RAPPORT GENERERAS DIREKT EFTER TRÄNINGEN INNAN DU FEEDBACKAR TRÄNARNA.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
                <button
                  id="start-new-obs-btn"
                  onClick={() => setView("setup")}
                  className="px-6 py-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <PlusCircle size={18} />
                  <span>STARTA EN NY TRÄNARUPPFÖJNING - UNDER TRÄNING</span>
                </button>
              </div>
            </div>

            {/* RIGHT SIDE: HISTORICAL OBSERVATIONS PANEL */}
            <div className="lg:col-span-5 bg-[#203668] border border-[#2e4370] rounded-3xl p-6 flex flex-col shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="text-[#E94B4F]" size={18} />
                  <h3 className="font-display font-medium text-white text-base uppercase">Tidigare Uppföljningar</h3>
                </div>
                <span className="text-xs bg-[#0e204d] text-[#9ED6E6] border border-[#2e4370] px-2 py-0.5 rounded font-mono font-bold">
                  {savedSessions.length} SPARADE
                </span>
              </div>

              {savedSessions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-[#22293b] rounded-2xl bg-[#0e204d]/50">
                  <div className="p-3 bg-[#0e204d] rounded-full text-zinc-400 mb-3">
                    <HistoryIcon size={24} />
                  </div>
                  <p className="text-xs text-[#B2B2B2] max-w-[240px] leading-relaxed uppercase">
                    Sedan tidigare sparade pass och observationer dyker upp i denna sökbara lista så du kan ladda ner PDF-arkiv igen.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 max-h-[350px] pr-1">
                  {savedSessions.map((s) => (
                    <div 
                      key={s.id}
                      onClick={() => {
                        setViewingPastSession(s);
                        setView("finished");
                      }}
                      className="p-4 bg-[#0e204d] hover:bg-[#15264b] border border-[#2e4370] hover:border-[#9ED6E6]/40 rounded-xl flex items-center justify-between cursor-pointer transition-all gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-[#E94B4F] font-bold">{s.date}</span>
                          <span className="text-[9px] bg-[#203668] text-[#9ED6E6] border border-[#2e4370] px-1.5 py-0.5 rounded font-mono font-bold">
                            {s.matchCycleMDPlus} / {s.matchCycleMDMinus}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-white truncate max-w-[180px]">
                          {s.team}
                        </h4>
                        <p className="text-[11px] text-[#B2B2B2] truncate max-w-[200px]">
                          {s.theme}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Users size={10} className="text-[#9ED6E6]" />
                          <span className="text-[10px] text-[#B2B2B2] truncate font-sans font-medium uppercase">
                            {s.coaches.map(c => c.name || c.role).join(", ")}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGeneratePDF(s);
                          }}
                          className="p-2 bg-[#203668] border border-[#2e4370] hover:bg-[#E94B4F] hover:text-[#0e204d] hover:border-[#E94B4F] text-[#9ED6E6] rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Ladda ner PDF"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={(e) => deleteSession(s.id, e)}
                          className="p-2 bg-[#203668] border border-[#2e4370] hover:bg-[#E94B4F] hover:text-white hover:border-[#E94B4F] text-[#E94B4F] rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Ta bort"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            VIEW 2: SESSIONSINFO SETUP SCREEN (Bild 3 "FYLL I RELEVANTA FÄLT")
            ========================================================================= */}
        {view === "setup" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col space-y-6"
          >
            {/* Header section with back button */}
            <div className="flex items-center justify-between border-b border-[#1e2536] pb-4">
              <button
                onClick={() => setView("landing")}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Tillbaka till startsidan</span>
              </button>
              <h3 className="text-sm font-display font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 uppercase">
                FYLL I RELEVANTA FÄLT
              </h3>
            </div>

            {/* Config panels split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* LEFT COLUMN: THE COACHES PANEL (TRÄNARTEAMET) */}
              <div className="lg:col-span-5 bg-[#0f1320] border border-[#20273b] p-6 rounded-2xl flex flex-col space-y-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-medium text-white text-sm flex items-center gap-1.5">
                      <Users size={16} className="text-orange-500" />
                      <span>TRÄNARTEAMET</span>
                    </h3>
                    <p className="text-[10px] text-gray-400 leading-normal">Minst en tränare krävs för observationer</p>
                  </div>
                  <button
                    onClick={addCoachRow}
                    className="inline-flex items-center gap-1 text-[11px] bg-orange-600/10 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/20 px-2 py-1 rounded transition-all cursor-pointer"
                  >
                    <UserPlus size={11} />
                    <span>Lägg till</span>
                  </button>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-1">
                  {coaches.map((coach, index) => (
                    <div 
                      key={coach.id} 
                      className="p-3 bg-[#151a2d] border border-[#252f47] rounded-xl space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase">
                          Tränare {index + 1}
                        </label>
                        {coaches.length > 1 && (
                          <button
                            onClick={() => removeCoachRow(coach.id)}
                            className="text-gray-500 hover:text-red-400 p-0.5 transition-all cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <input
                          type="text"
                          required
                          value={coach.name}
                          onChange={(e) => handleCoachNameChange(coach.id, e.target.value)}
                          placeholder="Fyll i namn (t.ex. Johan H)"
                          className="col-span-12 bg-[#0c101c] border border-[#293551] text-xs px-2.5 py-2 rounded-lg text-white font-sans focus:outline-none focus:border-orange-500 transition-all font-medium"
                        />
                        <select
                          value={coach.role}
                          onChange={(e) => handleCoachRoleChange(coach.id, e.target.value)}
                          className="col-span-12 bg-[#0c101c] border border-[#293551] text-[11px] px-1.5 py-2 rounded-lg text-gray-300 focus:outline-none focus:border-orange-500 transition-all uppercase"
                        >
                          <option value="Huvudtränare">Huvudtränare</option>
                          <option value="Assisterande">Assisterande</option>
                          <option value="Assisterande inkl fys">Assisterande inkl fys</option>
                          <option value="Assisterande inkl mv">Assisterande inkl mv</option>
                          <option value="Assisterande ink psykologi">Assisterande ink psykologi</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: DETAILED CONFIG FORM */}
              <div className="lg:col-span-7 bg-[#0f1320] border border-[#20273b] p-6 rounded-2xl space-y-5 shadow-sm">
                
                {/* Team & Theme Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-gray-400 flex items-center gap-1 uppercase">
                      <Users size={12} />
                      LAG / GRUPP
                    </label>
                    <input
                      type="text"
                      value={team}
                      onChange={(e) => setTeam(e.target.value)}
                      placeholder="t.ex. Herrlaget U19 (Valfritt)"
                      className="w-full bg-[#0c101c] border border-[#293551] text-xs px-3 py-2.5 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-gray-400 flex items-center gap-1 uppercase">
                      <Layers size={12} />
                      PASSETS TEMA / FOKUS
                    </label>
                    <input
                      type="text"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder="t.ex. Överbelastning på kanterna (Valfritt)"
                      className="w-full bg-[#0c101c] border border-[#293551] text-xs px-3 py-2.5 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>

                {/* Match cycle fields & Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold uppercase">
                      MD+ MATCHCYKEL
                    </label>
                    <select
                      value={matchCycleMDPlus}
                      onChange={(e) => setMatchCycleMDPlus(e.target.value)}
                      className="w-full bg-[#0c101c] border border-[#293551] text-xs px-2 py-2.5 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="Välj M+1 till M+2">Välj M+1 till M+2</option>
                      <option value="M+1">M+1</option>
                      <option value="M+2">M+2</option>
                      <option value="N/A">Ej tillämpligt (N/A)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold uppercase">
                      MD- MATCHCYKEL
                    </label>
                    <select
                      value={matchCycleMDMinus}
                      onChange={(e) => setMatchCycleMDMinus(e.target.value)}
                      className="w-full bg-[#0c101c] border border-[#293551] text-xs px-2 py-2.5 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="Välj M-7 till M-1">Välj M-7 till M-1</option>
                      <option value="M-1">M-1</option>
                      <option value="M-2">M-2</option>
                      <option value="M-3">M-3</option>
                      <option value="M-4">M-4</option>
                      <option value="M-5">M-5</option>
                      <option value="M-6">M-6</option>
                      <option value="M-7">M-7</option>
                      <option value="N/A">Ej tillämpligt (N/A)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 relative" ref={calendarRef}>
                    <label className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 uppercase">
                      <Calendar size={12} />
                      SESSIONSDATUM
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={sessionsDate}
                      onClick={() => {
                        const current = new Date(sessionsDate || Date.now());
                        if (!isNaN(current.getTime())) {
                          setCalendarYear(current.getFullYear());
                          setCalendarMonth(current.getMonth());
                        }
                        setShowCustomCalendar(!showCustomCalendar);
                      }}
                      placeholder="Klicka för att välja..."
                      className="w-full bg-[#0c101c] border border-[#293551] text-xs px-2.5 py-2.5 rounded-lg text-white focus:outline-none focus:border-orange-500 cursor-pointer caret-transparent"
                    />

                    <AnimatePresence>
                      {showCustomCalendar && (() => {
                        const SWEDISH_MONTHS = [
                          "Januari", "Februari", "Mars", "April", "Maj", "Juni",
                          "Juli", "Augusti", "September", "Oktober", "November", "December"
                        ];
                        const SWEDISH_WEEKDAYS = ["Må", "Ti", "On", "To", "Fr", "Lö", "Sö"];

                        const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                        const prevDaysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
                        
                        const rawFirstDay = new Date(calendarYear, calendarMonth, 1).getDay();
                        const startOffset = rawFirstDay === 0 ? 6 : rawFirstDay - 1;

                        const cells = [];
                        
                        for (let i = startOffset - 1; i >= 0; i--) {
                          const d = prevDaysInMonth - i;
                          cells.push({
                            day: d,
                            month: calendarMonth === 0 ? 11 : calendarMonth - 1,
                            year: calendarMonth === 0 ? calendarYear - 1 : calendarYear,
                            isCurrentMonth: false,
                          });
                        }
                        
                        for (let d = 1; d <= daysInMonth; d++) {
                          cells.push({
                            day: d,
                            month: calendarMonth,
                            year: calendarYear,
                            isCurrentMonth: true,
                          });
                        }
                        
                        const totalCellsNeeded = cells.length <= 35 ? 35 : 42;
                        let nextDay = 1;
                        while (cells.length < totalCellsNeeded) {
                          cells.push({
                            day: nextDay++,
                            month: calendarMonth === 11 ? 0 : calendarMonth + 1,
                            year: calendarMonth === 11 ? calendarYear + 1 : calendarYear,
                            isCurrentMonth: false,
                          });
                        }

                        const handlePrevMonth = (e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (calendarMonth === 0) {
                            setCalendarMonth(11);
                            setCalendarYear(prev => prev - 1);
                          } else {
                            setCalendarMonth(prev => prev - 1);
                          }
                        };

                        const handleNextMonth = (e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (calendarMonth === 11) {
                            setCalendarMonth(0);
                            setCalendarYear(prev => prev + 1);
                          } else {
                            setCalendarMonth(prev => prev + 1);
                          }
                        };

                        const handleSelectDate = (year: number, month: number, day: number, e: React.MouseEvent) => {
                          e.stopPropagation();
                          const mm = String(month + 1).padStart(2, '0');
                          const dd = String(day).padStart(2, '0');
                          const dateString = `${year}-${mm}-${dd}`;
                          setSessionsDate(dateString);
                          setShowCustomCalendar(false);
                        };

                        const isDateSelected = (year: number, month: number, day: number) => {
                          const mm = String(month + 1).padStart(2, '0');
                          const dd = String(day).padStart(2, '0');
                          return sessionsDate === `${year}-${mm}-${dd}`;
                        };

                        const isToday = (year: number, month: number, day: number) => {
                          const today = new Date();
                          return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                        };

                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 mt-2 z-[100] w-72 bg-[#0e1220] border-2 border-[#293551] rounded-xl p-4 shadow-xl text-white select-none"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="p-1 hover:bg-[#1a2138] rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer"
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <div className="text-xs font-bold uppercase tracking-wider font-sans text-orange-400">
                                {SWEDISH_MONTHS[calendarMonth]} {calendarYear}
                              </div>
                              <button
                                type="button"
                                onClick={handleNextMonth}
                                className="p-1 hover:bg-[#1a2138] rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center mb-1 pb-1 border-b border-zinc-800">
                              {SWEDISH_WEEKDAYS.map(dayLabel => (
                                <span key={dayLabel} className="text-[9px] font-mono font-bold text-gray-500 uppercase">
                                  {dayLabel}
                                </span>
                              ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center">
                              {cells.map((cell, idx) => {
                                const selected = isDateSelected(cell.year, cell.month, cell.day);
                                const todayCell = isToday(cell.year, cell.month, cell.day);
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={(e) => handleSelectDate(cell.year, cell.month, cell.day, e)}
                                    className={`
                                      py-1.5 text-[10px] font-mono rounded-md transition-all cursor-pointer focus:outline-none
                                      ${cell.isCurrentMonth ? "" : "text-zinc-650 hover:text-zinc-400"}
                                      ${selected 
                                        ? "bg-orange-500 text-white font-extrabold shadow-sm shadow-orange-500/30" 
                                        : todayCell 
                                          ? "bg-zinc-800 text-orange-400 border border-orange-500/30 font-bold"
                                          : cell.isCurrentMonth
                                            ? "hover:bg-[#1a2138] text-zinc-100"
                                            : "hover:bg-[#1a2138] text-zinc-600"
                                      }
                                    `}
                                  >
                                    {cell.day}
                                  </button>
                                );
                              })}
                            </div>

                            <div className="mt-3 pt-2 border-t border-zinc-800 flex justify-between items-center text-[10px]">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const today = new Date();
                                  const mm = String(today.getMonth() + 1).padStart(2, '0');
                                  const dd = String(today.getDate()).padStart(2, '0');
                                  setSessionsDate(`${today.getFullYear()}-${mm}-${dd}`);
                                  setCalendarMonth(today.getMonth());
                                  setCalendarYear(today.getFullYear());
                                  setShowCustomCalendar(false);
                                }}
                                className="text-orange-400 hover:text-orange-350 cursor-pointer uppercase font-sans font-bold tracking-wider"
                              >
                                Idag (Today)
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowCustomCalendar(false);
                                }}
                                className="text-zinc-400 hover:text-zinc-300 cursor-pointer uppercase font-sans"
                              >
                                Stäng (Close)
                              </button>
                            </div>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Number of exercises */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 uppercase">
                    <Activity size={12} />
                    ANTAL ÖVNINGAR I PASSET
                  </label>
                  <select
                    value={numExercises}
                    onChange={(e) => setNumExercises(parseInt(e.target.value))}
                    className="w-full bg-[#0c101c] border border-[#293551] text-xs px-3 py-2.5 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'övning' : 'övningar'}</option>
                    ))}
                  </select>
                </div>

                {/* Football Theme checkboxes tag cloud */}
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase">
                    FOTBOLLSAKTION (FLERA VAL ÄR MÖJLIGA)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FOOTBALL_ACTION_THEMES.map(themeItem => {
                      const isActive = selectedFootballActions.includes(themeItem);
                      return (
                        <button
                          key={themeItem}
                          onClick={() => toggleFootballAction(themeItem)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-orange-600 border-orange-500 text-white shadow-md shadow-orange-600/20' 
                              : 'bg-[#151a29] border-[#252f47] text-gray-400 hover:text-white hover:border-gray-500'
                          }`}
                        >
                          {themeItem}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Physiological Load computations */}
                <div className="pt-3 border-t border-[#1e2536] space-y-4">
                  <h4 className="text-[10px] text-orange-500 font-semibold uppercase">PLANERAD BELASTNING</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#0b0e16] border border-[#202737] rounded-xl flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-gray-400">PLANERAD TRÖTTHET (RPE)</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold font-display text-white">{plannedRPE}</span>
                          <span className="text-xs text-gray-500">/ 10</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={plannedRPE}
                        onChange={(e) => setPlannedRPE(parseInt(e.target.value))}
                        className="w-1/2 accent-orange-600"
                      />
                    </div>

                    <div className="p-4 bg-[#0b0e16] border border-[#202737] rounded-xl flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-gray-400">PLANERAD TOTALTID (MIN)</span>
                        <input
                          type="number"
                          value={plannedDuration}
                          onChange={(e) => setPlannedDuration(parseInt(e.target.value) || 0)}
                          className="w-16 bg-[#101422] border border-[#242e47] rounded-lg px-2 py-1 text-sm text-center font-bold font-display text-white"
                        />
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="text-[8px] font-mono text-gray-500 block uppercase">TOTAL BELASTNING</span>
                        <span className="text-sm font-bold font-display text-orange-500">
                          {plannedRPE * plannedDuration} <span className="text-[10.5px] text-gray-400 font-mono">RPE*min</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Launch observation session */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-4 border-t border-[#1e2536]">
              <button
                type="button"
                onClick={handleResetToLanding}
                className="px-5 py-3 border border-[#E94B4F]/40 bg-[#0e204d]/40 text-[#E94B4F] hover:bg-[#E94B4F] hover:text-[#0e204d] hover:border-[#E94B4F] font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
              >
                <X size={15} />
                <span>Avsluta utan att spara</span>
              </button>
              <button
                id="join-observation-btn"
                onClick={initializeSession}
                className="px-8 py-4 bg-orange-600 text-white font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-orange-500 shadow-lg shadow-orange-600/30 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <Play size={16} />
                <span>STARTA OBSERVATION</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            VIEW 3: CORE WORKFLOW / ACTIVE OBSERVATION VIEW (Bild 4 checklist questions)
            ========================================================================= */}
        {view === "observation" && (
          <div className="flex-1 flex flex-col space-y-6">
            
            {/* Horizontal flow pills for categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#1f2638]">
              <button
                onClick={() => setActiveTab("planering")}
                className={`flex-none text-xs px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === "planering" 
                    ? "bg-zinc-700 text-white border border-zinc-600 shadow-md" 
                    : "bg-[#101422] text-gray-400 hover:text-white"
                }`}
              >
                1. Planering
              </button>

              <button
                onClick={() => setActiveTab("inramning")}
                className={`flex-none text-xs px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === "inramning" 
                    ? "bg-zinc-700 text-white border border-zinc-600 shadow-md" 
                    : "bg-[#101422] text-gray-400 hover:text-white"
                }`}
              >
                2. Inramning
              </button>

              <button
                onClick={() => {
                  setActiveTab("genomforande");
                  // reset default exercise page to first if invalid
                  if (activeExerciseIndex >= exercises.length) {
                    setActiveExerciseIndex(0);
                  }
                }}
                className={`flex-none text-xs px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === "genomforande" 
                    ? "bg-zinc-700 text-white border border-zinc-600 shadow-md" 
                    : "bg-[#101422] text-gray-400 hover:text-white"
                }`}
              >
                3. Genomförande
              </button>

              <button
                onClick={() => setActiveTab("utvardering_spelare")}
                className={`flex-none text-xs px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === "utvardering_spelare" 
                    ? "bg-zinc-700 text-white border border-zinc-600 shadow-md" 
                    : "bg-[#101422] text-gray-400 hover:text-white"
                }`}
              >
                4. Utvärdering Spelare
              </button>

              <button
                onClick={() => setActiveTab("utvardering_tranareteamet")}
                className={`flex-none text-xs px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === "utvardering_tranareteamet" 
                    ? "bg-zinc-700 text-white border border-zinc-600 shadow-md" 
                    : "bg-[#101422] text-gray-400 hover:text-white"
                }`}
              >
                5. Utvärdering Tränare
              </button>

              <button
                onClick={() => setActiveTab("efterarbete")}
                className={`flex-none text-xs px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === "efterarbete" 
                    ? "bg-zinc-700 text-white border border-zinc-600 shadow-md" 
                    : "bg-[#101422] text-gray-400 hover:text-white"
                }`}
              >
                6. Efterarbete
              </button>

              <button
                onClick={() => setActiveTab("avslutning")}
                className={`flex-none text-xs px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === "avslutning" 
                    ? "bg-zinc-700 text-white border border-zinc-600 shadow-md" 
                    : "bg-[#101422] text-gray-400 hover:text-white"
                }`}
              >
                7. Avslutning
              </button>

              {customCategories.map((slug) => {
                const prettyLabel = slug.replace("custom_", "").replace(/_/g, " ");
                return (
                  <button
                    key={slug}
                    onClick={() => setActiveTab(slug)}
                    className={`flex-none text-xs px-4 py-2.5 rounded-lg font-medium transition-all capitalize cursor-pointer ${
                      activeTab === slug 
                        ? "bg-zinc-700 text-white border border-zinc-600 shadow-md" 
                        : "bg-[#101422] text-gray-400 hover:text-white"
                    }`}
                  >
                    {prettyLabel}
                  </button>
                );
              })}

              <button
                onClick={handleAddCustomCategory}
                className="flex-none text-xs px-3 py-2 bg-gray-900 border border-dashed border-gray-700 text-gray-400 hover:text-white rounded-lg inline-flex items-center gap-1 cursor-pointer transition-all"
              >
                <Plus size={14} />
                <span>Egen rubrik</span>
              </button>
            </div>

            {/* If inside "Genomförande" (Exercise list nested) */}
            {activeTab === "genomforande" && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none bg-[#111624]/60 p-2 rounded-xl border border-[#20283c]">
                <div className="text-[10px] text-gray-400 font-mono font-semibold uppercase pr-2 pl-1">
                  Övningsfokus:
                </div>
                {exercises.map((ex, idx) => (
                  <div key={ex.id} className="flex-none flex items-center">
                    <button
                      onClick={() => setActiveExerciseIndex(idx)}
                      className={`text-xs px-3.5 py-2.5 rounded-lg font-medium font-display transition-all cursor-pointer ${
                        activeExerciseIndex === idx
                          ? "bg-zinc-700/40 border border-zinc-500 text-zinc-100 font-bold"
                          : "bg-gray-900/60 border border-transparent text-gray-400 hover:text-white hover:border-gray-800"
                      }`}
                    >
                      {ex.title}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* THREE-COLUMN BENTO GRID FOR OBSERVATION WORKPLACE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* LAYOUT LEFT/CENTER: QUESTIONS ANSWER FIELD (CHECKLISTA) */}
              <div className="lg:col-span-8 bg-zinc-900 border-2 border-zinc-700 rounded-xl p-6 flex flex-col shadow-lg space-y-4 text-zinc-100">
                
                {/* Section title & custom modifying tools (Matching Bild 5) */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden flex flex-col sm:flex-row items-stretch sm:items-center justify-end border-zinc-700 gap-4 ${
                  scrolledDown 
                    ? "max-h-0 opacity-0 pb-0 border-b-0 mb-0 pointer-events-none" 
                    : "max-h-[56px] opacity-100 pb-4 border-b-2"
                }`}>

                  {/* Right: MODIFIERA CHECKLISTAN Banner Button */}
                  <button
                    onClick={() => setIsEditingChecklist(!isEditingChecklist)}
                    id="modify-checklist-btn"
                    className={`border-2 font-display font-bold text-xs px-4 py-2.5 tracking-wider transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none uppercase ${
                      isEditingChecklist
                        ? "border-emerald-600 bg-emerald-950 text-emerald-200 hover:bg-emerald-900 shadow-[2px_2px_0px_0px_rgba(16,185,129,1)] hover:scale-[1.01]"
                        : "border-zinc-750 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]"
                    }`}
                  >
                    {isEditingChecklist ? "KLAR (SPARA ÄNDRINGAR)" : "MODIFIERA CHECKLISTAN"}
                  </button>
                </div>

                {/* Sub-exercise specific focus parameter input info */}
                {activeTab === "genomforande" && exercises[activeExerciseIndex] && (
                  <div className="p-3 bg-zinc-800 border-2 border-zinc-750 rounded space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 font-mono tracking-wider uppercase block">
                      ÖVNINGENS TEMAFOKUS / RIKTLINJER:
                    </label>
                    <input
                      type="text"
                      value={exercises[activeExerciseIndex].focus}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExercises(prev => prev.map((ex, i) => i === activeExerciseIndex ? { ...ex, focus: val } : ex));
                      }}
                      placeholder="Skriv in övningens mål..."
                      className="w-full bg-zinc-900 border border-zinc-700 text-xs px-2.5 py-1.5 text-zinc-200 font-sans focus:outline-none focus:border-zinc-550"
                    />
                  </div>
                )}

                {/* Checklist Title Grey Banner */}
                <div className={`bg-zinc-800 text-zinc-300 font-display font-bold text-xs uppercase tracking-widest px-4 border-zinc-700 shadow-sm flex items-center justify-between transition-all duration-300 ease-in-out overflow-hidden ${
                  scrolledDown 
                    ? "max-h-0 opacity-0 py-0 border-y-0 pointer-events-none" 
                    : "max-h-[46px] py-2.5 border-y"
                }`}>
                  <span>CHECKLISTA</span>
                  {isEditingChecklist && (
                    <button
                      onClick={() => {
                        const newQ: ChecklistQuestion = {
                          id: `custom-q-${Date.now()}`,
                          category: activeTab,
                          exerciseId: activeTab === "genomforande" ? exercises[activeExerciseIndex]?.id : undefined,
                          question: "NY OBSERVATIONSPUNKT",
                          answer: ""
                        };
                        setChecklist(prev => [...prev, newQ]);
                      }}
                      className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-[10px] font-bold text-white rounded cursor-pointer transition-all uppercase"
                    >
                      + LÄGG TILL OBSERVATIONSRUTA
                    </button>
                  )}
                </div>

                {/* Checklist answers areas mapped with assignable coaches */}
                <div className="flex-1 space-y-6 pr-1">
                  {isEditingChecklist && (
                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] tracking-wider font-extrabold text-zinc-400 uppercase font-mono">
                          🔧 REDIGERINGSVÄRDEAKTIVERAD
                        </span>
                        <button
                          onClick={() => {
                            const newQ: ChecklistQuestion = {
                              id: `custom-q-${Date.now()}`,
                              category: activeTab,
                              exerciseId: activeTab === "genomforande" ? exercises[activeExerciseIndex]?.id : undefined,
                              question: "NY OBSERVATIONSPUNKT",
                              answer: ""
                            };
                            setChecklist(prev => [...prev, newQ]);
                          }}
                          className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-[10px] text-emerald-200 font-bold border border-emerald-750 rounded uppercase"
                        >
                          + LÄGG TILL FÄLT
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-400">
                        Du kan ändra frågetexten direkt i fälten nedan. Klicka på papperskorgen för att radera hela observationsrutan.
                      </p>
                    </div>
                  )}

                  {activeChecklistQuestions.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center space-y-2">
                      <p className="text-xs">Det finns inga frågor i denna checklista ännu.</p>
                      <button
                        onClick={() => {
                          const newQ: ChecklistQuestion = {
                            id: `custom-q-${Date.now()}`,
                            category: activeTab,
                            exerciseId: activeTab === "genomforande" ? exercises[activeExerciseIndex]?.id : undefined,
                            question: "NY OBSERVATIONSPUNKT",
                            answer: ""
                          };
                          setChecklist(prev => [...prev, newQ]);
                          setIsEditingChecklist(true);
                        }}
                        className="text-xs font-semibold text-zinc-500 hover:text-zinc-200 hover:underline cursor-pointer"
                      >
                        + Lägg till en första fråga
                      </button>
                    </div>
                  ) : (
                    activeChecklistQuestions.map((item) => {
                      const assignedCoach = coaches.find(c => c.id === item.coachId);
                      return (
                        <div key={item.id} className="space-y-2">
                          {isEditingChecklist ? (
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-550 text-xs font-mono select-none">•</span>
                              <input
                                type="text"
                                value={item.question}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setChecklist(prev => prev.map(q => q.id === item.id ? { ...q, question: val } : q));
                                }}
                                className="flex-1 bg-zinc-950 border border-zinc-600 rounded px-2.5 py-1.5 text-xs text-zinc-100 font-sans font-bold uppercase focus:outline-none focus:border-zinc-400"
                              />
                              <button
                                onClick={() => {
                                  if (confirm("Är du säker på att du vill ta bort den här rutan?")) {
                                    setChecklist(prev => prev.filter(q => q.id !== item.id));
                                  }
                                }}
                                className="p-1.5 bg-red-950/50 text-red-400 hover:bg-red-900 border border-red-800 rounded text-xs cursor-pointer"
                                title="Ta bort ifylld punkt"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ) : (
                            <label className="text-xs font-sans font-bold text-zinc-200 tracking-wide uppercase leading-normal block">
                              • {item.question}
                            </label>
                          )}
                          
                          <div className="flex flex-col space-y-1.5">
                            <div className="flex items-stretch gap-3">
                              {/* Text Input area with dark border */}
                              <textarea
                                rows={2}
                                value={item.answer}
                                onChange={(e) => handleUpdateChecklistAnswer(item.id, e.target.value)}
                                placeholder="Fyll i observation / svar här..."
                                className="flex-1 bg-zinc-950 border-2 border-zinc-700 text-xs p-3 text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-zinc-550 transition-all font-sans leading-relaxed resize-none shadow-sm"
                              />

                              {/* Microphone voice note recording button */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (recordingQuestionId === item.id) {
                                    stopChecklistRecording();
                                  } else {
                                    startChecklistRecording(item.id);
                                  }
                                }}
                                className={`w-[44px] flex-none border-2 flex flex-col items-center justify-center gap-1 transition-all rounded shadow-sm cursor-pointer active:scale-95 ${
                                  recordingQuestionId === item.id
                                    ? "bg-red-900 border-red-500 text-red-100 animate-pulse"
                                    : item.audioUrl
                                      ? "bg-zinc-850 border-orange-700 text-orange-500 hover:bg-zinc-800"
                                      : "bg-zinc-800 border-zinc-650 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                                }`}
                                title={recordingQuestionId === item.id ? "Sluta spela in röstmemo" : "Spela in röstmemo under detta fält"}
                              >
                                <Mic size={15} className={recordingQuestionId === item.id ? "animate-bounce" : ""} />
                                {recordingQuestionId === item.id ? (
                                  <span className="text-[8px] font-mono font-bold text-red-200">
                                    {checklistRecordDuration}s
                                  </span>
                                ) : item.audioUrl ? (
                                  <span className="text-[7.5px] font-mono leading-none tracking-widest text-orange-400 font-extrabold uppercase">
                                    SPARAD
                                  </span>
                                ) : (
                                  <span className="text-[7.5px] font-mono leading-none text-zinc-400 uppercase">
                                    RÖST
                                  </span>
                                )}
                              </button>

                              {/* Coach selection select element matches style of Bild 5 button */}
                              <div className="w-[110px] flex-none relative">
                                <select
                                  value={item.coachId || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setChecklist(prev => prev.map(q => q.id === item.id ? { ...q, coachId: val } : q));
                                  }}
                                  className="w-full h-full bg-zinc-800 border-2 border-zinc-650 text-zinc-200 font-sans text-[9px] leading-tight uppercase font-bold text-center p-1.5 cursor-pointer hover:bg-zinc-700 focus:outline-none focus:ring-0 shadow-sm appearance-none flex items-center justify-center whitespace-normal"
                                  style={{ textAlignLast: "center" }}
                                >
                                  <option value="">TRÄNARE SOM RESPEKTIVE ANTECKNING GÄLLER</option>
                                  <option value="allmant">ALLMÄNT (INGEN SPECIFIK)</option>
                                  <option value="coachutvecklare">COACHUTVECKLARE (EGNA)</option>
                                  {coaches.map((c, i) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name ? `${c.name.substring(0, 15).toUpperCase()} (${c.role.substring(0, 3).toUpperCase()})` : `TRÄNARE ${i + 1} (${c.role.toUpperCase()})`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Render local audio note if captured */}
                            {item.audioUrl && (
                              <div className="flex items-center gap-2 bg-zinc-950 p-2 border border-zinc-850 rounded-lg">
                                <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase shrink-0 pl-1">
                                  🎙️ Röstmemo:
                                </span>
                                <audio src={item.audioUrl} controls className="h-8 max-w-xs flex-grow focus:outline-none opacity-80" />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteChecklistAudio(item.id)}
                                  className="p-1 px-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1"
                                  title="Ta bort röstmemo"
                                >
                                  <Trash2 size={12} />
                                  <span className="text-[10px]">Ta bort</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* PDF Export Shortcut Button on Avslutning (Swedish: Exportera observationen till PDF) */}
                {activeTab === "avslutning" && (
                  <div className="pt-4 border-t-2 border-zinc-800 mt-4 flex items-center justify-start">
                    <button
                      onClick={() => handleGeneratePDF(compileSession())}
                      className="border-2 border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 font-display font-bold text-xs px-5 py-3 tracking-wider transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none uppercase"
                    >
                      EXPORTERA OBSERVATIONEN TILL PDF
                    </button>
                  </div>
                )}

                {/* BOLL I SPEL TIMING CONTROLLER (Swedish: Boll i spel) */}
                {activeTab === "genomforande" && exercises[activeExerciseIndex] && (
                  <div className="pt-4 border-t-2 border-zinc-800 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-850 p-4 rounded-xl">
                    <div className="flex flex-col space-y-0.5 text-zinc-200">
                      <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 tracking-wider">
                        Aktiv Speltid (Boll i spel)
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold font-mono text-zinc-100">
                          {(() => {
                            const secs = exercises[activeExerciseIndex].ballInPlaySeconds || 0;
                            const m = Math.floor(secs / 60);
                            const s = secs % 60;
                            return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
                          })()}
                        </span>
                        <span className="text-xs font-semibold text-zinc-400">
                          {(() => {
                            const secs = exercises[activeExerciseIndex].ballInPlaySeconds || 0;
                            const pct = plannedDuration > 0 
                              ? ((secs / (plannedDuration * 60)) * 100).toFixed(1) 
                              : "0.0";
                            return `(${pct}% av totalträningen ${plannedDuration} min)`;
                          })()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsBallInPlayActive(!isBallInPlayActive)}
                      className={`inline-flex items-center gap-2 border-2 border-zinc-700 text-white font-sans text-xs font-bold px-6 py-3 tracking-wider rounded transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                        isBallInPlayActive 
                          ? "bg-red-800 hover:bg-red-700" 
                          : "bg-zinc-800 hover:bg-zinc-700"
                      }`}
                    >
                      {isBallInPlayActive ? (
                        <>
                          <Square size={13} fill="currentColor" />
                          <span>Stoppa: Boll i spel</span>
                        </>
                      ) : (
                        <>
                          <Play size={13} fill="currentColor" />
                          <span>Starta: Boll i spel</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

              </div>

              {/* LAYOUT RIGHT STACK: COMENT FEED & THE MIC CAPTURE WIDGET */}
              <div className="lg:col-span-4 flex flex-col gap-6 ">
                
                {/* Visual TAGGAR panel with Level 1 & 2 tagging engine (Swedish coach tagger) */}
                {activeTab !== "planering" && activeTab !== "utvardering_tranareteamet" && activeTab !== "efterarbete" && (
                  <div className="bg-zinc-900 border-2 border-zinc-700 rounded-xl p-6 flex flex-col space-y-5 shadow-lg flex-1 text-zinc-100">
                    <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-800">
                      <span className="text-sm font-display font-medium text-zinc-100 flex items-center gap-2 tracking-wide">
                        <Tag size={15} className="text-zinc-400" />
                        <span>Taggpanel</span>
                      </span>
                      <button
                        onClick={() => setIsEditingTags(!isEditingTags)}
                        className={`border-2 font-display font-bold text-[10px] px-3.5 py-2 tracking-wider transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none uppercase ${
                          isEditingTags
                            ? "border-[#ff7a30] bg-orange-950/40 text-[#ff7a30] hover:bg-orange-955 shadow-[2px_2px_0px_0px_rgba(255,122,48,1)] hover:scale-[1.01]"
                            : "border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]"
                        }`}
                      >
                        {isEditingTags ? "KLAR (SPARA ÄNDRINGAR)" : "ÄNDRA TAGGPANELEN"}
                      </button>
                    </div>

                    <div className="grid grid-cols-12 gap-4 flex-1">
                      {/* Left: NIVÅ 1 (Coaches stack) */}
                      <div className="col-span-5 flex flex-col space-y-2">
                        <span className="text-[11px] font-display font-extrabold text-center text-zinc-400 uppercase tracking-widest block mb-1">
                          VÄLJ TRÄNARE FÖRST
                        </span>
                        {Array.from({ length: 5 }).map((_, idx) => {
                          const c = coaches[idx];
                          const isDefined = !!c;
                          const isCurrentTag = isDefined ? activeTag === c.id : false;
                          
                          return (
                            <button
                              key={isDefined ? c.id : `tag-col1-coach-${idx}`}
                              onClick={() => {
                                if (isDefined) {
                                  setActiveTag(c.id);
                                }
                              }}
                              disabled={!isDefined || isEditingTags}
                              className={`px-2 py-3 border text-[11px] uppercase font-bold tracking-wider rounded-lg text-center transition-all ${
                                !isDefined
                                  ? "bg-zinc-950 border-zinc-800 text-zinc-600 opacity-40 cursor-not-allowed"
                                  : isCurrentTag
                                    ? "bg-[#ff7a30] border-2 border-zinc-300 text-white font-black shadow-sm cursor-pointer"
                                    : "bg-zinc-800 border border-zinc-700 text-zinc-350 hover:bg-zinc-750 cursor-pointer"
                              }`}
                            >
                              {isDefined ? (c.name ? `${c.name.substring(0, 10).toUpperCase()}` : `TRÄNARE ${idx + 1}`) : `TRÄNARE ${idx + 1}`}
                            </button>
                          );
                        })}
                      </div>

                      {/* Right: NIVÅ 2 (Behavior Tags) */}
                      <div className="col-span-7 flex flex-col space-y-2">
                        <span className="text-[11px] font-display font-extrabold text-center text-zinc-400 uppercase tracking-widest block mb-1">
                          TRÄNARAKTION
                        </span>
                        
                        {isEditingTags && (
                          <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col space-y-2 text-xs mb-1">
                            <span className="text-[10px] tracking-wider font-extrabold text-zinc-400 uppercase font-mono">
                              🔧 REDIGERING BETEENDEN
                            </span>
                            <button
                              onClick={() => {
                                setBehaviorTags(prev => [...prev, "NY TAGG"]);
                              }}
                              className="w-full py-1.5 bg-[#ff7a30] hover:bg-[#e06626] text-white font-bold text-[10px] rounded uppercase text-center cursor-pointer transition-all border border-[#e06626]"
                            >
                              + LÄGG TILL NY TAGG
                            </button>
                          </div>
                        )}

                        {behaviorTags.map((tagText, idx) => (
                          <div key={idx} className="w-full flex items-center gap-2">
                            {isEditingTags ? (
                              <>
                                <input
                                  type="text"
                                  value={tagText}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setBehaviorTags(prev => prev.map((t, tIdx) => tIdx === idx ? val : t));
                                  }}
                                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 font-sans font-bold uppercase focus:outline-none focus:border-zinc-550 min-w-0"
                                />
                                <button
                                  onClick={() => setTagToDeleteIndex(idx)}
                                  className="p-2 bg-red-950/50 text-red-400 hover:bg-red-900 border border-red-800 rounded text-xs cursor-pointer flex-none"
                                  title="Ta bort tagg"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleTriggerBehaviorTag(tagText)}
                                className="w-full text-left bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-zinc-500 text-zinc-200 font-sans font-bold text-[11px] px-3.5 py-2.5 rounded-lg transition-all active:scale-[0.98] cursor-pointer shadow-sm"
                              >
                                {tagText}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* LOWER COMPONENT: VOICE CAPTURE & VERTICAL COACH STACK CO-INTEGRATED (Exactly like Bild 5) */}
                <div className="flex items-stretch justify-end gap-3.5 w-full bg-[#151a2d]/30 border border-[#232938] p-4 rounded-2xl">
                  
                  {/* Left Column in container: Verticalstack of Coach Selector buttons */}
                  <div className="flex flex-col gap-1.5 justify-between flex-1">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const c = coaches[idx];
                      const isDefined = !!c;
                      const isCurrentTag = isDefined ? activeTag === c.id : false;
                      
                      return (
                        <button
                          key={isDefined ? c.id : `placeholder-coach-${idx}`}
                          onClick={() => {
                            if (isDefined) {
                              setActiveTag(c.id);
                            }
                          }}
                          disabled={!isDefined}
                          className={`px-2.5 py-2 border text-[9px] uppercase font-bold tracking-wider rounded text-center transition-all flex-1 flex items-center justify-center ${
                            !isDefined
                              ? "bg-slate-800/40 border-slate-700/50 text-slate-500 opacity-60 cursor-not-allowed"
                              : isCurrentTag
                                ? "bg-[#ff7a30] border-[#ff7a30] text-white font-extrabold shadow-md"
                                : "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 cursor-pointer"
                          }`}
                        >
                          {isDefined ? (c.name ? `${c.name.substring(0, 10)} (${c.role.substring(0,3)})` : `TRÄNARE ${idx + 1}`) : `TRÄNARE ${idx + 1}`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column in container: Solid black Voice Recording widget */}
                  <div className="bg-[#0c101c] border-2 border-slate-800 text-zinc-100 rounded-xl p-4 flex flex-col items-center justify-between w-[170px] h-52 shadow-2xl relative flex-none">
                    
                    {/* Glowing digital time timer */}
                    <div className="text-center">
                      <span className="font-mono text-xl text-emerald-400 font-extrabold block tracking-widest drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                        {isRecording 
                          ? `00:${recordDuration < 10 ? '0' + recordDuration : recordDuration}` 
                          : "00:00"}
                      </span>
                    </div>

                    {/* Instruction helper text */}
                    <p className="text-[8.5px] text-zinc-400 text-center leading-normal px-0.5">
                      Klicka nedan för att spela in muntliga observationsanteckningar på svenska.
                    </p>

                    {/* Green Starta Inspelning Pill Button */}
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isTranscribing}
                      className={`w-full py-2 px-3 rounded-full flex items-center justify-center gap-1 text-[9px] tracking-wider font-bold uppercase transition-all shadow-md cursor-pointer ${
                        isTranscribing 
                          ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                          : isRecording 
                            ? "bg-red-600 hover:bg-red-500 text-white" 
                            : "bg-[#059669] hover:bg-[#10b981] text-white"
                      }`}
                    >
                      {isTranscribing ? (
                        <div className="w-3 h-3 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      ) : isRecording ? (
                        <>
                          <Square size={10} fill="white" />
                          <span>STOPPA</span>
                        </>
                      ) : (
                        <>
                          <Mic size={10} />
                          <span>STARTA INSPELNING</span>
                        </>
                      )}
                    </button>

                    {recordingError && (
                      <span className="text-[8px] text-red-400 text-center absolute bottom-1 font-semibold leading-none">
                        Fel mikrofon
                      </span>
                    )}
                  </div>

                </div>

              </div>

            </div>

            {/* Float Navigation steps bottom controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t-2 border-zinc-700 mt-6 gap-4">
              <span className="text-xs text-zinc-400 font-sans">
                Gå till andra kategorier i fältet via flikarna överst under passets gång. Alla anteckningar sparas löpande.
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleResetToLanding}
                  className="w-full sm:w-auto px-5 py-3 border border-[#E94B4F]/40 bg-[#0e204d]/40 text-[#E94B4F] hover:bg-[#E94B4F] hover:text-[#0e204d] hover:border-[#E94B4F] font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <X size={15} />
                  <span>Avsluta utan att spara</span>
                </button>
                <button
                  onClick={handleFinishSession}
                  id="finish-bottom-btn"
                  className="w-full sm:w-auto px-6 py-3.5 bg-orange-600 text-white font-display font-bold hover:bg-orange-500 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/35 transition-all cursor-pointer active:scale-95 uppercase tracking-wider font-sans whitespace-nowrap"
                >
                  <CheckCircle2 size={16} />
                  <span>Avsluta & se analysrapport</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 4: PREVIEW ARCHIVED REPORT (FINISHED OBSERVATION / SLUTRAPPORT)
            ========================================================================= */}
        {view === "finished" && viewingPastSession && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col space-y-6"
          >
            {/* Header with back controls */}
            <div className="flex items-center justify-between border-b border-[#20273a] pb-4">
              <button
                onClick={handleGoBackFromFinished}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white cursor-pointer uppercase font-semibold"
              >
                <ArrowLeft size={14} />
                <span>TILLBAKA</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToLanding}
                  className="px-3.5 py-2 bg-[#121824] hover:bg-[#1a2135] text-gray-300 hover:text-white border border-[#232d47] font-semibold text-xs rounded-lg shadow-sm inline-flex items-center gap-1.5 cursor-pointer transition-all uppercase"
                >
                  <PlusCircle size={13} className="text-orange-500" />
                  <span>Börja om (Ny observation)</span>
                </button>
                <button
                  onClick={() => handleGeneratePDF(viewingPastSession)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold text-xs rounded-lg shadow-md shadow-orange-600/20 hover:brightness-110 inline-flex items-center gap-1.5 cursor-pointer font-sans"
                >
                  <Download size={13} />
                  <span>Skapa & ladda ner PDF</span>
                </button>
              </div>
            </div>

            {/* Complete preview layout sheet */}
            <div id="full-analysis-sheet" className="p-6 md:p-8 bg-[#0e121d] border border-[#1d2334] rounded-3xl space-y-8 shadow-xl max-w-4xl mx-auto w-full">
              
              {/* Document Header banner */}
              <div className="pb-6 border-b border-[#20273b] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                  <SefNextGenLogo size={52} className="shrink-0 drop-shadow" />
                  <div>
                    <span className="text-[10px] font-mono text-orange-500 tracking-widest font-semibold uppercase block">
                      ELITFOTBOLL ANALYS- OCH OBSERVATIONSRAPPORT
                    </span>
                    <h3 className="text-xl md:text-2xl font-display font-bold text-white mt-1">
                      {viewingPastSession.team} — {viewingPastSession.theme}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar size={12} className="text-gray-500" />
                      <span className="text-xs text-gray-400">{viewingPastSession.date}</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-[#151a29] border border-[#222a3d] rounded-2xl text-center md:text-right">
                  <span className="text-[9px] text-gray-500 font-mono uppercase block">Total Belastning</span>
                  <span className="text-base font-bold font-display text-orange-500">
                    {viewingPastSession.plannedLoad} <span className="text-xs text-gray-400 font-mono">RPE*min</span>
                  </span>
                </div>
              </div>

              {/* Sessions Details Summary Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#141a29]/60 rounded-2xl border border-[#20283c]">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-550 font-semibold text-gray-400 block">MD+ MATCHCYKEL</span>
                  <span className="text-xs font-semibold text-white">{viewingPastSession.matchCycleMDPlus}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-550 font-semibold text-gray-400 block">MD- MATCHCYKEL</span>
                  <span className="text-xs font-semibold text-white">{viewingPastSession.matchCycleMDMinus}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-550 font-semibold text-gray-400 block">RPE-VÄRDE (TRÖTTHET)</span>
                  <span className="text-xs font-semibold text-orange-400">{viewingPastSession.plannedRPE} / 10</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-550 font-semibold text-gray-400 block">PLANERAD TOTALTID</span>
                  <span className="text-xs font-semibold text-white">{viewingPastSession.plannedDuration} min</span>
                </div>
              </div>

              {/* Total Active play stats */}
              {(() => {
                const totalSecs = viewingPastSession.exercises.reduce((sum, curr) => sum + (curr.ballInPlaySeconds || 0), 0);
                const totalPct = viewingPastSession.plannedDuration > 0 
                  ? ((totalSecs / (viewingPastSession.plannedDuration * 60)) * 100).toFixed(1) 
                  : "0.0";
                const mins = Math.floor(totalSecs / 60);
                const secs = totalSecs % 60;
                return (
                  <div className="p-4 bg-[#101726] border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Total mätt speltid (Boll i spel):</span>
                    </div>
                    <span className="text-sm font-bold text-[#34d399] font-mono">
                      {mins} min {secs} sek <span className="text-xs text-gray-400">({totalPct}% av planerad totaltid {viewingPastSession.plannedDuration} min)</span>
                    </span>
                  </div>
                );
              })()}

              {/* Football action focal points */}
              {viewingPastSession.footballActions && viewingPastSession.footballActions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold text-gray-450 uppercase tracking-wider text-gray-400">
                    Fokusområden (Fotbollsaktioner):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingPastSession.footballActions.map(action => (
                      <span key={action} className="text-xs px-2.5 py-1 bg-orange-600/10 border border-orange-500/20 text-orange-400 rounded-lg font-medium font-display shadow-sm">
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Coaches List Section */}
              <div className="space-y-3">
                <h4 className="text-[10px] text-orange-500 font-mono tracking-widest uppercase font-semibold">
                  TRÄNARTEAM UNDER OBSERVATION
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {viewingPastSession.coaches.map((c, i) => (
                    <div key={c.id || i} className="p-3 bg-[#111522] border border-[#1f273b] rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-600/10 border border-orange-500/20 text-orange-500 font-extrabold flex items-center justify-center text-xs">
                        {c.name ? c.name[0]?.toUpperCase() : "T"}
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-white">{c.name || `Tränare ${i + 1}`}</h5>
                        <p className="text-[10px] text-gray-500">Roll: {c.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Categorized structured sections */}
              <div className="space-y-8 pt-4">
                
                {/* 1. Planering */}
                {renderRenderedSectionSummary(viewingPastSession, "planering", "1. Planering (Före passet)")}

                {/* 2. Inramning */}
                {renderRenderedSectionSummary(viewingPastSession, "inramning", "2. Inramning (Presentation)")}

                {/* 3. Exercises under genomförande dynamically rendered */}
                <div className="space-y-6">
                  <h4 className="text-xs text-orange-500 font-mono tracking-widest font-bold uppercase border-b border-[#232d3d] pb-1">
                    3. Genomförande (Aktiva fotbollsövningar)
                  </h4>
                  {viewingPastSession.exercises.map((ex, exIdx) => {
                    const exAnswers = viewingPastSession.checklistAnswers.filter(q => q.category === "genomforande" && q.exerciseId === ex.id);
                    const exPoints = viewingPastSession.customObservations.filter(p => p.category === "genomforande" && p.exerciseId === ex.id);

                    if (exAnswers.filter(q => q.answer.trim()).length === 0 && exPoints.length === 0 && (ex.ballInPlaySeconds || 0) === 0) {
                      return null; // Skip completely empty exercises in preview
                    }

                    return (
                      <div key={ex.id} className="ml-2 pl-4 border-l-2 border-orange-600/30 space-y-4">
                        <div>
                          <div className="text-sm font-semibold text-white font-display uppercase">{ex.title}</div>
                          {ex.focus && <div className="text-[11px] text-gray-400 italic">Tema: {ex.focus}</div>}
                          {(() => {
                            const secs = ex.ballInPlaySeconds || 0;
                            const pct = viewingPastSession.plannedDuration > 0
                              ? ((secs / (viewingPastSession.plannedDuration * 60)) * 100).toFixed(1)
                              : "0.0";
                            const m = Math.floor(secs / 60);
                            const s = secs % 60;
                            return (
                              <div className="text-[11px] text-emerald-400 font-bold font-mono mt-1.5 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded w-fit">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                                <span>Aktiv speltid (Boll i spel): {m} min {s} sek ({pct}% av totalträningen)</span>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Checklist items answers */}
                        {exAnswers.map(ans => {
                          if (!ans.answer.trim()) return null;
                          return (
                            <div key={ans.id} className="space-y-1 bg-[#101422]/40 p-3 rounded-xl border border-[#1e2536]">
                              <div className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">{ans.question}</div>
                              <p className="text-[11.5px] text-[#e4e4e7] leading-relaxed font-sans pl-1">{ans.answer}</p>
                            </div>
                          );
                        })}

                        {/* Speech commentary items */}
                        {exPoints.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[9px] font-mono text-gray-500 uppercase font-semibold">LÖPANDE FEEDBACK:</span>
                            <div className="space-y-1.5 pl-1.5">
                              {exPoints.map(pt => {
                                const coachObj = viewingPastSession.coaches.find(c => c.id === pt.coachId);
                                let tagIndicator = "Allmänt";
                                if (pt.coachId === "coachutvecklare") tagIndicator = "Coachutvecklare";
                                else if (coachObj) tagIndicator = coachObj.name || coachObj.role;

                                return (
                                  <div key={pt.id} className="text-xs leading-normal">
                                    <span className="text-xs font-semibold text-orange-500 mr-1.5">&#8226; [{tagIndicator}]</span>
                                    <span className="text-gray-300">{pt.text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 4. Utvärdering med spelarna */}
                {renderRenderedSectionSummary(viewingPastSession, "utvardering_spelare", "4. Utvärdering med spelarna (Efter passet)")}

                {/* 5. Utvärdering med tränarteamet */}
                {renderRenderedSectionSummary(viewingPastSession, "utvardering_tranareteamet", "5. Utvärdering med tränarteamet (Feedback till tränarna)")}

                {/* 6. Efterarbete */}
                {renderRenderedSectionSummary(viewingPastSession, "efterarbete", "6. Efterarbete (Efterarbetet)")}

                {/* 7. Avslutning */}
                {renderRenderedSectionSummary(viewingPastSession, "avslutning", "7. Avslutning (Sammanfattning & Avslutning)")}

                {/* Explicit custom sections summaries if defined */}
                {viewingPastSession.customCategories.map(slug => {
                  const label = slug.replace("custom_", "").replace(/_/g, " ");
                  return renderRenderedSectionSummary(viewingPastSession, slug, `Egen Rubrik: ${label}`);
                })}

              </div>

            </div>

            {/* Bottom panel actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-6 border-t border-[#1e2536] max-w-4xl mx-auto w-full">
              <button
                onClick={handleGoBackFromFinished}
                className="w-full sm:w-auto px-5 py-3 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-xl text-xs cursor-pointer inline-flex items-center justify-center gap-1 font-semibold uppercase"
              >
                <ArrowLeft size={14} />
                <span>TILLBAKA</span>
              </button>
              <button
                onClick={handleResetToLanding}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-450 text-white rounded-xl text-xs cursor-pointer inline-flex items-center justify-center gap-2 font-bold shadow-md shadow-orange-600/20 transition-all hover:scale-[1.01]"
              >
                <PlusCircle size={15} />
                <span>BÖRJA OM MED EN NY OBSERVATION</span>
              </button>
            </div>
          </motion.div>
        )}

      </main>

      {/* CUSTOM CONFIRM MODAL FOR DELETING SESSION */}
      <AnimatePresence>
        {sessionToDelete && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSessionToDelete(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-[#0e121c] border-2 border-[#ff7a30]/30 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center space-y-6 z-10"
            >
              <div className="w-12 h-12 bg-red-950/50 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center text-xl font-bold animate-pulse">
                ⚠️
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-sans font-extrabold tracking-wider text-white uppercase">
                  VILL DU RADERA AKTIVITETEN?
                </h3>
                <p className="text-[10px] text-gray-400 uppercase font-medium leading-relaxed">
                  Denna observation kommer att tas bort permanent och kan inte återställas.
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 w-full">
                <button
                  onClick={() => setSessionToDelete(null)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase cursor-pointer rounded-xl border border-zinc-700 transition-all font-sans"
                >
                  Nej
                </button>
                <button
                  onClick={confirmDeleteSession}
                  className="flex-1 py-3 bg-red-650 hover:bg-red-600 text-white font-bold text-xs uppercase cursor-pointer rounded-xl border border-red-500 shadow-lg shadow-red-900/30 transition-all font-sans"
                >
                  Ja
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM CONFIRM MODAL FOR DELETING BEHAVIOR TAG */}
      <AnimatePresence>
        {tagToDeleteIndex !== null && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTagToDeleteIndex(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-[#0e121c] border-2 border-red-500/30 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center space-y-6 z-10"
            >
              <div className="w-12 h-12 bg-red-950/50 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center text-xl font-bold animate-pulse">
                ⚠️
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-sans font-extrabold tracking-wider text-white uppercase">
                  vill du verkligen radera?
                </h3>
                <p className="text-[10px] text-gray-400 uppercase font-medium leading-relaxed">
                  Taggen "{behaviorTags[tagToDeleteIndex]}" kommer tas bort permanent från panelen.
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 w-full">
                <button
                  type="button"
                  onClick={() => setTagToDeleteIndex(null)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase cursor-pointer rounded-xl border border-zinc-700 transition-all font-sans"
                >
                  Nej
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const idx = tagToDeleteIndex;
                    setBehaviorTags(prev => prev.filter((_, tIdx) => tIdx !== idx));
                    setTagToDeleteIndex(null);
                  }}
                  className="flex-1 py-3 bg-red-650 hover:bg-red-600 text-white font-bold text-xs uppercase cursor-pointer rounded-xl border border-red-500 shadow-lg shadow-red-900/30 transition-all font-sans"
                >
                  Ja
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* FOOTER BAR */}
      <footer className="border-t border-[#1b212f] bg-[#0c0f17]/90 py-4 px-4 text-center mt-8">
        <p className="text-[11px] text-gray-500 font-sans tracking-wide">
          Tränarobservationer Fotboll &copy; 2026. Utvecklad för fältexport av tränarcoacher i fält. Systemdrift via Google AI Studio.
        </p>
      </footer>
    </div>
  );
}

// Preview Category Section Render Helper to reduce duplication
function renderRenderedSectionSummary(session: ObservationSession, categorySlug: string, categoryTitle: string) {
  const catAnswers = session.checklistAnswers.filter(q => q.category === categorySlug);
  const catPoints = session.customObservations.filter(p => p.category === categorySlug);

  // If completely empty, skip rendering in final consolidated preview
  if (catAnswers.filter(q => q.answer.trim() || q.audioUrl).length === 0 && catPoints.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h4 className="text-xs text-orange-500 font-mono tracking-widest font-bold uppercase border-b border-[#232d3d] pb-1">
        {categoryTitle}
      </h4>

      {/* Checklist items answers */}
      {catAnswers.map(ans => {
        if (!ans.answer.trim() && !ans.audioUrl) return null;
        return (
          <div key={ans.id} className="space-y-1 bg-[#101422]/40 p-4 rounded-xl border border-[#1e2536]">
            <div className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">{ans.question}</div>
            {ans.answer.trim() && (
              <p className="text-[11.5px] text-[#e4e4e7] leading-relaxed font-sans pl-1">{ans.answer}</p>
            )}
            {ans.audioUrl && (
              <div className="pt-2 pl-1 flex items-center gap-2">
                <span className="text-[9px] font-mono text-orange-400 font-bold uppercase shrink-0">
                  🎙️ Röstmemo:
                </span>
                <audio src={ans.audioUrl} controls className="h-7 max-w-sm flex-grow opacity-90" />
              </div>
            )}
          </div>
        );
      })}

      {/* Speech commentary items */}
      {catPoints.length > 0 && (
        <div className="space-y-2 pl-1">
          <span className="text-[9px] font-mono text-gray-500 uppercase font-semibold">LÖPANDE ANTECKNINGAR:</span>
          <div className="space-y-1.5 pl-1">
            {catPoints.map(pt => {
              const coachObj = session.coaches.find(c => c.id === pt.coachId);
              let tagIndicator = "Allmänt";
              if (pt.coachId === "coachutvecklare") tagIndicator = "Coachutvecklare";
              else if (coachObj) tagIndicator = coachObj.name || coachObj.role;

              return (
                <div key={pt.id} className="text-xs leading-normal">
                  <span className="text-xs font-semibold text-orange-500 mr-1.5">&#8226; [{tagIndicator}]</span>
                  <span className="text-gray-300">{pt.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
