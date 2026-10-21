/* TransferNova · Obuke — data.js
   Podaci simulacije: 10 agenata, 20 blagajničkih naloga, podrazumevani tekstovi i prazni šabloni obuke/pitanja.
   U produkciji se agenti i nalozi čitaju iz postojećih tabela aplikacije.
   Klasična skripta (bez bundlera): fajlovi se učitavaju redom iz index.html i dele globalni opseg. */
/* ---------- 2. PODACI ---------- */
const AGENTS = [
  ["a1", "Ekspres Transfer", "Novi Sad"],
  ["a2", "Menjačnica Avala", "Beograd"],
  ["a3", "Dinar Plus", "Niš"],
  ["a4", "Zlatni Kurs", "Kragujevac"],
  ["a5", "Morava Exchange", "Kraljevo"],
  ["a6", "Dunav Pay", "Smederevo"],
  ["a7", "Menjačnica Sloga", "Subotica"],
  ["a8", "Ibar Transfer", "Novi Pazar"],
  ["a9", "Kosmaj Finans", "Mladenovac"],
  ["a10", "Panonija Money", "Zrenjanin"],
].map(([id, name, city]) => ({ id, name, city }));
const USERS = [
  ["u1", "a1", "Marko Petrović", 1],
  ["u2", "a1", "Jelena Nikolić", 1],
  ["u3", "a1", "Stefan Ilić", 1],
  ["u4", "a2", "Ana Jovanović", 1],
  ["u5", "a2", "Nikola Stojanović", 1],
  ["u6", "a2", "Milica Pavlović", 0],
  ["u7", "a3", "Dragan Kostić", 1],
  ["u8", "a3", "Ivana Marković", 1],
  ["u9", "a4", "Miloš Đorđević", 1],
  ["u10", "a4", "Tamara Popović", 1],
  ["u11", "a5", "Vladimir Lazić", 1],
  ["u12", "a5", "Sanja Todorović", 1],
  ["u13", "a6", "Bojan Ristić", 1],
  ["u14", "a6", "Katarina Simić", 1],
  ["u15", "a7", "Nemanja Mitić", 1],
  ["u16", "a7", "Jovana Savić", 1],
  ["u17", "a8", "Aleksandar Obradović", 1],
  ["u18", "a9", "Maja Vasić", 1],
  ["u19", "a9", "Dejan Milošević", 0],
  ["u20", "a10", "Teodora Zdravković", 1],
];
const DOCS = [
  "Opšti uslovi – RIA Money Transfer",
  "Cenovnik naknada – RIA",
  "Obaveštenje o pravu na prigovor",
  "Interna procedura SPN/FT",
  "Uputstvo za identifikaciju klijenta",
];
const DEF_NOTIFY =
  "U skladu sa regulativom, neophodno je da pristupite obuci i uradite {tip} u roku od {dana} dana (najkasnije do {rok}). U slučaju da {tip} ne uradite u navedenom periodu, korisnički nalog može biti blokiran za rad.";
const DEF_FLAG =
  "Poštovani, u skladu sa regulativom, neophodno je da … Potrebnu dokumentaciju možete pronaći u aplikaciji u delu Korisnički servis – Dokumentacija.";
function docCfg(kind) {
  return {
    enabled: true,
    image: null,
    nameX: 50,
    nameY: 47,
    fontSize: 44,
    color: "#1f2547",
    showTitle: true,
    showDate: true,
    text: kind === "thanks" ? "Zahvaljujemo vam na savesno popunjenom upitniku." : "",
  };
}
function seed() {
  S = {
    now: BASE,
    role: "manager",
    cashierId: "u12",
    view: "home",
    openMenu: null,
    settings: { defaultDeadline: 15, reminderDays: 3, autoUnblock: true, email: true },
    agents: AGENTS,
    users: USERS.map(([id, ag, name, act]) => {
      const un = tr8(name).toLowerCase().replace(" ", ".");
      return {
        id,
        agentId: ag,
        name,
        username: un,
        email:
          un +
          "@" +
          tr8(AGENTS.find((a) => a.id === ag).name)
            .toLowerCase()
            .replace(/\s+/g, "-") +
          ".test",
        active: !!act,
        blocked: null,
      };
    }),
    trainings: [],
    assignments: [],
    messages: [],
    audit: [],
    lf: { od: "", do: "", tip: "all", st: "all" },
    rf: { agent: "all", st: "all", flag: "all", q: "", page: 1 },
    rv: "nalozi",
    af: { t: "all", agent: "all", q: "", page: 1 },
  };
}
function blankTraining(type) {
  return {
    id: uid("t"),
    title: "",
    type,
    category: "Obuka zastupnika",
    description: "",
    material: "",
    status: "draft",
    createdAt: S.now,
    sentAt: null,
    deadlineAt: null,
    settings: {
      deadlineDays: S.settings.defaultDeadline,
      passMark: 80,
      attempts: 2,
      timeLimit: 0,
      shuffle: false,
      showFeedback: true,
      partialCredit: false,
      autoBlock: false,
      regulatoryRef: "",
    },
    buckets: [{ id: uid("b"), name: "Buket 1", drawCount: 0, questions: [] }],
    certificate: docCfg("cert"),
    thankYou: docCfg("thanks"),
    notifyText: DEF_NOTIFY,
    audience: { mode: "all", agentIds: [] },
  };
}
function newQ(type) {
  const id = uid("q");
  return {
    id,
    text: "",
    type,
    points: 1,
    required: true,
    options:
      type === "yesno" ? [newOpt(id, "Da"), newOpt(id, "Ne")] : type === "text" ? [] : [newOpt(id, ""), newOpt(id, "")],
  };
}
function newOpt(qid, text) {
  return {
    id: qid + "_" + uid("o"),
    text,
    correct: false,
    flag: { on: false, severity: "high", message: "", regulatory: true },
  };
}
