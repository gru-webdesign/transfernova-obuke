/* TransferNova · Obuke — domain.js
   Poslovna logika: bodovanje, flagovi, statusi dodele, obaveštenja (app + e-mail), blokada naloga, raspored rokova.
   U produkciji ova logika ide na server (bodovanje se nikad ne radi u pregledaču).
   Klasična skripta (bez bundlera): fajlovi se učitavaju redom iz index.html i dele globalni opseg. */
/* ---------- 3. DOMEN ---------- */
let S = null;
const user = (id) => S.users.find((u) => u.id === id),
  agent = (id) => S.agents.find((a) => a.id === id),
  tr = (id) => S.trainings.find((t) => t.id === id),
  asg = (id) => S.assignments.find((a) => a.id === id);
const allQs = (t) => t.buckets.flatMap((b) => b.questions.map((q) => ({ ...q, bucket: b.name })));
const qById = (t, id) => allQs(t).find((q) => q.id === id);
const tip = (t) => (t.type === "test" ? "test" : "upitnik");
const maxAttempts = (t, a) => (t.type === "test" ? (+t.settings.attempts || 1) + (a.extra || 0) : 1);
const audit = (who, text) => S.audit.unshift({ at: S.now, who, text });
const ME = "Goran Grujović";
function drawQuestions(t) {
  const out = [];
  for (const b of t.buckets) {
    let qs = b.questions.slice();
    if (b.drawCount > 0 && b.drawCount < qs.length) {
      qs.sort(() => Math.random() - 0.5);
      qs = qs.slice(0, b.drawCount);
      qs.sort((x, y) => b.questions.indexOf(x) - b.questions.indexOf(y));
    }
    if (t.settings.shuffle) qs.sort(() => Math.random() - 0.5);
    out.push(...qs.map((q) => q.id));
  }
  return out;
}
function scoreAttempt(t, qids, answers) {
  let score = 0,
    max = 0;
  const flags = [],
    detail = {};
  const isT = t.type === "test";
  for (const qid of qids) {
    const q = qById(t, qid);
    if (!q || q.type === "text") continue;
    const sel = answers[qid] || [];
    if (isT) {
      const pts = +q.points || 0;
      max += pts;
      const corr = q.options.filter((o) => o.correct).map((o) => o.id);
      let got = 0;
      if (q.type === "multi") {
        if (t.settings.partialCredit) {
          const g = sel.filter((x) => corr.includes(x)).length,
            b = sel.length - g;
          got = Math.max(0, (g - b) / (corr.length || 1)) * pts;
        } else got = sel.length === corr.length && sel.every((x) => corr.includes(x)) ? pts : 0;
      } else got = corr.includes(sel[0]) ? pts : 0;
      score += got;
      detail[qid] = { got: Math.round(got * 100) / 100, max: pts, ok: got >= pts };
    }
    for (const s of sel) {
      const o = q.options.find((o) => o.id === s);
      if (o?.flag?.on)
        flags.push({
          id: uid("f"),
          qid,
          question: q.text,
          answer: o.text,
          severity: o.flag.severity,
          message: o.flag.message,
          regulatory: o.flag.regulatory,
          status: "open",
          note: "",
        });
    }
  }
  const pct = isT && max ? Math.round((score / max) * 1000) / 10 : null;
  return {
    score: Math.round(score * 100) / 100,
    max,
    pct,
    passed: isT ? pct >= +t.settings.passMark : true,
    detail,
    flags,
  };
}
function aStatus(a) {
  const t = tr(a.trainingId),
    at = a.attempts;
  if (t.type === "survey") {
    if (at.length) return "completed";
  } else {
    if (at.some((x) => x.passed)) return "passed";
    if (at.length >= maxAttempts(t, a)) return "failed";
  }
  if (S.now > a.deadlineAt) return "overdue";
  return a.draft ? "in_progress" : at.length ? "failed_retry" : "not_started";
}
const isPending = (s) => ["not_started", "in_progress", "failed_retry", "overdue"].includes(s);
const ST = {
  not_started: ["Nije započeto", "s-mute"],
  in_progress: ["U toku", "s-warn"],
  failed_retry: ["Nije položio – ima pokušaj", "s-warn"],
  overdue: ["Rok istekao", "s-bad"],
  passed: ["Položio", "s-ok"],
  failed: ["Nije položio", "s-bad"],
  completed: ["Popunjeno", "s-ok"],
};
const SEV = { high: "Visok", medium: "Srednji", low: "Nizak" };
const FST = {
  open: ["Otvoren", "s-bad"],
  corrected: ["Korigovano – na proveri", "s-warn"],
  closed: ["Zatvoren", "s-ok"],
};
const stTxt = (s) => `<span class="${ST[s][1]}">${ST[s][0]}</span>`;
const finalAtt = (a) => {
  const t = tr(a.trainingId);
  return (t.type === "test" && a.attempts.find((x) => x.passed)) || a.attempts.at(-1);
};
const isLate = (a) => {
  const f = finalAtt(a);
  return !!f && ["passed", "completed"].includes(aStatus(a)) && f.submittedAt > a.deadlineAt;
};
const flagsOf = (a) => finalAtt(a)?.flags || [];
function send(u, ch, subject, body, kind, aid, fid) {
  const b = { userId: u.id, subject, body, kind, at: S.now, assignId: aid, flagId: fid, read: false };
  if (ch !== "email") S.messages.push({ ...b, id: uid("m"), channel: "app" });
  if (ch !== "app" && S.settings.email) S.messages.push({ ...b, id: uid("m"), channel: "email", to: u.email });
}
const fill = (txt, t, dl) =>
  txt
    .replace(/\{tip\}/g, tip(t))
    .replace(/\{naziv\}/g, t.title)
    .replace(/\{dana\}/g, t.settings.deadlineDays)
    .replace(/\{rok\}/g, fmtD(dl));
