/* TransferNova · Obuke — util.js
   Pomoćne funkcije: datumi, escape, putanje u objektima.
   Klasična skripta (bez bundlera): fajlovi se učitavaju redom iz index.html i dele globalni opseg. */
/* =====================================================================
   TransferNova · sekcija OBUKE
   Menadžer: Nova obuka · Pregled obuka · Izveštaj obuke · Pregled naloga · Arhiva · Podešavanja
   Blagajnik: obaveštenje sa rokom · Moje obuke · rad testa/upitnika · Poruke (smernice za korekciju)
   Kod: 1 util · 2 podaci (10 agenata, 20 naloga, BEZ obuka) · 3 domen · 4 sertifikat · 5 ekrani · 6 akcije
   ===================================================================== */
const DAY = 864e5,
  BASE = new Date(2026, 9, 20, 10, 0).getTime(),
  STORE = "tn-obuke-v4";
const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
let _u = 0;
const uid = (p) => p + "_" + Date.now().toString(36).slice(-5) + (++_u).toString(36);
const p2 = (n) => String(n).padStart(2, "0");
const fmtD = (t) => {
  const d = new Date(t);
  return `${p2(d.getDate())}-${p2(d.getMonth() + 1)}-${d.getFullYear()}`;
};
const fmtDT = (t) => {
  const d = new Date(t);
  return fmtD(t) + " " + p2(d.getHours()) + ":" + p2(d.getMinutes());
};
const isoD = (t) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
};
const daysLeft = (t) => Math.ceil((t - S.now) / DAY);
const tr8 = (s) => s.replace(/[čć]/gi, "c").replace(/š/gi, "s").replace(/ž/gi, "z").replace(/đ/gi, "dj");
const clone = (o) => JSON.parse(JSON.stringify(o));
const getPath = (o, p) => p.split(".").reduce((a, k) => a?.[k], o);
function setPath(o, p, v) {
  const k = p.split("."),
    l = k.pop();
  k.reduce((a, x) => a[x], o)[l] = v;
}
