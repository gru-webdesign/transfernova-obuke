/* TransferNova · Obuke — views-manager.js
   Ekrani menadžera: zaglavlje, navigacija, Pregled obuka, Nova obuka, Izveštaj obuke, Pregled naloga, Arhiva, Podešavanja.
   Klasična skripta (bez bundlera): fajlovi se učitavaju redom iz index.html i dele globalni opseg. */
/* ---------- 5. EKRANI ---------- */
const I = {
  chev: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="m6 9 6 6 6-6"/></svg>',
  msg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  hist: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>',
  shield:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/></svg>',
  login:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f0a02c" stroke-width="1.8"><path d="M14 4h5v16h-5M10 8l4 4-4 4M14 12H4"/></svg>',
  out: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H8"/></svg>',
  menu: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  phone:
    '<svg width="40" height="40" viewBox="0 0 40 40"><path d="M8 6c2-2 5-2 6 1l2 5c1 2 0 3-1 4l-2 2c2 4 5 7 9 9l2-2c1-1 3-2 4-1l5 2c3 1 3 4 1 6l-3 3C22 37 3 18 5 9z" fill="#333b66"/><rect x="20" y="3" width="17" height="12" rx="2" fill="#333b66"/><path d="M23 7h11M23 10h8" stroke="#fff" stroke-width="1.6"/></svg>',
  mail: '<svg width="40" height="30" viewBox="0 0 40 30"><rect x="1" y="1" width="38" height="28" rx="3" fill="#333b66"/><path d="m3 4 17 13L37 4" stroke="#fff" stroke-width="2.4" fill="none"/></svg>',
  bars: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 20V12M10 20V6M15 20v-9M20 20V9"/></svg>',
  xls: '<svg width="30" height="30" viewBox="0 0 32 32"><rect x="12" y="5" width="16" height="22" rx="1.5" fill="#fff" stroke="#1d6f42" stroke-width="1.6"/><path d="M15 10h10M15 14h10M15 18h10M15 22h10" stroke="#1d6f42" stroke-width="1.4"/><rect x="3" y="8" width="14" height="16" rx="1.5" fill="#1d6f42"/><path d="m6.5 12 7 8M13.5 12l-7 8" stroke="#fff" stroke-width="2"/></svg>',
  cap: '<svg viewBox="0 0 64 64" width="58" height="58"><path d="M32 10 4 24l28 14 28-14z" fill="#333b66"/><path d="M14 30v12c0 5 8 10 18 10s18-5 18-10V30L32 39z" fill="#5c6593"/><path d="M56 25v16" stroke="#333b66" stroke-width="3"/><circle cx="46" cy="46" r="10" fill="#e2672c"/><path d="M41 46l3.5 3.5 6.5-7" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
  users:
    '<svg viewBox="0 0 64 64" width="58" height="58" fill="#333b66"><circle cx="25" cy="20" r="11"/><path d="M6 52c0-11 8.5-18 19-18s19 7 19 18v4H6z"/><circle cx="42" cy="24" r="9" opacity=".85"/><path d="M38 36c9 0 18 5 18 15v5H47v-4c0-6-3-11-9-16z" opacity=".85"/></svg>',
  report:
    '<svg viewBox="0 0 64 64" width="58" height="58"><path d="M14 6h26l12 12v34a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4z" fill="#333b66"/><rect x="18" y="22" width="18" height="3" rx="1.5" fill="#fff"/><rect x="18" y="30" width="22" height="3" rx="1.5" fill="#fff"/><circle cx="46" cy="47" r="11" fill="#e2672c"/><path d="M41 47l4 4 7-8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
  archive:
    '<svg viewBox="0 0 64 64" width="58" height="58" fill="#333b66"><rect x="22" y="6" width="22" height="26" rx="2"/><rect x="26" y="12" width="14" height="2.5" fill="#fff"/><rect x="26" y="18" width="14" height="2.5" fill="#fff"/><path d="M8 28h48v24a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z"/><rect x="34" y="38" width="16" height="12" rx="2" fill="#fff"/></svg>',
  hand: '<svg viewBox="0 0 64 64" width="58" height="58" fill="#333b66"><rect x="14" y="14" width="34" height="18" rx="3"/><circle cx="31" cy="23" r="5" fill="#fff"/><path d="M6 44c6-6 14-7 20-4l10 2c3 1 3 5 0 5H24h12l14-7c3-1 6 2 3 5L38 56H6z"/></svg>',
  plane:
    '<svg viewBox="0 0 64 64" width="58" height="58" fill="#333b66"><path d="M56 6 8 30l16 6 4 18 8-12 12 8z"/><path d="M24 36 56 6 30 40z" fill="#5c6593"/><circle cx="30" cy="18" r="8" fill="#fff" stroke="#333b66" stroke-width="3"/></svg>',
  lock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
};

