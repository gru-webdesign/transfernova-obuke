/* TransferNova · Obuke — app.js
   Render, akcije (sve data-act komande), događaji i pokretanje.
   Klasična skripta (bez bundlera): fajlovi se učitavaju redom iz index.html i dele globalni opseg. */
/* ---------- RENDER ---------- */
function render() {
  const fe = document.activeElement,
    fid = fe?.id,
    pos = fe && "selectionStart" in fe ? fe.selectionStart : null;
  header();
  simBar();
  nav();
  const v = S.view;
  let h;
  if (S.role === "manager")
    h =
      v === "list"
        ? vList()
        : v === "builder"
          ? vBuilder()
          : v.startsWith("t:")
            ? vReport(tr(v.slice(2)))
            : v.startsWith("acc:")
              ? vAccount(asg(v.slice(4)))
              : v === "archive"
                ? vArchive()
                : v === "settings"
                  ? vSettings()
                  : vHome();
  else h = v === "c-list" ? vCList() : v === "take" && S.take ? vTake() : v === "inbox" ? vInbox() : vCHome();
  $("#app").innerHTML = h;
  renderModal();
  if (fid) {
    const el = document.getElementById(fid);
    if (el && el !== document.activeElement) {
      el.focus();
      try {
        if (pos != null) el.setSelectionRange(pos, pos);
      } catch (e) {}
    }
  }
}
function toast(m) {
  $("#toast").innerHTML = `<div class="toast">${m}</div>`;
  clearTimeout(toast.h);
  toast.h = setTimeout(() => ($("#toast").innerHTML = ""), 3200);
}
function go(v) {
  S.view = v;
  S.openMenu = null;
  S.burger = false;
  window.scrollTo(0, 0);
  save();
  render();
}