function submitAttempt(a, { answers, drawn, certName, startedAt }) {
  const t = tr(a.trainingId),
    u = user(a.userId);
  const r = scoreAttempt(t, drawn, answers);
  const att = { id: uid("at"), startedAt, submittedAt: S.now, certName, drawn, answers, ...r };
  a.attempts.push(att);
  a.draft = null;
  for (const f of att.flags)
    send(
      u,
      "both",
      (f.regulatory ? "Zahtev regulatora" : "Preporuka") + " – potrebna korekcija",
      f.message + "\n\nPitanje: " + f.question + "\nVaš odgovor: " + f.answer,
      "flag",
      a.id,
      f.id,
    );
  const st = aStatus(a);
  if (t.type === "test")
    send(
      u,
      "both",
      (att.passed ? "Položili ste: " : "Test nije položen: ") + t.title,
      att.passed
        ? `Test ste položili sa ${att.pct}% (prag ${t.settings.passMark}%).${t.certificate.enabled ? " Sertifikat je dostupan u delu Obuke." : ""}`
        : `Ostvarili ste ${att.pct}% (prag ${t.settings.passMark}%). ` +
            (st === "failed"
              ? "Iskoristili ste sve pokušaje."
              : `Preostalo pokušaja: ${maxAttempts(t, a) - a.attempts.length}.`),
      "result",
      a.id,
    );
  else
    send(
      u,
      "both",
      "Hvala na popunjenom upitniku: " + t.title,
      "Upitnik je evidentiran." + (t.thankYou.enabled ? " Zahvalnica je dostupna u delu Obuke." : ""),
      "result",
      a.id,
    );
  audit(
    u.name,
    `${t.type === "test" ? "Predao test" : "Popunio upitnik"} „${t.title}“${t.type === "test" ? ` – ${att.pct}%` : ""}${att.flags.length ? ` · flagova: ${att.flags.length}` : ""}`,
  );
  if (u.blocked?.trainingId === t.id && ["passed", "completed"].includes(st) && S.settings.autoUnblock)
    unblock(u, "Sistem");
  return att;
}
function block(u, reason, by, tid) {
  u.blocked = { reason, by, trainingId: tid, at: S.now };
  send(
    u,
    "both",
    "Nalog blokiran za rad",
    `Poštovani, vaš korisnički nalog je blokiran za rad. Razlog: ${reason}.`,
    "block",
  );
  audit(by, "Blokiran nalog " + u.name + " – " + reason);
}
function unblock(u, by) {
  u.blocked = null;
  send(u, "both", "Nalog odblokiran", "Poštovani, vaš korisnički nalog je ponovo aktivan za rad.", "unblock");
  audit(by, "Odblokiran nalog " + u.name);
}
function runScheduler() {
  let n = 0;
  for (const a of S.assignments) {
    const t = tr(a.trainingId);
    if (t.status !== "sent") continue;
    const u = user(a.userId),
      st = aStatus(a);
    if (!isPending(st)) continue;
    const dl = daysLeft(a.deadlineAt);
    if (!a.rem && dl > 0 && dl <= S.settings.reminderDays) {
      a.rem = true;
      n++;
      send(
        u,
        "both",
        "Podsetnik: " + t.title,
        `Rok za ${tip(t)} „${t.title}“ ističe ${fmtD(a.deadlineAt)}.`,
        "reminder",
        a.id,
      );
    }
    if (S.now > a.deadlineAt && !a.over) {
      a.over = true;
      n++;
      send(
        u,
        "both",
        "Istekao rok: " + t.title,
        `Rok za ${tip(t)} „${t.title}“ je istekao ${fmtD(a.deadlineAt)}. Uradite ga odmah.`,
        "overdue",
        a.id,
      );
      if (t.settings.autoBlock && !u.blocked) block(u, "Istekao rok za obuku „" + t.title + "“", "Sistem", t.id);
    }
  }
  return n;
}