function header() {
  $("#header").innerHTML = `<div class="flex items-center justify-between gap-4 px-5 sm:px-10 py-2.5 bg-white">
 <svg width="155" height="38" viewBox="0 0 155 38" aria-label="TransferNova"><text x="0" y="27" font-family="Nunito Sans,sans-serif" font-weight="800" font-size="23" fill="#333b66">TransferNova</text><path d="M58 8c10-8 28-8 34 3" stroke="#e2672c" stroke-width="2.6" fill="none"/><path d="M60 32c10 6 26 5 32-4" stroke="#e2672c" stroke-width="2.2" fill="none"/></svg>
 <div class="hidden md:flex items-center gap-3">${I.phone}<div class="text-center leading-tight"><div class="serif font-bold text-[15px]">TransferNova podrška</div><div class="serif font-bold text-[14px]" style="color:var(--or)">011/4230-201 <span style="color:var(--ink)">/</span> 011/4230-196</div></div></div>
 <div class="hidden lg:flex items-center gap-3">${I.mail}<span class="serif font-bold text-[17px]" style="color:var(--or)">support@transfernova.com</span></div></div>`;
}
function counts() {
  let open = 0,
    corr = 0,
    over = 0;
  for (const a of S.assignments) {
    if (tr(a.trainingId).status !== "sent") continue;
    for (const f of flagsOf(a)) {
      if (f.status === "open") open++;
      if (f.status === "corrected") corr++;
    }
    if (aStatus(a) === "overdue") over++;
  }
  return { open, corr, over };
}
function navItem(label, key, items) {
  if (!items.length) return "";
  const on = S.openMenu === key;
  if (typeof items === "string") return `<a class="navlink" data-act="${items}">${label}</a>`;
  return `<div class="relative"><a class="navlink ${on ? "on" : ""}" data-act="menu" data-k="${key}">${label} ${I.chev}</a>${on ? `<div class="dd">${items.map(([l, a]) => `<a data-act="${a}">${l}</a>`).join("")}</div>` : ""}</div>`;
}
function nav() {
  const m = S.role === "manager",
    c = counts();
  const u = user(S.cashierId);
  const unread = m ? 0 : S.messages.filter((x) => x.userId === u.id && x.channel === "app" && !x.read).length;
  const obM = [
    ["Nova obuka", "new"],
    ["Pregled obuka", 'go" data-v="list'],
    ["Arhiva obuka", 'go" data-v="archive'],
    ["Podešavanja obuka", 'go" data-v="settings'],
  ];
  const items = m
    ? [
        navItem("Klijenti", "k", "soon"),
        navItem("Izveštaj", "iz", [["Izveštaj", "soon"]]),
        navItem("Ekspoziture", "ek", [["Dodavanje ekspoziture", "soon"]]),
        navItem("Arhiva", "ar", "soon"),
        navItem("Korisnički Servis", "ks", [
          ["Promena Lozinke", "soon"],
          ["Dokumenta", "soon"],
        ]),
        navItem("Admin", "ad", [["Korisnici", "soon"]]),
        navItem("Obuke", "ob", obM),
      ]
    : [
        navItem("Isplata Novca", "i", "cashop"),
        navItem("Slanje Novca", "s", "cashop"),
        navItem("Izveštaj", "iz", [["Izveštaj", "soon"]]),
        navItem("Korisnički Servis", "ks", [
          ["Promena Lozinke", "soon"],
          ["Dokumentacija", "soon"],
        ]),
        navItem("Obuke", "ob", [
          ["Moje obuke", 'go" data-v="c-list'],
          ["Poruke", 'go" data-v="inbox'],
        ]),
      ];
  const icons = m
    ? [
        ["msg", c.corr, "Korekcije na proveri", "flags"],
        ["hist", c.over, "Istekli rokovi", "list"],
        ["shield", c.open, "Otvoreni flagovi", "flags"],
      ]
        .map(
          ([i, n, t, v]) =>
            `<button class="relative text-white" title="${t}" data-act="${v === "flags" ? "goFlags" : "go"}" data-v="${v}">${I[i]}<span class="badge">${n}</span></button>`,
        )
        .join("")
    : `<button class="relative text-white" title="Poruke" data-act="go" data-v="inbox">${I.msg}${unread ? `<span class="badge">${unread}</span>` : ""}</button>${I.login}`;
  $("#nav").innerHTML =
    `<div style="background:var(--navy)"><div class="flex items-center"><button class="xl:hidden text-white p-3" data-act="burger" aria-label="Meni">${I.menu}</button><div class="hidden xl:flex items-center pl-2">${items.join("")}</div>
 <div class="ml-auto flex items-center gap-6 pr-5 py-3"><span class="hidden sm:inline text-[#c5c9df] text-sm">Dobrodošli: ${esc(m ? ME : u.name)}</span>${icons}<button class="text-white" data-act="soon" title="Odjava">${I.out}</button></div></div>
 ${S.burger ? `<div class="xl:hidden border-t border-[#46507f] pb-2 [&_.dd]:static [&_.dd]:shadow-none [&_.dd]:pl-4">${items.join("")}</div>` : ""}</div>`;
}
function simBar() {
  const opts = S.agents
    .map(
      (a) =>
        `<optgroup label="${esc(a.name)}">${S.users
          .filter((u) => u.agentId === a.id)
          .map(
            (u) =>
              `<option value="${u.id}" ${u.id === S.cashierId ? "selected" : ""}>${esc(u.name)}${u.active ? "" : " (neaktivan)"}${u.blocked ? " – blokiran" : ""}</option>`,
          )
          .join("")}</optgroup>`,
    )
    .join("");
  $("#sim").innerHTML =
    `<div class="sim flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1"><span class="font-extrabold tracking-wider uppercase text-[11px]">Simulacija</span>
 <span>Prikaz: <button class="${S.role === "manager" ? "underline" : ""}" data-act="role" data-r="manager">Menadžer</button> · <button class="${S.role === "cashier" ? "underline" : ""}" data-act="role" data-r="cashier">Blagajnik</button></span>
 ${S.role === "cashier" ? `<select class="border rounded px-1 py-0.5 bg-white" data-chg="cashier" aria-label="Blagajnik">${opts}</select>` : ""}
 <span>Datum: <b class="num">${fmtD(S.now)}</b> <button data-act="time" data-d="1">+1 dan</button> · <button data-act="time" data-d="5">+5 dana</button></span>
 <span class="ml-auto"><button data-act="modal" data-m="outbox">Poslata pošta (${S.messages.filter((m) => m.channel === "email").length})</button> · <button data-act="modal" data-m="reset">Reset</button></span></div>`;
}

const tbar = (title, right = "") => `<div class="tbar"><h1 class="mr-auto">${title}</h1>${right}</div>`;
const fr = (label, html, req) =>
  `<div class="frow"><label>${label}${req ? ' <span class="req">*</span>' : ""}</label><div>${html}</div></div>`;
function pager(page, pages, act, total) {
  return `<div class="flex items-center justify-between gap-2 mt-3 text-sm"><span class="s-mute num">Ukupno: ${total}</span><div class="flex items-center gap-2"><button class="btn btn-o btn-sm" data-act="${act}" data-p="${page - 1}" ${page <= 1 ? "disabled" : ""}>‹</button><span class="num">${page} / ${pages}</span><button class="btn btn-o btn-sm" data-act="${act}" data-p="${page + 1}" ${page >= pages ? "disabled" : ""}>›</button></div></div>`;
}
const homeCard = (icon, title, act, extra = "") =>
  `<button class="tcard text-center p-6 flex flex-col items-center gap-4 relative" data-act="${act}"><div class="circ w-[110px] h-[110px]">${icon}</div><div class="serif font-bold text-xl sm:text-2xl">${title}</div>${extra}</button>`;

/* --- Menadžer: početna --- */
function vHome() {
  return `<div class="grid grid-cols-2 lg:grid-cols-4 gap-5 max-w-[1000px] mx-auto px-4 pt-8">${homeCard(I.users, "Korisnici", "soon")}${homeCard(I.report, "Izveštaji", "soon")}${homeCard(I.archive, "Arhiva", "soon")}${homeCard(I.cap, "Obuke", 'go" data-v="list')}</div>`;
}