/* ---------- 6. AKCIJE ---------- */
function audUsers(d) {
  const act = S.users.filter((u) => u.active);
  return d.audience.mode === "all" ? act : act.filter((u) => d.audience.agentIds.includes(u.agentId));
}
function validate(d) {
  const e = [];
  if (!d.title.trim()) e.push("Unesite naziv obuke.");
  if (!(+d.settings.deadlineDays > 0)) e.push("Rok mora biti bar 1 dan.");
  const qs = allQs(d);
  if (!qs.length) e.push("Dodajte bar jedno pitanje.");
  qs.forEach((q, i) => {
    const n = `Pitanje ${i + 1}`;
    if (!q.text.trim()) e.push(n + " nema tekst.");
    if (q.type !== "text") {
      if (q.options.length < 2) e.push(n + " mora imati bar 2 odgovora.");
      if (q.options.some((o) => !o.text.trim())) e.push(n + " ima prazan odgovor.");
      if (d.type === "test" && !q.options.some((o) => o.correct)) e.push(n + " nema označen tačan odgovor.");
      if (q.options.some((o) => o.flag.on && !o.flag.message.trim())) e.push(n + ": flag nema smernicu za korekciju.");
    }
  });
  if (!audUsers(d).length) e.push("Izaberite primaoce.");
  return e;
}
function saveDraft() {
  const d = clone(S.draft);
  const i = S.trainings.findIndex((t) => t.id === d.id);
  if (i >= 0) S.trainings[i] = d;
  else {
    S.trainings.push(d);
    audit(ME, "Kreiran nacrt „" + (d.title || "bez naziva") + "“");
  }
  save();
}
let DL;
(async () => {
  try {
    DL = await window.claude?.use?.("downloads");
  } catch (e) {
    DL = null;
  }
})();
async function dl(data, name) {
  if (DL) {
    try {
      await DL.save({ filename: name, data });
      toast("Sačuvano: " + name);
    } catch (e) {
      toast(e?.code === "declined" ? "Preuzimanje je otkazano." : "Preuzimanje nije dostupno u ovom prikazu.");
    }
    return;
  }
  try {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(data instanceof Blob ? data : new Blob([data]));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (e) {
    toast("Preuzimanje nije dostupno.");
  }
}
const toBlob = (u) => fetch(u).then((r) => r.blob());
const findFlag = (aid, fid) =>
  asg(aid)
    .attempts.flatMap((x) => x.flags)
    .find((f) => f.id === fid);
const curT = () => tr(S.view.slice(2));
function persistDraft() {
  const k = S.take;
  asg(k.aid).draft = {
    answers: clone(k.answers),
    drawn: k.drawn,
    startedAt: k.startedAt || S.now,
    certName: k.certName,
  };
  save();
}
function doSubmit() {
  const k = S.take,
    a = asg(k.aid);
  const att = submitAttempt(a, {
    answers: k.answers,
    drawn: k.drawn,
    certName: k.certName,
    startedAt: k.startedAt || S.now,
  });
  Object.assign(k, { step: "res", attId: att.id, endsAt: null });
  S.modal = null;
  save();
  go("take");
}
const A = {
  menu: (d) => {
    S.openMenu = S.openMenu === d.k ? null : d.k;
    render();
  },
  burger: () => {
    S.burger = !S.burger;
    render();
  },
  go: (d) => go(d.v),
  goFlags: () => {
    const t = S.trainings.filter((t) => t.status === "sent").sort((a, b) => b.sentAt - a.sentAt)[0];
    if (!t) return go("list");
    S.rv = "flagovi";
    S.rf = { agent: "all", st: "all", flag: "all", q: "", page: 1 };
    go("t:" + t.id);
  },
  soon: () => {
    S.openMenu = null;
    render();
    toast("Postojeći ekran aplikacije – van obima ove simulacije.");
  },
  cashop: () => {
    S.openMenu = null;
    render();
    toast(
      user(S.cashierId).blocked
        ? "Nalog je blokiran za rad. Završite obavezne obuke."
        : "Postojeći ekran aplikacije – van obima ove simulacije.",
    );
  },
  role: (d) => {
    S.role = d.r;
    S.take = null;
    S.modal = null;
    go("home");
  },
  time: (d) => {
    S.now += +d.d * DAY;
    const n = runScheduler();
    save();
    render();
    toast(`Datum ${fmtD(S.now)} · automatskih obaveštenja: ${n}`);
  },
  modal: (d) => {
    S.openMenu = null;
    S.modal = { type: d.m };
    render();
  },
  mclose: () => {
    S.modal = null;
    render();
  },
  bg: (d, el, e) => {
    if (e.target === el) {
      S.modal = null;
      render();
    }
  },
  resetNow: () => {
    const r = S.role;
    seed();
    S.role = r;
    save();
    render();
    toast("Simulacija je resetovana.");
  },
  new: () => {
    S.draft = blankTraining("test");
    S.draft.buckets[0].questions.push(newQ("single"));
    go("builder");
  },
  edit: (d) => {
    S.draft = clone(tr(d.id));
    go("builder");
  },
  delDraft: (d) => {
    S.trainings = S.trainings.filter((t) => t.id !== d.id);
    save();
    render();
    toast("Nacrt je obrisan.");
  },
  dup: (d) => {
    const c = clone(tr(d.id));
    Object.assign(c, {
      id: uid("t"),
      title: c.title + " (kopija)",
      status: "draft",
      sentAt: null,
      deadlineAt: null,
      createdAt: S.now,
    });
    S.draft = c;
    saveDraft();
    go("builder");
    toast("Napravljena kopija kao nacrt.");
  },
  open: (d) => {
    S.rv = "nalozi";
    S.rf = { agent: "all", st: "all", flag: "all", q: "", page: 1 };
    go("t:" + d.id);
  },
  rv: (d) => {
    S.rv = d.v;
    render();
  },
  acc: (d) => go("acc:" + d.id),
  agFilter: (d) => {
    S.rf.agent = d.ag;
    S.rf.page = 1;
    S.rv = "nalozi";
    render();
  },
  ostalo: () => {
    S.ostalo = !S.ostalo;
  },
  listSearch: () => {
    S.lf = { od: $("#lf-od").value, do: $("#lf-do").value, tip: $("#lf-tip").value, st: $("#lf-st").value };
    S.lf.ap = { ...S.lf };
    render();
  },
  repSearch: () => {
    S.rf = {
      agent: $("#rf-agent").value,
      st: $("#rf-st").value,
      flag: $("#rf-flag").value,
      q: $("#rf-q").value,
      page: 1,
    };
    render();
  },
  archSearch: () => {
    S.af = { t: $("#af-t").value, agent: $("#af-ag").value, q: $("#af-q").value, page: 1 };
    render();
  },
  rpage: (d) => {
    S.rf.page = +d.p;
    render();
  },
  apage: (d) => {
    S.af.page = +d.p;
    render();
  },
  addBucket: () => {
    S.draft.buckets.push({
      id: uid("b"),
      name: "Buket " + (S.draft.buckets.length + 1),
      drawCount: 0,
      questions: [newQ(S.draft.type === "test" ? "single" : "yesno")],
    });
    render();
  },
  delBucket: (d) => {
    if (S.draft.buckets.length < 2) return toast("Obuka mora imati bar jedan buket.");
    S.draft.buckets.splice(+d.b, 1);
    render();
  },
  addQ: (d) => {
    S.draft.buckets[+d.b].questions.push(newQ(S.draft.type === "test" ? "single" : "yesno"));
    render();
  },
  delQ: (d) => {
    S.draft.buckets[+d.b].questions.splice(+d.q, 1);
    render();
  },
  mvQ: (d) => {
    const qs = S.draft.buckets[+d.b].questions,
      i = +d.q,
      j = i + +d.dir;
    if (j < 0 || j >= qs.length) return;
    [qs[i], qs[j]] = [qs[j], qs[i]];
    render();
  },
  addOpt: (d) => {
    const q = S.draft.buckets[+d.b].questions[+d.q];
    q.options.push(newOpt(q.id, ""));
    render();
  },
  delOpt: (d) => {
    const q = S.draft.buckets[+d.b].questions[+d.q];
    if (q.options.length < 3) return toast("Pitanje mora imati bar 2 odgovora.");
    q.options.splice(+d.o, 1);
    render();
  },
  place: (d, el, e) => {
    const r = el.getBoundingClientRect(),
      c = S.draft[d.k];
    c.nameX = Math.round(((e.clientX - r.left) / r.width) * 100);
    c.nameY = Math.round(((e.clientY - r.top) / r.height) * 100);
    render();
  },
  clearImg: (d) => {
    S.draft[d.k].image = null;
    render();
  },
  saveDraft: () => {
    saveDraft();
    toast("Nacrt je sačuvan.");
  },
  sendConfirm: () => {
    const e = validate(S.draft);
    S.modal = e.length ? { type: "errors", list: e.slice(0, 14) } : { type: "sendConfirm" };
    render();
  },
  sendNow: () => {
    saveDraft();
    const t = tr(S.draft.id);
    t.status = "sent";
    t.sentAt = S.now;
    t.deadlineAt = S.now + t.settings.deadlineDays * DAY;
    const us = audUsers(t);
    for (const u of us) {
      const a = {
        id: uid("as"),
        trainingId: t.id,
        userId: u.id,
        assignedAt: S.now,
        deadlineAt: t.deadlineAt,
        attempts: [],
        draft: null,
        extra: 0,
      };
      S.assignments.push(a);
      send(u, "both", "Nova obavezna obuka: " + t.title, fill(t.notifyText, t, a.deadlineAt), "assign", a.id);
    }
    audit(ME, `Poslat ${tip(t)} „${t.title}“ na ${us.length} naloga`);
    S.modal = null;
    S.draft = null;
    S.rv = "nalozi";
    S.rf = { agent: "all", st: "all", flag: "all", q: "", page: 1 };
    go("t:" + t.id);
    toast(`Poslato na ${us.length} naloga.`);
  },
  closeT: () => {
    const t = curT();
    t.status = "closed";
    audit(ME, "Zatvorena obuka „" + t.title + "“");
    save();
    render();
    toast("Obuka je zatvorena.");
  },
  csv: () => {
    const t = curT();
    const r = filterRows(rowsFor(t));
    const L = [
      `Obuka;${t.title}`,
      `Datum;${fmtD(S.now)}`,
      "",
      "Blagajnik;Korisničko ime;Agent;Status;Rezultat %;Pokušaji;Aktivni flagovi;Predato;Rok;Nalog",
      ...r.map((x) =>
        [
          x.u.name,
          x.u.username,
          x.ag.name,
          ST[x.st][0] + (x.late ? " (posle roka)" : ""),
          x.last?.pct ?? "",
          x.a.attempts.length,
          x.flags
            .filter((f) => f.status !== "closed")
            .map((f) => f.question)
            .join(" | "),
          x.last ? fmtDT(x.last.submittedAt) : "",
          fmtD(x.a.deadlineAt),
          x.u.blocked ? "Blokiran" : "Aktivan",
        ]
          .map((v) => String(v).replace(/;/g, ","))
          .join(";"),
      ),
    ];
    dl(new Blob(["﻿" + L.join("\n")], { type: "text/csv" }), "izvestaj_obuke.csv");
  },
  bulkRemind: () => {
    const t = curT();
    let n = 0;
    for (const a of S.assignments.filter((a) => a.trainingId === t.id))
      if (isPending(aStatus(a))) {
        n++;
        send(user(a.userId), "both", "Podsetnik: " + t.title, fill(t.notifyText, t, a.deadlineAt), "reminder", a.id);
      }
    audit(ME, `Podsetnik (${n}) – „${t.title}“`);
    save();
    render();
    toast(`Podsetnik poslat na ${n} naloga.`);
  },
  bulkExtend: () => {
    const t = curT();
    let n = 0;
    for (const a of S.assignments.filter((a) => a.trainingId === t.id))
      if (isPending(aStatus(a))) {
        a.deadlineAt = Math.max(a.deadlineAt, S.now) + 7 * DAY;
        a.over = false;
        a.rem = false;
        n++;
        send(user(a.userId), "both", "Produžen rok: " + t.title, `Novi rok je ${fmtD(a.deadlineAt)}.`, "extend", a.id);
      }
    save();
    render();
    toast(`Rok produžen za ${n} naloga.`);
  },
  bulkBlock: () => {
    const t = curT();
    let n = 0;
    for (const a of S.assignments.filter((a) => a.trainingId === t.id)) {
      const u = user(a.userId);
      if (aStatus(a) === "overdue" && !u.blocked) {
        block(u, "Istekao rok za obuku „" + t.title + "“", ME, t.id);
        n++;
      }
    }
    save();
    render();
    toast(n ? `Blokirano naloga: ${n}.` : "Nema naloga sa isteklim rokom.");
  },
  remind1: (d) => {
    const a = asg(d.a),
      t = tr(a.trainingId);
    send(user(a.userId), "both", "Podsetnik: " + t.title, fill(t.notifyText, t, a.deadlineAt), "reminder", a.id);
    save();
    render();
    toast("Podsetnik je poslat.");
  },
  extend1: (d) => {
    const a = asg(d.a),
      t = tr(a.trainingId);
    a.deadlineAt = Math.max(a.deadlineAt, S.now) + 7 * DAY;
    a.over = false;
    a.rem = false;
    send(user(a.userId), "both", "Produžen rok: " + t.title, `Novi rok je ${fmtD(a.deadlineAt)}.`, "extend", a.id);
    save();
    render();
    toast("Rok je produžen.");
  },
  extra1: (d) => {
    const a = asg(d.a),
      t = tr(a.trainingId);
    a.extra = (a.extra || 0) + 1;
    if (S.now > a.deadlineAt) a.deadlineAt = S.now + 7 * DAY;
    send(user(a.userId), "both", "Odobren dodatni pokušaj: " + t.title, `Rok: ${fmtD(a.deadlineAt)}.`, "extra", a.id);
    save();
    render();
    toast("Dodeljen dodatni pokušaj.");
  },
  toggleBlock: (d) => {
    const u = user(d.u);
    if (u.blocked) unblock(u, ME);
    else block(u, "Odluka menadžera", ME, null);
    save();
    render();
  },
  fClose: (d) => {
    const f = findFlag(d.a, d.f),
      a = asg(d.a);
    f.status = "closed";
    f.closedAt = S.now;
    send(
      user(a.userId),
      "app",
      "Korekcija prihvaćena",
      "Compliance služba je potvrdila korekciju: " + f.question,
      "flagclose",
      a.id,
    );
    save();
    render();
    toast("Flag je zatvoren.");
  },
  fReopen: (d) => {
    findFlag(d.a, d.f).status = "open";
    save();
    render();
  },
  fResend: (d) => {
    const f = findFlag(d.a, d.f),
      a = asg(d.a);
    f.status = "open";
    send(
      user(a.userId),
      "both",
      "Ponovljen zahtev – potrebna korekcija",
      f.message + "\n\nPitanje: " + f.question,
      "flag",
      a.id,
      f.id,
    );
    save();
    render();
    toast("Smernica je ponovo poslata.");
  },
  markCorr: (d) => {
    const f = findFlag(d.a, d.f);
    f.status = "corrected";
    f.note = ($("#note-" + f.id)?.value || "").trim() || "Korigovano.";
    audit(user(S.cashierId).name, "Označio korekciju: " + f.question);
    save();
    render();
    toast("Označeno kao korigovano.");
  },
  read: (d, el, e) => {
    if (e.target.closest("input,button")) return;
    const m = S.messages.find((x) => x.id === d.id);
    if (m) m.read = true;
    save();
    render();
  },
  readAll: () => {
    S.messages.filter((m) => m.userId === S.cashierId).forEach((m) => (m.read = true));
    save();
    render();
  },
  docTest: (d) => {
    const a = asg(d.a),
      at = a.attempts.find((x) => x.id === d.at);
    S.modal = {
      type: "doc",
      title: "Popunjen " + tip(tr(a.trainingId)),
      html: attDoc(a, at),
      dl: "dlTest",
      a: d.a,
      at: d.at,
    };
    render();
  },
  docCert: (d) => {
    const a = asg(d.a),
      t = tr(a.trainingId),
      at = a.attempts.find((x) => x.id === d.at),
      k = t.type === "test" ? "cert" : "thanks";
    S.modal = {
      type: "doc",
      title: k === "cert" ? "Sertifikat" : "Zahvalnica",
      html: `<img class="w-full rounded border" style="border-color:var(--line)" alt="dokument" src="${renderCert(t, k, at.certName, at.submittedAt)}">`,
      dl: "dlCert",
      a: d.a,
      at: d.at,
    };
    render();
  },
  dlCert: async (d) => {
    const a = asg(d.a),
      t = tr(a.trainingId),
      at = a.attempts.find((x) => x.id === d.at);
    dl(
      await toBlob(renderCert(t, t.type === "test" ? "cert" : "thanks", at.certName, at.submittedAt)),
      `${t.type === "test" ? "sertifikat" : "zahvalnica"}_${user(a.userId).username}.png`,
    );
  },
  dlTest: (d) => {
    const a = asg(d.a),
      at = a.attempts.find((x) => x.id === d.at);
    dl(new Blob([docHtml(a, at)], { type: "text/html" }), `obuka_${user(a.userId).username}.html`);
  },
  start: (d) => {
    const a = asg(d.a),
      t = tr(a.trainingId);
    if (a.attempts.length >= maxAttempts(t, a)) return toast("Iskorišćeni su svi pokušaji.");
    const dr = a.draft;
    S.take = {
      aid: a.id,
      step: dr ? "q" : "intro",
      drawn: dr?.drawn || drawQuestions(t),
      answers: dr ? clone(dr.answers) : {},
      certName: dr?.certName || user(a.userId).name,
      startedAt: dr?.startedAt || null,
      endsAt: dr && t.type === "test" && +t.settings.timeLimit ? Date.now() + t.settings.timeLimit * 60e3 : null,
    };
    go("take");
  },
  takeBegin: () => {
    const k = S.take,
      t = tr(asg(k.aid).trainingId);
    if ($("#certName") && !k.certName.trim()) return toast("Unesite ime i prezime.");
    k.step = "q";
    k.startedAt = S.now;
    if (t.type === "test" && +t.settings.timeLimit) k.endsAt = Date.now() + t.settings.timeLimit * 60e3;
    persistDraft();
    go("take");
  },
  takeSave: () => {
    persistDraft();
    toast("Odgovori su sačuvani.");
    go("c-list");
  },
  takeSubmit: () => {
    const k = S.take,
      t = tr(asg(k.aid).trainingId);
    k.missing = k.drawn.filter((id) => {
      const q = qById(t, id);
      return q.required && q.type !== "text" && !(k.answers[id] || []).length;
    });
    if (k.missing.length) {
      render();
      return toast("Niste odgovorili na sva obavezna pitanja.");
    }
    S.modal = { type: "submit" };
    render();
  },
  takeSubmitNow: () => doSubmit(),
};

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]");
  if (!el) {
    if (S.openMenu) {
      S.openMenu = null;
      render();
    }
    return;
  }
  const fn = A[el.dataset.act];
  if (!fn) return;
  if (el.dataset.act === "bg" || el.dataset.act === "read" || el.dataset.act === "ostalo") {
    fn(el.dataset, el, e);
    return;
  }
  if (["A", "BUTTON"].includes(el.tagName)) e.preventDefault();
  if (S.openMenu && el.dataset.act !== "menu") S.openMenu = null;
  fn(el.dataset, el, e);
});
document.addEventListener("input", (e) => {
  const el = e.target;
  if (el.dataset.bind && S.draft) {
    const v = el.type === "checkbox" ? el.checked : ["number", "range"].includes(el.type) ? +el.value : el.value;
    setPath(S.draft, el.dataset.bind, v);
    const b = el.dataset.bind;
    if (/^(certificate|thankYou)\./.test(b) || b === "title") {
      const img = $("#certPrev");
      if (img) img.src = renderCert(S.draft, S.draft.type === "test" ? "cert" : "thanks", "Ime i prezime", S.now);
    }
    if (["notifyText", "title", "settings.deadlineDays"].includes(b)) {
      const p = $("#notifyPrev");
      if (p) p.textContent = fill(S.draft.notifyText, S.draft, S.now + S.draft.settings.deadlineDays * DAY);
    }
    if (el.type === "checkbox" || el.tagName === "SELECT" || /points|passMark|drawCount/.test(b)) render();
    return;
  }
  if (el.dataset.take) {
    S.take[el.dataset.take] = el.value;
    return;
  }
  if (el.dataset.takeText) {
    S.take.answers[el.dataset.takeText] = el.value;
    persistDraft();
    return;
  }
  if (el.dataset.set) {
    S.settings[el.dataset.set] = el.type === "checkbox" ? el.checked : +el.value;
    save();
  }
});
document.addEventListener("change", (e) => {
  const el = e.target,
    c = el.dataset.chg,
    d = el.dataset;
  if (!c) return;
  if (c === "cashier") {
    S.cashierId = el.value;
    S.take = null;
    go("home");
  } else if (c === "dtype") {
    S.draft.type = el.value;
    render();
  } else if (c === "aud") {
    S.draft.audience.mode = el.value;
    render();
  } else if (c === "audAg") {
    const ids = S.draft.audience.agentIds;
    if (el.checked) ids.push(el.value);
    else ids.splice(ids.indexOf(el.value), 1);
    render();
  } else if (c === "qtype") {
    const q = S.draft.buckets[+d.b].questions[+d.q];
    q.type = el.value;
    if (el.value === "yesno") q.options = [newOpt(q.id, "Da"), newOpt(q.id, "Ne")];
    else if (el.value === "text") q.options = [];
    else if (q.options.length < 2) q.options = [newOpt(q.id, ""), newOpt(q.id, "")];
    if (el.value !== "multi") {
      let f = 0;
      q.options.forEach((o) => {
        if (o.correct && !f) f = 1;
        else o.correct = false;
      });
    }
    render();
  } else if (c === "correct") {
    const q = S.draft.buckets[+d.b].questions[+d.q];
    if (q.type === "multi") q.options[+d.o].correct = el.checked;
    else q.options.forEach((o, i) => (o.correct = i === +d.o));
    render();
  } else if (c === "flagOn") {
    const o = S.draft.buckets[+d.b].questions[+d.q].options[+d.o];
    o.flag.on = el.checked;
    if (el.checked && !o.flag.message) o.flag.message = DEF_FLAG;
    render();
  } else if (c === "upload") {
    const f = el.files[0];
    if (!f) return;
    if (f.size > 4e6) return toast("Slika je veća od 4 MB.");
    const r = new FileReader();
    r.onload = () => {
      S.draft[d.k].image = r.result;
      render();
      toast("Šablon je učitan. Kliknite na sliku da postavite ime.");
    };
    r.readAsDataURL(f);
  } else if (c === "ans") {
    const k = S.take,
      q = qById(tr(asg(k.aid).trainingId), d.q);
    let s = k.answers[d.q] || [];
    s = q.type === "multi" ? (el.checked ? [...s, d.o] : s.filter((x) => x !== d.o)) : [d.o];
    k.answers[d.q] = s;
    if (k.missing) k.missing = k.missing.filter((x) => x !== d.q);
    persistDraft();
    render();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && S.modal) {
    S.modal = null;
    render();
  }
});
setInterval(() => {
  if (S.view === "take" && S.take?.endsAt && S.take.step === "q") {
    const el = $("#timer");
    if (el) el.textContent = timerTxt();
    if (Date.now() >= S.take.endsAt) {
      toast("Vreme je isteklo – test je predat.");
      doSubmit();
    }
  }
}, 1000);

if (!load()) seed();
render();
document.fonts?.ready?.then(() => render());
