import { ChecklistQuestion } from "./types";

export const DEFAULT_COACHES = [
  { id: "1", name: "", role: "Huvudtränare" }
];

export const FOOTBALL_ACTION_THEMES = [
  "Bättre fotbollsaktion",
  "Behålla bra fotbollsaktion",
  "Fler Fotbollsaktioner",
  "Behålla många fotbollsaktioner"
];

export const DEFAULT_CHECK_QUESTIONS: ChecklistQuestion[] = [
  // Planering
  {
    id: "p1",
    category: "planering",
    question: "HUR FUNGERAR RUTINERNA FÖR ATT PLANERA TRÄNINGSPASSET? HUR INVOLVERAS SAMTIGA TRÄNARE I PLANERINGEN? HUR FÅR TRÄNARE SOM INTE ÄR MED I PLANERINGSARBETET BESKED?",
    answer: ""
  },
  {
    id: "p2",
    category: "planering",
    question: "HUR ÖVERFÖR MAN KLUBBENS UTBILDNINGSPLAN TILL INNEHÅLL I TRÄNINGSPASSET?",
    answer: ""
  },
  {
    id: "p3",
    category: "planering",
    question: "HUR SER MIKROCYKELN UT I RELATION TILL DETTA TRÄNINGSPASS?",
    answer: ""
  },
  {
    id: "p4",
    category: "planering",
    question: "VILKEN BELASTNING ÄR PLANERAD? (HUR MÄTS DETTA?)",
    answer: ""
  },
  {
    id: "p5",
    category: "planering",
    question: "HUR TRÄNARNA PLANERAT SÅ MAN FÅR IN FOTBOLLSFYSMOMENT UNDER PASSET?",
    answer: ""
  },
  {
    id: "p6",
    category: "planering",
    question: "HUR MAN KONTROLL PÅ VILKA SPELARE MAN HAR TILLGÄNGLIGA TILL TRÄNINGEN? VAD GÖR DE SOM SKA HA TRÄNA KOLLEKTIVT? SKA NÅGON HA ANPASSAD BELASTNING ELLER ANPASSADE ÖVNINGAR?",
    answer: ""
  },
  {
    id: "p7",
    category: "planering",
    question: "HUR TRÄNARNA PLANERAT SÅ MAN FÅR IN FOTBOLLSPSYKOLOGI UNDER PASSET?",
    answer: ""
  },
  {
    id: "p8",
    category: "planering",
    question: "HUR INTEGRERAS MÅLVAKTSTRÄNING I PLANERINGEN?",
    answer: ""
  },
  {
    id: "p9",
    category: "planering",
    question: "HUR INTEGRERAS IUP I PLANERINGEN?",
    answer: ""
  },
  {
    id: "p10",
    category: "planering",
    question: "FINNS DET MÖJLIGHET ATT LÄGGA ORDNING MATERIAL PÅ FOTBOLLSPLANEN FÖRE TRÄNING?",
    answer: ""
  },

  // Inramning
  {
    id: "i1",
    category: "inramning",
    question: "HUR MÖTER MAN SPELARNA NÄR DOM KOMMER TILL OMKLÄDNINGSRUMMET?",
    answer: ""
  },
  {
    id: "i2",
    category: "inramning",
    question: "ÄR SAMTIGA I TRÄNARTEAMET TILLGÄNGLIGA FÖR SPELARNA?",
    answer: ""
  },
  {
    id: "i3",
    category: "inramning",
    question: "HAR SPELARNA MÖJLIGHET TILL ATT DISKUTERA ENSKILT MED EN TRÄNARE?",
    answer: ""
  },
  {
    id: "i4",
    category: "inramning",
    question: "HUR INFORMERAR OCH FÖRBEREDER MAN SPELARNA FÖR TRÄNINGEN?",
    answer: ""
  },
  {
    id: "i5",
    category: "inramning",
    question: "ANVÄNDER MAN TAKTIKTAVLA, VIDEO ETC. ÖVRIGA PEDAGOGISKA OCH DIDAKTISKA VAL?",
    answer: ""
  },

  // Utvärdering med spelarna
  {
    id: "us1",
    category: "utvardering_spelare",
    question: "HUR AVSLUTAR MAN TRÄNINGSPASSET?",
    answer: ""
  },
  {
    id: "us2",
    category: "utvardering_spelare",
    question: "HAR MAN NÅGON GENOMGÅNG EFTER TRÄNINGEN MED SPELARNA",
    answer: ""
  },
  {
    id: "us3",
    category: "utvardering_spelare",
    question: "ANVÄNDER MAN VIDEO ELLER ANNAT TEKNISKT HJÄLPMEDEL FÖR ATT TYDLIGGÖRA?",
    answer: ""
  },
  {
    id: "us4",
    category: "utvardering_spelare",
    question: "HUR UTVÄRDERAR MAN TRÄNINGEN MED SPELARNA, FÅR DE VARA DELAKTIGA I DETTA",
    answer: ""
  },
  {
    id: "us5",
    category: "utvardering_spelare",
    question: "VILKA TYPER AVLÄRANDEMETODER ANVÄNDS? (FRÅGETEKNIKER, DIREKT INSTRUKTION, MODELLINLÄRNING ETC)",
    answer: ""
  },
  {
    id: "us6",
    category: "utvardering_spelare",
    question: "GÅR DET ATT DISKUTERA ENSKILT MED TRÄNARE",
    answer: ""
  },
  {
    id: "us7",
    category: "utvardering_spelare",
    question: "HUR LÄNGE ÄR TRÄNARNA TILLGÄNGLIGA FÖR SPELARNA",
    answer: ""
  },
  {
    id: "us8",
    category: "utvardering_spelare",
    question: "HUR SAMLAS SPELARNAS RPE IN?",
    answer: ""
  },

  // Utvärdering med tränarteamet
  {
    id: "ut1",
    category: "utvardering_tranareteamet",
    question: "HUR UTVÄRDERAR TRÄNARTEAMET TRÄNINGSPASSET TILLSAMMANS?",
    answer: ""
  },
  {
    id: "ut2",
    category: "utvardering_tranareteamet",
    question: "HUR DISKUTERAS SPELARNAS LÄRANDE?",
    answer: ""
  },
  {
    id: "ut3",
    category: "utvardering_tranareteamet",
    question: "HUR UTVÄRDERAS SPELARNAS PRESTATION?",
    answer: ""
  },

  // Efterarbete
  {
    id: "ea1",
    category: "efterarbete",
    question: "HUR LOGGFÖRS TRÄNING?",
    answer: ""
  },
  {
    id: "ea2",
    category: "efterarbete",
    question: "HUR LOGGFÖRS OCH ANALYSERAS BELASTNINGEN?",
    answer: ""
  },
  {
    id: "ea3",
    category: "efterarbete",
    question: "HUR LOGGFÖRS OCH ANALYSERAS ÖVRIG ANALYS (TAGGNING, VIDEO)?",
    answer: ""
  },

  // Avslutning
  {
    id: "av1",
    category: "avslutning",
    question: "Tränarna sätter ett betyg 1-10 hur nöjda de är totalt sätt med träningen",
    answer: ""
  },
  {
    id: "av2",
    category: "avslutning",
    question: "Tränarna svarar på vad de behöver för att denna siffra ska vara högre nästa gång.",
    answer: ""
  }
];