/* --- Menadžer: Pregled obuka --- */
function rowsFor(t) {
  return S.assignments
    .filter((a) => a.trainingId === t.id)
    .map((a) => {
      const u = user(a.userId);
      return { a, u, ag: agent(u.agentId), st: aStatus(a), last: finalAtt(a), flags: flagsOf(a), late: isLate(a) };
    });
}
function kpis(rows) {
  const k = { n: rows.length, ok: 0, bad: 0, over: 0, prog: 0, open: 0, corr: 0 };
  for (const r of rows) {
    if (["passed", "completed"].includes(r.st)) k.ok++;
    if (r.st === "failed") k.bad++;
    if (r.st === "overdue") k.over++;
    if (["in_progress", "not_started", "failed_retry"].includes(r.st)) k.prog++;
    k.open += r.flags.filter((f) => f.status === "open").length;
    k.corr += r.flags.filter((f) => f.status === "corrected").length;
  }
  k.done = k.ok + k.bad;
  return k;
}
function vList() {
  const f = S.lf;
  let list = S.trainings.slice().sort((a, b) => (b.sentAt || b.createdAt) - (a.sentAt || a.createdAt));
  if (f.ap) {
    list = list.filter((t) => {
      const d = t.sentAt || t.createdAt;
      return (
        (!f.ap.od || d >= new Date(f.ap.od).getTime()) &&
        (!f.ap.do || d < new Date(f.ap.do).getTime() + DAY) &&
        (f.ap.tip === "all" || t.type === f.ap.tip) &&
        (f.ap.st === "all" || t.status === f.ap.st)
      );
    });
  }
  return (
    tbar("Pregled obuka", `<button class="btn btn-n" data-act="new">+ Nova obuka</button>`) +
    `<div class="px-4 sm:px-6 pt-5 grid gap-5">
 <div class="filt"><div class="filt-h">Filteri <button class="btn-w" data-act="listSearch">Pretraži</button></div><div class="p-5 grid sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_1.2fr] gap-4 items-end">
 <div><div class="flab mb-1">Period</div><div class="fsub">Od datuma</div><input type="date" class="fin" id="lf-od" value="${f.od}"></div><div><div class="fsub">Do datuma</div><input type="date" class="fin" id="lf-do" value="${f.do}"></div>
 <div><div class="flab mb-1">Obuka</div><div class="fsub">Tip</div><select class="fin" id="lf-tip">${[
   ["all", "---"],
   ["test", "Test"],
   ["survey", "Upitnik"],
 ]
   .map(([v, l]) => `<option value="${v}" ${f.tip === v ? "selected" : ""}>${l}</option>`)
   .join("")}</select></div>
 <div><div class="fsub">Status</div><select class="fin" id="lf-st">${[
   ["all", "---"],
   ["draft", "Nacrt"],
   ["sent", "Aktivna"],
   ["closed", "Zatvorena"],
 ]
   .map(([v, l]) => `<option value="${v}" ${f.st === v ? "selected" : ""}>${l}</option>`)
   .join("")}</select></div></div></div>
 <div class="tblwrap"><table class="grid-tbl min-w-[920px]"><thead><tr><th>Naziv obuke</th><th>Tip</th><th>Kategorija</th><th>Status</th><th>Kreirano</th><th>Poslato</th><th>Rok</th><th>Dodeljeno</th><th>Završeno</th><th>Flagovi</th><th></th></tr></thead><tbody>
 ${
   list
     .map((t) => {
       const k = kpis(rowsFor(t));
       return `<tr><td><a data-act="${t.status === "draft" ? "edit" : "open"}" data-id="${t.id}">${esc(t.title || "(bez naziva)")}</a></td><td>${t.type === "test" ? "Test" : "Upitnik"}</td><td>${esc(t.category)}</td><td>${t.status === "draft" ? '<span class="s-mute">Nacrt</span>' : t.status === "closed" ? "Zatvorena" : '<span class="s-ok">Aktivna</span>'}</td>
 <td class="num">${fmtD(t.createdAt)}</td><td class="num">${t.sentAt ? fmtD(t.sentAt) : "—"}</td><td class="num">${t.deadlineAt ? `<span class="${t.status === "sent" && daysLeft(t.deadlineAt) < 0 ? "s-bad" : ""}">${fmtD(t.deadlineAt)}</span>` : t.settings.deadlineDays + " dana"}</td>
 <td class="num">${t.status === "draft" ? "—" : k.n}</td><td class="num">${t.status === "draft" ? "—" : `${k.done}/${k.n}`}</td><td class="num ${k.open ? "s-bad" : ""}">${t.status === "draft" ? "—" : k.open}</td>
 <td class="whitespace-nowrap text-right">${t.status === "draft" ? `<button class="btn btn-n btn-sm" data-act="edit" data-id="${t.id}">Uredi</button> <button class="btn btn-r btn-sm" data-act="delDraft" data-id="${t.id}">Obriši</button>` : `<button class="btn btn-n btn-sm" data-act="open" data-id="${t.id}">Izveštaj</button>`} <button class="btn btn-o btn-sm" data-act="dup" data-id="${t.id}">Kopiraj</button></td></tr>`;
     })
     .join("") ||
   `<tr><td colspan="11" class="text-center py-10"><div class="serif text-base mb-3">Još nema kreiranih obuka.</div><button class="btn btn-n" data-act="new">+ Kreiraj prvu obuku</button></td></tr>`
 }</tbody></table></div></div>`
  );
}

