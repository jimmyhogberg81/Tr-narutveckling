export interface Coach {
  id: string;
  name: string;
  role: string; // e.g., "Tränare", "Assistent", "Fystränare", "Målvaktstränare", "Matchanalytiker"
}

export interface ObservationPoint {
  id: string;
  timestamp: string;      // ISO string or simple time format e.g., "18:45"
  category: string;       // "planering" | "inramning" | "genomforande" | "utvardering_spelare" | "utvardering_tranareteamet" | "custom_category"
  exerciseId?: string;    // If category is "genomforande", links to specific exercise
  coachId: string;        // ID of coach who is tagged, or "allmant" for general, "coachutvecklare" for user
  text: string;
}

export interface ChecklistQuestion {
  id: string;
  category: string;       // "planering" | "inramning" | "genomforande" | "utvardering_spelare" | "utvardering_tranareteamet" | "custom_category"
  exerciseId?: string;
  question: string;
  answer: string;
  coachId?: string;       // Assigned coach if any
  audioUrl?: string;      // Sound byte url or base64 or blob URL saved under this question
}

export interface Exercise {
  id: string;
  title: string;          // e.g. "Övning 1: Speluppbyggnad"
  focus: string;          // exercise theme
  ballInPlaySeconds?: number; // Measured active play time in seconds
}

export interface ObservationSession {
  id: string;
  date: string;
  team: string;           // Lag/grupp
  theme: string;          // Passets tema/fokus
  matchCycleMDPlus: string; // MD+ dropdown
  matchCycleMDMinus: string; // MD- dropdown
  coaches: Coach[];
  numExercises: number;
  exercises: Exercise[];
  footballActions: string[]; // checkboxes selected
  plannedRPE: number;        // scale 1-10
  plannedDuration: number;   // total tid in minutes
  plannedLoad: number;       // computed plannedRPE * plannedDuration
  checklistAnswers: ChecklistQuestion[];
  customObservations: ObservationPoint[];
  customCategories: string[]; // Custom headings created by user
  createdAt: string;
}
