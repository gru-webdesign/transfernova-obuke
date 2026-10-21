/* TransferNova · Obuke — certificate.js
   Iscrtavanje sertifikata/zahvalnice na canvasu (PNG šablon + polje za ime) i čuvanje stanja simulacije.
   Klasična skripta (bez bundlera): fajlovi se učitavaju redom iz index.html i dele globalni opseg. */
/* ---------- 4. SERTIFIKAT / ZAHVALNICA ---------- */
const IMG = {};
function getImg(src) {
  if (!IMG[src]) {
    const i = new Image();
    i.onload = () => render();
    i.src = src;
    IMG[src] = i;
  }
  return IMG[src];
}
function wrapT(x, t, cx, y, w, lh) {
  let line = "";
  for (const word of t.split(" ")) {
    const tt = line ? line + " " + word : word;
    if (x.measureText(tt).width > w && line) {
      x.fillText(line, cx, y);
      line = word;
      y += lh;
    } else line = tt;
  }
  x.fillText(line, cx, y);
}
function drawDefault(x, kind, cfg) {
  const W = 1600,
    H = 1131,
    cx = 800,
    ny = (cfg.nameY / 100) * H;
  x.fillStyle = "#fff";
  x.fillRect(0, 0, W, H);
  x.strokeStyle = "#333b66";
  x.lineWidth = 14;
  x.strokeRect(36, 36, W - 72, H - 72);
  x.strokeStyle = "#e2672c";
  x.lineWidth = 3;
  x.strokeRect(62, 62, W - 124, H - 124);
  x.textAlign = "center";
  x.fillStyle = "#333b66";
  x.font = '800 46px "Nunito Sans",sans-serif';
  x.fillText("TransferNova", cx, 160);
  x.strokeStyle = "#e2672c";
  x.lineWidth = 5;
  x.beginPath();
  x.arc(cx + 10, 150, 70, Math.PI * 1.15, Math.PI * 1.85);
  x.stroke();
  x.fillStyle = "#1f2547";
  x.font = '700 100px "Noto Serif",Georgia,serif';
  x.fillText(kind === "cert" ? "SERTIFIKAT" : "ZAHVALNICA", cx, 300);
  x.fillStyle = "#5d6488";
  x.font = '600 30px "Nunito Sans",sans-serif';
  x.fillText(kind === "cert" ? "o uspešno završenoj obuci" : "za popunjen upitnik", cx, 356);
  x.font = '26px "Nunito Sans",sans-serif';
  x.fillText(kind === "cert" ? "Ovim se potvrđuje da je" : "Zahvaljujemo", cx, ny - 95);
  x.strokeStyle = "#c9ccdd";
  x.lineWidth = 2;
  x.beginPath();
  x.moveTo(cx - 380, ny + 26);
  x.lineTo(cx + 380, ny + 26);
  x.stroke();
  if (kind === "thanks" && cfg.text) {
    x.fillStyle = "#4b5277";
    x.font = 'italic 26px "Noto Serif",serif';
    wrapT(x, cfg.text, cx, ny + 215, 1000, 38);
  }
  x.strokeStyle = "#333b66";
  x.beginPath();
  x.moveTo(230, 990);
  x.lineTo(560, 990);
  x.moveTo(W - 560, 990);
  x.lineTo(W - 230, 990);
  x.stroke();
  x.fillStyle = "#5d6488";
  x.font = '600 22px "Nunito Sans",sans-serif';
  x.fillText("Compliance služba", 395, 1024);
  x.fillText("Ovlašćeno lice", W - 395, 1024);
}
function renderCert(t, kind, name, ts) {
  const cfg = kind === "cert" ? t.certificate : t.thankYou;
  const c = document.createElement("canvas");
  c.width = 1600;
  c.height = 1131;
  const x = c.getContext("2d");
  if (cfg.image) {
    const i = getImg(cfg.image);
    if (!i.complete || !i.naturalWidth) return "";
    x.drawImage(i, 0, 0, 1600, 1131);
  } else drawDefault(x, kind, cfg);
  const nx = (cfg.nameX / 100) * 1600,
    ny = (cfg.nameY / 100) * 1131;
  x.textAlign = "center";
  x.fillStyle = cfg.color;
  x.font = `italic 700 ${cfg.fontSize * 1.6}px "Noto Serif",Georgia,serif`;
  x.fillText(name || "Ime i prezime", nx, ny);
  if (cfg.showTitle) {
    x.fillStyle = "#333b66";
    x.font = '700 32px "Nunito Sans",sans-serif';
    x.fillText(`„${t.title || "Naziv obuke"}“`, nx, ny + 88);
  }
  if (cfg.showDate) {
    x.fillStyle = "#5d6488";
    x.font = '26px "Nunito Sans",sans-serif';
    x.fillText("Datum: " + fmtD(ts), nx, ny + 140);
  }
  return c.toDataURL("image/png");
}

function save() {
  try {
    localStorage.setItem(STORE, JSON.stringify(S));
  } catch (e) {}
}
function load() {
  try {
    const r = localStorage.getItem(STORE);
    if (r) {
      S = JSON.parse(r);
      return true;
    }
  } catch (e) {}
  return false;
}