/* --- Menadžer: Nova obuka / izmena --- */
function vBuilder() {
  const d = S.draft,
    isT = d.type === "test",
    act = S.users.filter((u) => u.active),
    aud = audUsers(d).length;
  const inp = (p, type = "text", x = "") =>
    `<input class="fin" id="d-${p}" type="${type}" data-bind="${p}" value="${esc(getPath(d, p))}" ${x}>`;
  const chk = (p, l) =>
    `<label class="chk"><input type="checkbox" data-bind="${p}" ${getPath(d, p) ? "checked" : ""}> ${l}</label>`;
  const dk = isT ? "certificate" : "thankYou",
    c = d[dk];
  return (
    tbar(
      d.sentAt ? "Obuka" : S.trainings.some((t) => t.id === d.id) ? "Izmena obuke" : "Dodavanje obuke",
      `<button class="btn btn-o" data-act="saveDraft">Sačuvaj nacrt</button><button class="btn btn-o" data-act="modal" data-m="preview">Pregled</button><button class="btn btn-n" data-act="sendConfirm">Pošalji</button>`,
    ) +
    `<div class="px-4 sm:px-6 pt-5 grid gap-5">
 <div class="grid lg:grid-cols-[1.15fr_1fr] gap-5 items-start">
  <div class="box"><h2>Podaci o obuci</h2>
   ${fr("Tip obuke", `<select class="fin" data-chg="dtype"><option value="test" ${isT ? "selected" : ""}>Test (sa bodovanjem)</option><option value="survey" ${!isT ? "selected" : ""}>Upitnik (bez bodovanja)</option></select>`, 1)}
   ${fr("Naziv", inp("title", "text", 'placeholder="npr. AML/CFT obuka zastupnika 2026"'), 1)}
   ${fr("Kategorija", `<select class="fin" data-bind="category">${["Obuka zastupnika", "Obuka menjača", "Posredna kontrola", "Procedure postupanja", "Ostalo"].map((x) => `<option ${x === d.category ? "selected" : ""}>${x}</option>`).join("")}</select>`)}
   ${fr("Pravni osnov", inp("settings.regulatoryRef", "text", 'placeholder="npr. Zakon o platnim uslugama"'))}
   ${fr("Rok za izradu (dana)", inp("settings.deadlineDays", "number", 'min="1"'), 1)}
   ${isT ? fr("Prag za prolaz (%)", inp("settings.passMark", "number", 'min="1" max="100"'), 1) + fr("Broj pokušaja", inp("settings.attempts", "number", 'min="1" max="9"'), 1) + fr("Vreme za izradu (min)", inp("settings.timeLimit", "number", 'min="0" placeholder="0 = bez ograničenja"')) : ""}
   ${fr("Opis", `<textarea class="fin" data-bind="description" id="d-desc" rows="2">${esc(d.description)}</textarea>`)}
   ${fr("Materijal obuke", `<textarea class="fin" data-bind="material" id="d-mat" rows="4" placeholder="Tekst koji blagajnik čita pre početka">${esc(d.material)}</textarea>`)}</div>
  <div class="grid gap-5">
   <div class="box"><h2>Podešavanja</h2>${chk("settings.shuffle", "Nasumičan redosled pitanja")}${isT ? chk("settings.showFeedback", "Prikaži netačne odgovore nakon predaje") + chk("settings.partialCredit", "Delimični bodovi kod više tačnih odgovora") : ""}${chk("settings.autoBlock", "Automatska blokada naloga po isteku roka")}${chk(dk + ".enabled", isT ? "Izdaj sertifikat za položen test" : "Izdaj zahvalnicu")}
    ${isT ? `<div class="text-sm s-mute serif mt-2">Ukupno bodova: <b class="num" style="color:var(--ink)">${maxPts(d)}</b> · za prolaz najmanje <b class="num" style="color:var(--ink)">${Math.round(maxPts(d) * d.settings.passMark) / 100}</b></div>` : ""}</div>
   ${
     c.enabled
       ? `<div class="box"><h2>${isT ? "Sertifikat" : "Zahvalnica"} <label class="btn btn-o btn-sm cursor-pointer font-sans">Učitaj PNG<input type="file" accept="image/png,image/jpeg" class="hidden" data-chg="upload" data-k="${dk}"></label></h2>
    <div class="cursor-crosshair rounded border" style="border-color:var(--line)" data-act="place" data-k="${dk}"><img id="certPrev" class="w-full block rounded" alt="Pregled" src="${renderCert(d, isT ? "cert" : "thanks", "Ime i prezime", S.now)}"></div>
    <div class="text-xs s-mute mt-1 mb-3">Kliknite na sliku da postavite polje za ime. Ime upisuje blagajnik pre početka.${c.image ? ` <a class="lnk" data-act="clearImg" data-k="${dk}">Vrati podrazumevani šablon</a>` : ""}</div>
    ${fr("Veličina slova", `<input type="range" min="18" max="80" class="w-full" style="accent-color:var(--or)" data-bind="${dk}.fontSize" value="${c.fontSize}">`)}
    ${fr("Boja imena", `<input type="color" data-bind="${dk}.color" value="${c.color}">`)}
    ${chk(dk + ".showTitle", "Naziv obuke ispod imena")}${chk(dk + ".showDate", "Datum izdavanja")}
    ${!isT ? fr("Tekst zahvalnice", `<textarea class="fin" rows="2" data-bind="thankYou.text" id="d-ty">${esc(c.text)}</textarea>`) : ""}</div>`
       : ""
   }
  </div></div>
 <div class="box"><h2>Pitanja <span class="text-sm font-normal s-mute num">${allQs(d).length} pitanja · ${d.buckets.length} buketa</span></h2>
  ${d.buckets.map((b, bi) => bucketEd(d, b, bi)).join("")}
  <button class="btn btn-o" data-act="addBucket">+ Dodaj buket pitanja</button></div>
 <div class="grid lg:grid-cols-2 gap-5 items-start">
  <div class="box"><h2>Obaveštenje blagajniku</h2>
   <textarea class="fin" rows="5" data-bind="notifyText" id="d-notify">${esc(d.notifyText)}</textarea>
   <div class="text-xs s-mute mt-1 mb-3">Zamene: {tip} · {naziv} · {dana} · {rok}</div>
   <div class="notice p-3 text-sm serif" id="notifyPrev">${esc(fill(d.notifyText, d, S.now + d.settings.deadlineDays * DAY))}</div></div>
  <div class="box"><h2>Primaoci</h2>
   <label class="chk"><input type="radio" name="aud" data-chg="aud" value="all" ${d.audience.mode === "all" ? "checked" : ""}> Svi aktivni blagajnički nalozi (${act.length})</label>
   <label class="chk"><input type="radio" name="aud" data-chg="aud" value="agents" ${d.audience.mode === "agents" ? "checked" : ""}> Izabrani agenti</label>
   ${d.audience.mode === "agents" ? `<div class="grid sm:grid-cols-2 gap-x-4 mt-2 pl-7">${S.agents.map((a) => `<label class="chk !font-normal !text-sm"><input type="checkbox" data-chg="audAg" value="${a.id}" ${d.audience.agentIds.includes(a.id) ? "checked" : ""}> ${esc(a.name)} <span class="s-mute num">(${act.filter((u) => u.agentId === a.id).length})</span></label>`).join("")}</div>` : ""}
   <div class="serif text-sm mt-3">Biće poslato na <b class="num">${aud}</b> naloga (obaveštenje u aplikaciji i e-mail). Neaktivni nalozi se ne uključuju.</div></div></div>
 </div>`
  );
}
const maxPts = (t) =>
  t.buckets.reduce((s, b) => {
    const qs = b.questions
      .filter((q) => q.type !== "text")
      .map((q) => +q.points || 0)
      .sort((a, c) => c - a);
    return s + (b.drawCount > 0 && b.drawCount < qs.length ? qs.slice(0, b.drawCount) : qs).reduce((a, c) => a + c, 0);
  }, 0);
function bucketEd(d, b, bi) {
  const isT = d.type === "test";
  return `<div class="mb-6 pb-5" style="border-bottom:1px dashed var(--line)">
 <div class="grid sm:grid-cols-[1fr_220px_auto] gap-3 items-end mb-4"><div><div class="fsub">Naziv buketa</div><input class="fin" id="d-b${bi}" data-bind="buckets.${bi}.name" value="${esc(b.name)}"></div>
 <div><div class="fsub">Izvuci nasumično (0 = sva pitanja)</div><input class="fin" type="number" min="0" id="d-bd${bi}" data-bind="buckets.${bi}.drawCount" value="${b.drawCount}"></div><button class="btn btn-r" data-act="delBucket" data-b="${bi}">Ukloni buket</button></div>
 ${b.questions
   .map(
     (q, qi) => `<div class="rounded-lg p-3 sm:p-4 mb-3" style="background:#f9fafc;border:1px solid #e3e6ef">
  <div class="flex flex-wrap items-center gap-2 mb-2"><span class="flbl">Pitanje ${qi + 1}</span>
   <select class="fin !w-auto !min-h-[34px] !py-1 text-sm" data-chg="qtype" data-b="${bi}" data-q="${qi}">${[
     ["single", "Jedan odgovor"],
     ["multi", "Više odgovora"],
     ["yesno", "Da / Ne"],
     ["text", "Slobodan tekst"],
   ]
     .map(([v, l]) => `<option value="${v}" ${q.type === v ? "selected" : ""}>${l}</option>`)
     .join("")}</select>
   ${isT && q.type !== "text" ? `<span class="text-sm serif">Bodovi <input class="fin !w-20 !min-h-[34px] !py-1" type="number" min="0" step="0.5" id="d-qp${bi}_${qi}" data-bind="buckets.${bi}.questions.${qi}.points" value="${q.points}"></span>` : ""}
   <label class="text-sm serif flex items-center gap-1.5"><input type="checkbox" style="accent-color:var(--navy)" data-bind="buckets.${bi}.questions.${qi}.required" ${q.required ? "checked" : ""}> Obavezno</label>
   <span class="ml-auto flex gap-1"><button class="btn btn-o btn-sm" data-act="mvQ" data-b="${bi}" data-q="${qi}" data-dir="-1" aria-label="Gore">↑</button><button class="btn btn-o btn-sm" data-act="mvQ" data-b="${bi}" data-q="${qi}" data-dir="1" aria-label="Dole">↓</button><button class="btn btn-r btn-sm" data-act="delQ" data-b="${bi}" data-q="${qi}">Obriši</button></span></div>
  <textarea class="fin !min-h-[52px]" rows="2" id="d-q${bi}_${qi}" data-bind="buckets.${bi}.questions.${qi}.text" placeholder="Tekst pitanja">${esc(q.text)}</textarea>
  ${
    q.type === "text"
      ? ""
      : `<div class="tblwrap mt-3"><table class="grid-tbl min-w-[560px]"><thead><tr><th>Ponuđeni odgovor</th>${isT ? '<th class="w-[70px]">Tačan</th>' : ""}<th class="w-[70px]">Flag</th><th class="w-[40px]"></th></tr></thead><tbody>
  ${q.options
    .map((o, oi) => {
      const p = `buckets.${bi}.questions.${qi}.options.${oi}`;
      return `<tr><td><input class="fin !min-h-[36px] !py-1" id="d-o${bi}_${qi}_${oi}" data-bind="${p}.text" value="${esc(o.text)}" placeholder="Odgovor"></td>
   ${isT ? `<td class="text-center"><input type="${q.type === "multi" ? "checkbox" : "radio"}" name="c${bi}_${qi}" style="accent-color:var(--green);width:18px;height:18px" data-chg="correct" data-b="${bi}" data-q="${qi}" data-o="${oi}" ${o.correct ? "checked" : ""} aria-label="Tačan"></td>` : ""}
   <td class="text-center"><input type="checkbox" style="accent-color:var(--red);width:18px;height:18px" data-chg="flagOn" data-b="${bi}" data-q="${qi}" data-o="${oi}" ${o.flag.on ? "checked" : ""} aria-label="Flag"></td>
   <td>${q.type !== "yesno" ? `<button class="s-bad px-1" data-act="delOpt" data-b="${bi}" data-q="${qi}" data-o="${oi}" aria-label="Obriši">✕</button>` : ""}</td></tr>
   ${
     o.flag.on
       ? `<tr><td colspan="${isT ? 4 : 3}" style="background:#fdf3f0"><div class="grid sm:grid-cols-[170px_1fr] gap-3"><div><div class="fsub">Ozbiljnost</div><select class="fin !min-h-[36px] !py-1" data-bind="${p}.flag.severity">${Object.entries(
           SEV,
         )
           .map(([v, l]) => `<option value="${v}" ${o.flag.severity === v ? "selected" : ""}>${l}</option>`)
           .join("")}</select>
   <label class="text-xs flex items-center gap-1.5 mt-2"><input type="checkbox" style="accent-color:var(--red)" data-bind="${p}.flag.regulatory" ${o.flag.regulatory ? "checked" : ""}> Zahtev regulatora</label></div>
   <div><div class="fsub">Smernica za korekciju – šalje se blagajniku u aplikaciju i na e-mail</div><textarea class="fin !min-h-[64px]" rows="3" id="d-f${bi}_${qi}_${oi}" data-bind="${p}.flag.message">${esc(o.flag.message)}</textarea></div></div></td></tr>`
       : ""
   }`;
    })
    .join("")}</tbody></table></div>
  ${q.type !== "yesno" ? `<button class="btn btn-o btn-sm mt-2" data-act="addOpt" data-b="${bi}" data-q="${qi}">+ Odgovor</button>` : ""}`
  }</div>`,
   )
   .join("")}
 <button class="btn btn-n btn-sm" data-act="addQ" data-b="${bi}">+ Pitanje</button></div>`;
}

/* --- Menadžer: Izveštaj obuke --- */
function vReport(t) {
  const all = rowsFor(t),
    k = kpis(all),
    f = S.rf;
  const isT = t.type === "test";
  const views = [
    ["nalozi", "Nalozi"],
    ["flagovi", "Flagovi"],
    ["pitanja", "Analiza pitanja"],
    ["agenti", "Po agentima"],
  ];
  return (
    tbar(
      "Izveštaj obuke: " + esc(t.title),
      `<a class="ic" data-act="rv" data-v="pitanja" title="Analiza pitanja">${I.bars}</a><a class="ic" data-act="csv" title="Izvoz u Excel (CSV)">${I.xls}</a>`,
    ) +
    `<div class="px-4 sm:px-6 pt-5 grid gap-5">
 <div class="box !py-3"><div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-x-4 gap-y-2 serif text-sm">${[
   ["Tip", isT ? "Test" : "Upitnik"],
   ["Poslato", fmtD(t.sentAt)],
   ["Rok", fmtD(t.deadlineAt)],
   ["Dodeljeno", k.n],
   ["Završeno", k.done + "/" + k.n],
   [isT ? "Položilo" : "Popunjeno", k.ok],
   ["Rok istekao", k.over],
   ["Otvoreni flagovi", k.open],
 ]
   .map(([l, v]) => `<div><div class="fsub">${l}</div><b class="num">${v}</b></div>`)
   .join("")}</div></div>
 <div class="filt"><div class="filt-h">Filteri <button class="btn-w" data-act="repSearch">Pretraži</button></div><div class="p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <div><div class="fsub">Agent</div><select class="fin" id="rf-agent"><option value="all">---</option>${S.agents.map((a) => `<option value="${a.id}" ${f.agent === a.id ? "selected" : ""}>${esc(a.name)}</option>`).join("")}</select></div>
  <div><div class="fsub">Status</div><select class="fin" id="rf-st"><option value="all">---</option>${Object.entries(ST)
    .filter(([s]) => (isT ? s !== "completed" : !["passed", "failed", "failed_retry"].includes(s)))
    .map(([s, v]) => `<option value="${s}" ${f.st === s ? "selected" : ""}>${v[0]}</option>`)
    .join(
      "",
    )}<option value="late" ${f.st === "late" ? "selected" : ""}>Završeno posle roka</option><option value="blocked" ${f.st === "blocked" ? "selected" : ""}>Blokiran nalog</option></select></div>
  <div><div class="fsub">Flag</div><select class="fin" id="rf-flag">${[
    ["all", "---"],
    ["any", "Sa flagom"],
    ["open", "Otvoren flag"],
    ["corrected", "Korigovano – na proveri"],
    ["none", "Bez flaga"],
  ]
    .map(([v, l]) => `<option value="${v}" ${f.flag === v ? "selected" : ""}>${l}</option>`)
    .join("")}</select></div>
  <div><div class="fsub">Ime blagajnika</div><input class="fin" id="rf-q" value="${esc(f.q)}"></div></div>
  <details class="border-t px-5 py-3" style="border-color:#eceef4" ${S.ostalo ? "open" : ""}><summary class="flab cursor-pointer" data-act="ostalo">Ostalo ▾</summary><div class="flex flex-wrap gap-2 mt-3">
   <button class="btn btn-o btn-sm" data-act="bulkRemind">Pošalji podsetnik svima koji nisu završili</button><button class="btn btn-o btn-sm" data-act="bulkExtend">Produži rok +7 dana</button><button class="btn btn-r btn-sm" data-act="bulkBlock">Blokiraj naloge sa isteklim rokom</button>${t.status === "sent" ? `<button class="btn btn-o btn-sm" data-act="closeT">Zatvori obuku</button>` : ""}</div></details></div>
 <div class="seg">${views.map(([v, l]) => `<a class="${S.rv === v ? "on" : ""}" data-act="rv" data-v="${v}">${l}</a>`).join("")}</div>
 ${S.rv === "nalozi" ? repAccounts(t, all) : S.rv === "flagovi" ? repFlags(t, all) : S.rv === "pitanja" ? repQuestions(t, all) : repAgents(t, all)}</div>`
  );
}
function filterRows(all) {
  const f = S.rf,
    q = tr8(f.q.toLowerCase());
  return all.filter(
    (x) =>
      (f.agent === "all" || x.ag.id === f.agent) &&
      (f.st === "all" || x.st === f.st || (f.st === "late" && x.late) || (f.st === "blocked" && x.u.blocked)) &&
      (f.flag === "all" ||
        (f.flag === "any" && x.flags.length) ||
        (f.flag === "none" && !x.flags.length) ||
        x.flags.some((z) => z.status === f.flag)) &&
      (!q || tr8(x.u.name.toLowerCase()).includes(q)),
  );
}
function repAccounts(t, all) {
  const r = filterRows(all).sort((a, b) => a.ag.name.localeCompare(b.ag.name) || a.u.name.localeCompare(b.u.name));
  const per = 25,
    pages = Math.max(1, Math.ceil(r.length / per));
  const pg = Math.min(S.rf.page, pages);
  return `<div class="tblwrap"><table class="grid-tbl min-w-[980px]"><thead><tr><th>Blagajnik</th><th>Korisničko ime</th><th>Agent</th><th>Status</th><th>Rezultat</th><th>Pokušaji</th><th>Flagovi</th><th>Predato</th><th>Rok</th><th>Nalog</th></tr></thead><tbody>
 ${
   r
     .slice((pg - 1) * per, pg * per)
     .map(
       (
         x,
       ) => `<tr><td><a data-act="acc" data-id="${x.a.id}">${esc(x.u.name)}</a></td><td>${esc(x.u.username)}</td><td>${esc(x.ag.name)}</td><td>${stTxt(x.st)}${x.late ? ' <span class="s-warn">(posle roka)</span>' : ""}</td>
 <td class="num">${x.last?.pct != null ? `<span class="${x.last.passed ? "s-ok" : "s-bad"}">${x.last.pct}%</span>` : x.last ? "✓" : "—"}</td><td class="num">${x.a.attempts.length}${t.type === "test" ? "/" + maxAttempts(t, x.a) : ""}</td>
 <td class="num">${x.flags.length ? `<span class="${x.flags.some((f) => f.status === "open") ? "s-bad" : "s-warn"}">${x.flags.filter((f) => f.status !== "closed").length} / ${x.flags.length}</span>` : "—"}</td><td class="num">${x.last ? fmtDT(x.last.submittedAt) : "—"}</td><td class="num">${fmtD(x.a.deadlineAt)}</td><td>${x.u.blocked ? '<span class="s-bad">Blokiran</span>' : "Aktivan"}</td></tr>`,
     )
     .join("") || '<tr><td colspan="10" class="text-center py-6 s-mute">Nema rezultata za izabrane filtere.</td></tr>'
 }</tbody></table></div>${pager(pg, pages, "rpage", r.length)}`;
}
function repFlags(t, all) {
  const items = filterRows(all)
    .flatMap((x) => x.flags.map((f) => ({ ...f, x })))
    .sort((a, b) => ({ corrected: 0, open: 1, closed: 2 })[a.status] - { corrected: 0, open: 1, closed: 2 }[b.status]);
  const sys = filterRows(all).filter((x) => ["overdue", "failed"].includes(x.st) || x.late);
  return `<div class="tblwrap"><table class="grid-tbl min-w-[980px]"><thead><tr><th>Blagajnik</th><th>Agent</th><th>Pitanje</th><th>Odgovor</th><th>Ozbiljnost</th><th>Status</th><th>Napomena blagajnika</th><th></th></tr></thead><tbody>
 ${
   items
     .map(
       (
         f,
       ) => `<tr><td><a data-act="acc" data-id="${f.x.a.id}">${esc(f.x.u.name)}</a></td><td>${esc(f.x.ag.name)}</td><td class="max-w-[300px]">${esc(f.question)}</td><td class="s-bad">${esc(f.answer)}</td><td>${SEV[f.severity]}${f.regulatory ? " · regulator" : ""}</td><td class="${FST[f.status][1]}">${FST[f.status][0]}</td><td>${esc(f.note) || "—"}</td>
 <td class="whitespace-nowrap text-right">${f.status !== "closed" ? `<button class="btn btn-n btn-sm" data-act="fClose" data-a="${f.x.a.id}" data-f="${f.id}">Zatvori</button> <button class="btn btn-o btn-sm" data-act="fResend" data-a="${f.x.a.id}" data-f="${f.id}">Ponovo pošalji</button>` : `<button class="btn btn-o btn-sm" data-act="fReopen" data-a="${f.x.a.id}" data-f="${f.id}">Ponovo otvori</button>`}</td></tr>`,
     )
     .join("") || '<tr><td colspan="8" class="text-center py-6 s-mute">Nema flagova na odgovorima.</td></tr>'
 }</tbody></table></div>
 <div class="flbl mt-2">Sistemski flagovi</div><div class="tblwrap"><table class="grid-tbl min-w-[620px]"><thead><tr><th>Blagajnik</th><th>Agent</th><th>Razlog</th><th>Nalog</th></tr></thead><tbody>${sys.map((x) => `<tr><td><a data-act="acc" data-id="${x.a.id}">${esc(x.u.name)}</a></td><td>${esc(x.ag.name)}</td><td class="${x.late && x.st !== "overdue" ? "s-warn" : "s-bad"}">${x.st === "overdue" ? "Rok istekao" : x.st === "failed" ? "Iskorišćeni svi pokušaji" : "Završeno posle roka"}</td><td>${x.u.blocked ? '<span class="s-bad">Blokiran</span>' : "Aktivan"}</td></tr>`).join("") || '<tr><td colspan="4" class="text-center py-6 s-mute">Nema sistemskih flagova.</td></tr>'}</tbody></table></div>`;
}
function repQuestions(t, all) {
  const done = filterRows(all).filter((x) => x.last);
  if (!done.length)
    return '<div class="box serif text-sm s-mute">Analiza je dostupna kada blagajnici počnu da predaju odgovore.</div>';
  return `<div class="tblwrap"><table class="grid-tbl min-w-[760px]"><thead><tr><th>Buket</th><th>Pitanje / odgovor</th><th>Broj</th><th>Udeo</th><th class="w-[200px]"></th></tr></thead><tbody>${allQs(
    t,
  )
    .map((q) => {
      const seen = done.filter((x) => x.last.drawn.includes(q.id));
      const n = seen.length || 1;
      const head = `<tr><td class="font-bold">${esc(q.bucket)}</td><td class="font-bold" colspan="4">${esc(q.text)} <span class="s-mute font-normal">· ${seen.length} odgovora</span></td></tr>`;
      if (q.type === "text")
        return (
          head +
          seen
            .filter((x) => x.last.answers[q.id])
            .slice(0, 5)
            .map((x) => `<tr><td></td><td colspan="4"><i>${esc(x.u.name)}:</i> ${esc(x.last.answers[q.id])}</td></tr>`)
            .join("")
        );
      return (
        head +
        q.options
          .map((o) => {
            const c = seen.filter((x) => (x.last.answers[q.id] || []).includes(o.id)).length;
            return `<tr><td></td><td class="${o.flag.on ? "s-bad" : o.correct ? "s-ok" : ""}">${o.correct ? "✓ " : ""}${o.flag.on ? "⚑ " : ""}${esc(o.text)}</td><td class="num">${c}</td><td class="num">${Math.round((c / n) * 100)}%</td><td><div style="height:8px;background:#e6e9f3;border-radius:4px"><div style="height:8px;border-radius:4px;width:${(c / n) * 100}%;background:${o.correct ? "#1f7a4f" : o.flag.on ? "#c8382a" : "#7d86b0"}"></div></div></td></tr>`;
          })
          .join("")
      );
    })
    .join("")}</tbody></table></div>`;
}
function repAgents(t, all) {
  const m = new Map();
  for (const x of filterRows(all)) {
    const r = m.get(x.ag.id) || { ag: x.ag, n: 0, done: 0, over: 0, flags: 0, bl: 0, sum: 0, c: 0 };
    r.n++;
    if (["passed", "completed", "failed"].includes(x.st)) r.done++;
    if (x.st === "overdue") r.over++;
    r.flags += x.flags.filter((f) => f.status !== "closed").length;
    if (x.u.blocked) r.bl++;
    if (x.last?.pct != null) {
      r.sum += x.last.pct;
      r.c++;
    }
    m.set(x.ag.id, r);
  }
  return `<div class="tblwrap"><table class="grid-tbl min-w-[700px]"><thead><tr><th>Agent</th><th>Grad</th><th>Naloga</th><th>Završeno</th>${t.type === "test" ? "<th>Prosek</th>" : ""}<th>Rok istekao</th><th>Aktivni flagovi</th><th>Blokirano</th></tr></thead><tbody>${[
    ...m.values(),
  ]
    .sort((a, b) => b.over + b.flags - (a.over + a.flags))
    .map(
      (r) =>
        `<tr><td><a data-act="agFilter" data-ag="${r.ag.id}">${esc(r.ag.name)}</a></td><td>${r.ag.city}</td><td class="num">${r.n}</td><td class="num">${r.done}/${r.n}</td>${t.type === "test" ? `<td class="num">${r.c ? Math.round(r.sum / r.c) + "%" : "—"}</td>` : ""}<td class="num ${r.over ? "s-bad" : ""}">${r.over}</td><td class="num ${r.flags ? "s-bad" : ""}">${r.flags}</td><td class="num">${r.bl}</td></tr>`,
    )
    .join("")}</tbody></table></div>`;
}

/* --- Menadžer: Pregled naloga u obuci --- */
function vAccount(a) {
  const t = tr(a.trainingId),
    u = user(a.userId),
    ag = agent(u.agentId),
    st = aStatus(a),
    isT = t.type === "test";
  const ms = S.messages.filter((m) => m.assignId === a.id && m.channel === "email");
  return (
    tbar(
      "Pregled naloga: " + esc(u.name),
      `<button class="btn btn-o" data-act="open" data-id="${t.id}">← Izveštaj obuke</button>`,
    ) +
    `<div class="px-4 sm:px-6 pt-5 grid gap-5">
 <div class="grid lg:grid-cols-2 gap-5 items-start"><div class="box"><h2>Podaci</h2>${[
   ["Obuka", esc(t.title)],
   ["Blagajnik", esc(u.name) + " (" + esc(u.username) + ")"],
   ["Agent", esc(ag.name) + ", " + ag.city],
   ["E-mail", esc(u.email)],
   ["Status", stTxt(st) + (isLate(a) ? ' <span class="s-warn">(posle roka)</span>' : "")],
   ["Dodeljeno", fmtDT(a.assignedAt)],
   ["Rok", fmtD(a.deadlineAt)],
   ["Pokušaji", a.attempts.length + (isT ? " / " + maxAttempts(t, a) : "")],
   ["Nalog", u.blocked ? `<span class="s-bad">Blokiran</span> – ${esc(u.blocked.reason)}` : "Aktivan"],
 ]
   .map(([l, v]) => `<div class="frow !mb-2"><label>${l}</label><div class="serif text-sm">${v}</div></div>`)
   .join("")}</div>
 <div class="box"><h2>Akcije</h2><div class="grid gap-2 justify-items-start"><button class="btn btn-o" data-act="remind1" data-a="${a.id}" ${isPending(st) ? "" : "disabled"}>Pošalji podsetnik</button><button class="btn btn-o" data-act="extend1" data-a="${a.id}">Produži rok +7 dana</button>${isT ? `<button class="btn btn-o" data-act="extra1" data-a="${a.id}" ${st === "passed" ? "disabled" : ""}>Dodeli dodatni pokušaj</button>` : ""}<button class="btn ${u.blocked ? "btn-n" : "btn-r"}" data-act="toggleBlock" data-u="${u.id}">${u.blocked ? "Odblokiraj nalog" : "Blokiraj nalog"}</button></div></div></div>
 <div class="flbl">Pokušaji</div><div class="tblwrap"><table class="grid-tbl min-w-[760px]"><thead><tr><th>#</th><th>Početak</th><th>Predato</th><th>Ime na dokumentu</th>${isT ? "<th>Bodovi</th><th>Rezultat</th>" : ""}<th>Flagovi</th><th>Dokumenti</th></tr></thead><tbody>
 ${
   a.attempts
     .map(
       (
         x,
         i,
       ) => `<tr><td>${i + 1}</td><td class="num">${fmtDT(x.startedAt)}</td><td class="num">${fmtDT(x.submittedAt)}</td><td>${esc(x.certName)}</td>${isT ? `<td class="num">${x.score}/${x.max}</td><td class="${x.passed ? "s-ok" : "s-bad"}">${x.pct}% ${x.passed ? "Položio" : "Nije položio"}</td>` : ""}<td class="num">${x.flags.length || "—"}</td>
 <td class="whitespace-nowrap"><a data-act="docTest" data-a="${a.id}" data-at="${x.id}">Popunjen ${tip(t)}</a>${(isT ? x.passed && t.certificate.enabled : t.thankYou.enabled) ? ` · <a data-act="docCert" data-a="${a.id}" data-at="${x.id}">${isT ? "Sertifikat" : "Zahvalnica"}</a>` : ""}</td></tr>`,
     )
     .join("") ||
   `<tr><td colspan="8" class="text-center py-5 s-mute">${a.draft ? "Započeto, nije predato." : "Nije započeto."}</td></tr>`
 }</tbody></table></div>
 ${
   flagsOf(a).length
     ? `<div class="flbl">Flagovi</div><div class="tblwrap"><table class="grid-tbl min-w-[760px]"><thead><tr><th>Pitanje</th><th>Odgovor</th><th>Status</th><th>Napomena</th><th></th></tr></thead><tbody>${flagsOf(
         a,
       )
         .map(
           (f) =>
             `<tr><td>${esc(f.question)}</td><td class="s-bad">${esc(f.answer)}</td><td class="${FST[f.status][1]}">${FST[f.status][0]}</td><td>${esc(f.note) || "—"}</td><td class="text-right">${f.status !== "closed" ? `<button class="btn btn-n btn-sm" data-act="fClose" data-a="${a.id}" data-f="${f.id}">Zatvori</button>` : ""}</td></tr>`,
         )
         .join("")}</tbody></table></div>`
     : ""
 }
 <div class="flbl">Poslata obaveštenja</div><div class="tblwrap"><table class="grid-tbl min-w-[600px]"><thead><tr><th>Datum</th><th>Naslov</th><th>Za</th></tr></thead><tbody>${ms.map((m) => `<tr><td class="num">${fmtDT(m.at)}</td><td>${esc(m.subject)}</td><td>${esc(m.to)}</td></tr>`).join("")}</tbody></table></div></div>`
  );
}

/* --- Menadžer: Arhiva obuka --- */
function vArchive() {
  const f = S.af,
    q = tr8(f.q.toLowerCase());
  const r = [];
  for (const a of S.assignments) {
    const t = tr(a.trainingId),
      u = user(a.userId);
    for (const at of a.attempts) r.push({ a, t, u, ag: agent(u.agentId), at });
  }
  const list = r
    .filter(
      (x) =>
        (f.t === "all" || x.t.id === f.t) &&
        (f.agent === "all" || x.ag.id === f.agent) &&
        (!q || tr8(x.u.name.toLowerCase()).includes(q)),
    )
    .sort((x, y) => y.at.submittedAt - x.at.submittedAt);
  const per = 25,
    pages = Math.max(1, Math.ceil(list.length / per)),
    pg = Math.min(f.page, pages);
  return (
    tbar("Arhiva obuka") +
    `<div class="px-4 sm:px-6 pt-5 grid gap-5"><div class="filt"><div class="filt-h">Filteri <button class="btn-w" data-act="archSearch">Pretraži</button></div><div class="p-5 grid sm:grid-cols-3 gap-4">
 <div><div class="fsub">Obuka</div><select class="fin" id="af-t"><option value="all">---</option>${S.trainings
   .filter((t) => t.status !== "draft")
   .map((t) => `<option value="${t.id}" ${f.t === t.id ? "selected" : ""}>${esc(t.title)}</option>`)
   .join("")}</select></div>
 <div><div class="fsub">Agent</div><select class="fin" id="af-ag"><option value="all">---</option>${S.agents.map((a) => `<option value="${a.id}" ${f.agent === a.id ? "selected" : ""}>${esc(a.name)}</option>`).join("")}</select></div>
 <div><div class="fsub">Ime blagajnika</div><input class="fin" id="af-q" value="${esc(f.q)}"></div></div></div>
 <div class="tblwrap"><table class="grid-tbl min-w-[860px]"><thead><tr><th>Predato</th><th>Blagajnik</th><th>Agent</th><th>Obuka</th><th>Tip</th><th>Rezultat</th><th>Flagovi</th><th>Dokumenti</th></tr></thead><tbody>
 ${
   list
     .slice((pg - 1) * per, pg * per)
     .map((x) => {
       const doc =
         x.t.type === "test"
           ? x.at.passed && x.t.certificate.enabled && "Sertifikat"
           : x.t.thankYou.enabled && "Zahvalnica";
       return `<tr><td class="num">${fmtDT(x.at.submittedAt)}</td><td>${esc(x.u.name)}</td><td>${esc(x.ag.name)}</td><td>${esc(x.t.title)}</td><td>${x.t.type === "test" ? "Test" : "Upitnik"}</td><td>${x.t.type === "test" ? `<span class="${x.at.passed ? "s-ok" : "s-bad"}">${x.at.pct}%</span>` : "Popunjeno"}</td><td class="num">${x.at.flags.length || "—"}</td><td class="whitespace-nowrap"><a data-act="docTest" data-a="${x.a.id}" data-at="${x.at.id}">Popunjen ${tip(x.t)}</a>${doc ? ` · <a data-act="docCert" data-a="${x.a.id}" data-at="${x.at.id}">${doc}</a>` : ""}</td></tr>`;
     })
     .join("") ||
   '<tr><td colspan="8" class="text-center py-6 s-mute">Arhiva je prazna. Ovde se beleži svaki predat test i upitnik.</td></tr>'
 }</tbody></table></div>${pager(pg, pages, "apage", list.length)}</div>`
  );
}

function vSettings() {
  const s = S.settings;
  return (
    tbar("Podešavanja obuka") +
    `<div class="px-4 sm:px-6 pt-5"><div class="box max-w-[760px]"><h2>Opšta pravila</h2>
 ${fr("Podrazumevani rok (dana)", `<input class="fin" type="number" min="1" data-set="defaultDeadline" value="${s.defaultDeadline}">`)}${fr("Podsetnik pre isteka (dana)", `<input class="fin" type="number" min="0" data-set="reminderDays" value="${s.reminderDays}">`)}
 <label class="chk"><input type="checkbox" data-set="autoUnblock" ${s.autoUnblock ? "checked" : ""}> Automatski odblokiraj nalog kada završi obuku zbog koje je blokiran</label><label class="chk"><input type="checkbox" data-set="email" ${s.email ? "checked" : ""}> Slanje e-mail obaveštenja uz obaveštenja u aplikaciji</label></div></div>`
  );
}
