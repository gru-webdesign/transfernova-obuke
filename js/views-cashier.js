/* TransferNova · Obuke — views-cashier.js
   Ekrani blagajnika: obaveštenja sa rokom, Moje obuke, Poruke, rad testa/upitnika; dokument popunjenog testa i modali.
   Klasična skripta (bez bundlera): fajlovi se učitavaju redom iz index.html i dele globalni opseg. */
/* --- Blagajnik --- */
const myA = () =>
  S.assignments
    .filter((a) => a.userId === S.cashierId && tr(a.trainingId).status !== "draft")
    .sort((a, b) => b.assignedAt - a.assignedAt);
function notices() {
  const u = user(S.cashierId);
  let h = "";
  if (u.blocked)
    h += `<div class="notice red p-4 flex gap-3 items-start"><span class="s-bad mt-0.5">${I.lock}</span><div class="serif text-sm"><b class="s-bad">Vaš nalog je blokiran za rad.</b> ${esc(u.blocked.reason)}. Isplata i slanje novca nisu dostupni dok ne završite obuku.</div></div>`;
  for (const a of myA()) {
    const t = tr(a.trainingId),
      st = aStatus(a);
    if (!isPending(st) || t.status !== "sent") continue;
    const over = st === "overdue",
      dl = daysLeft(a.deadlineAt);
    h += `<div class="notice ${over ? "red" : ""} p-4 flex flex-wrap gap-4 items-center"><div class="min-w-0 flex-1 serif"><div class="font-bold">${esc(t.title)} <span class="${over ? "s-bad" : "s-warn"} text-sm font-bold">· ${over ? "rok je istekao " + fmtD(a.deadlineAt) : `rok ${fmtD(a.deadlineAt)} (još ${dl} ${dl === 1 ? "dan" : "dana"})`}</span></div><div class="text-sm mt-0.5">${esc(fill(t.notifyText, t, a.deadlineAt))}</div></div><button class="btn btn-or" data-act="start" data-a="${a.id}">${a.draft ? "Nastavi" : a.attempts.length ? "Ponovi" : "Započni"}</button></div>`;
  }
  const open = myA()
    .flatMap((a) => flagsOf(a))
    .filter((f) => f.status === "open").length;
  if (open)
    h += `<div class="notice p-3 flex flex-wrap items-center gap-3 serif text-sm"><span class="flex-1"><b>Imate ${open} ${open === 1 ? "smernicu" : "smernica"} za korekciju.</b> Kada uskladite lokaciju, označite korekciju u porukama.</span><button class="btn btn-o btn-sm" data-act="go" data-v="inbox">Poruke</button></div>`;
  return h ? `<div class="grid gap-3">${h}</div>` : "";
}
function vCHome() {
  const u = user(S.cashierId),
    lock = !!u.blocked;
  const n = myA().filter((a) => isPending(aStatus(a))).length;
  return `<div class="max-w-[960px] mx-auto px-4 pt-6 grid gap-6">${u.active ? notices() : '<div class="notice red p-4 serif text-sm">Nalog je neaktivan i ne prima obuke.</div>'}
 <div class="grid grid-cols-2 md:grid-cols-3 gap-5 max-w-[880px] mx-auto w-full">${[
   ["Isplata novca", I.hand],
   ["Slanje novca", I.plane],
 ]
   .map(
     ([l, ic]) =>
       `<button class="tcard text-center p-6 flex flex-col items-center gap-4 relative ${lock ? "opacity-60" : ""}" data-act="cashop"><div class="circ w-[110px] h-[110px]">${ic}</div><div class="serif font-bold text-xl sm:text-2xl">${l}</div>${lock ? `<span class="absolute top-3 right-3 s-bad">${I.lock}</span>` : ""}</button>`,
   )
   .join("")}
 ${homeCard(I.cap, "Obuke", 'go" data-v="c-list', n ? `<span class="badge !static !border-0 absolute top-3 right-3" style="position:absolute">${n}</span>` : "")}</div></div>`;
}
function vCList() {
  const list = myA();
  return (
    tbar("Moje obuke") +
    `<div class="px-4 sm:px-6 pt-5 grid gap-5">${notices()}
 <div class="tblwrap"><table class="grid-tbl min-w-[860px]"><thead><tr><th>Obuka</th><th>Tip</th><th>Dodeljeno</th><th>Rok</th><th>Status</th><th>Rezultat</th><th>Dokumenti</th><th></th></tr></thead><tbody>
 ${
   list
     .map((a) => {
       const t = tr(a.trainingId),
         st = aStatus(a),
         f = finalAtt(a);
       const doc =
         ["passed", "completed"].includes(st) && (t.type === "test" ? t.certificate.enabled : t.thankYou.enabled);
       return `<tr><td>${esc(t.title)}</td><td>${t.type === "test" ? "Test" : "Upitnik"}</td><td class="num">${fmtD(a.assignedAt)}</td><td class="num">${fmtD(a.deadlineAt)}</td><td>${stTxt(st)}</td><td class="num">${t.type === "test" && f ? f.pct + "%" : f ? "✓" : "—"}</td>
 <td class="whitespace-nowrap">${f ? `<a data-act="docTest" data-a="${a.id}" data-at="${f.id}">Moji odgovori</a>` : "—"}${doc ? ` · <a data-act="docCert" data-a="${a.id}" data-at="${f.id}">${t.type === "test" ? "Sertifikat" : "Zahvalnica"}</a>` : ""}</td>
 <td class="text-right">${isPending(st) && t.status === "sent" ? `<button class="btn btn-or btn-sm" data-act="start" data-a="${a.id}">${a.draft ? "Nastavi" : a.attempts.length ? "Ponovi" : "Započni"}</button>` : ""}</td></tr>`;
     })
     .join("") || '<tr><td colspan="8" class="text-center py-8 s-mute">Nemate dodeljenih obuka.</td></tr>'
 }</tbody></table></div></div>`
  );
}
function vInbox() {
  const ms = S.messages.filter((m) => m.userId === S.cashierId && m.channel === "app").sort((a, b) => b.at - a.at);
  return (
    tbar(
      "Poruke",
      ms.some((m) => !m.read)
        ? `<button class="btn btn-o btn-sm" data-act="readAll">Označi sve kao pročitano</button>`
        : "",
    ) +
    `<div class="px-4 sm:px-6 pt-5 grid gap-3">${
      ms
        .map((m) => {
          const fl =
            m.kind === "flag"
              ? asg(m.assignId)
                  ?.attempts.flatMap((x) => x.flags)
                  .find((f) => f.id === m.flagId)
              : null;
          return `<div class="box !py-4 ${m.read ? "" : "!border-[#9aa2cf]"}" ${!m.read ? `data-act="read" data-id="${m.id}"` : ""}><div class="flex flex-wrap justify-between gap-2"><div class="serif font-bold">${m.read ? "" : "● "}${esc(m.subject)}</div><div class="text-xs s-mute num">${fmtDT(m.at)}</div></div><div class="serif text-sm whitespace-pre-line mt-1">${esc(m.body)}</div>
 ${fl ? `<div class="mt-3 flex flex-wrap items-center gap-2 text-sm"><span class="${FST[fl.status][1]} serif">${FST[fl.status][0]}</span>${fl.status === "open" ? `<input class="fin !min-h-[36px] flex-1 min-w-[200px]" id="note-${fl.id}" placeholder="Napomena (npr. dokument istaknut)"><button class="btn btn-n btn-sm" data-act="markCorr" data-a="${m.assignId}" data-f="${fl.id}">Označi kao korigovano</button>` : `<span class="s-mute">${esc(fl.note)}</span>`}</div>` : ""}</div>`;
        })
        .join("") || '<div class="box serif text-sm s-mute text-center">Nema poruka.</div>'
    }</div>`
  );
}
function vTake() {
  const k = S.take,
    a = asg(k.aid),
    t = tr(a.trainingId),
    isT = t.type === "test";
  const qs = k.drawn.map((id) => qById(t, id));
  if (k.step === "intro") {
    const docOn = isT ? t.certificate.enabled : t.thankYou.enabled;
    return (
      tbar(esc(t.title)) +
      `<div class="px-4 sm:px-6 pt-5"><div class="box max-w-[820px]"><h2>Pre početka</h2>
  ${[
    ["Tip", isT ? "Test" : "Upitnik"],
    ["Broj pitanja", qs.length],
    ["Rok", fmtD(a.deadlineAt)],
    ...(isT
      ? [
          ["Prag za prolaz", t.settings.passMark + "%"],
          ["Pokušaj", a.attempts.length + 1 + " od " + maxAttempts(t, a)],
          ["Vreme", +t.settings.timeLimit ? t.settings.timeLimit + " min" : "bez ograničenja"],
        ]
      : []),
  ]
    .map(([l, v]) => `<div class="frow !mb-2"><label>${l}</label><div class="serif text-sm num">${v}</div></div>`)
    .join("")}
  ${t.description ? fr("Opis", `<div class="serif text-sm">${esc(t.description)}</div>`) : ""}${t.material ? fr("Materijal obuke", `<div class="serif text-sm whitespace-pre-line rounded p-3" style="background:var(--field);border:1px solid var(--line)">${esc(t.material)}</div>`) : ""}
  ${docOn ? fr(`Ime i prezime za ${isT ? "sertifikat" : "zahvalnicu"}`, `<input class="fin" id="certName" data-take="certName" value="${esc(k.certName)}">`, 1) : ""}
  <div class="flex gap-2 mt-4"><button class="btn btn-o" data-act="go" data-v="c-list">Nazad</button><button class="btn btn-or" data-act="takeBegin">Započni ${tip(t)}</button></div></div></div>`
    );
  }
  if (k.step === "q") {
    const done = qs.filter((q) => q.type === "text" || (k.answers[q.id] || []).length).length;
    let lb = null,
      n = 0;
    return (
      tbar(
        esc(t.title),
        `<span class="serif text-sm num">${done}/${qs.length} odgovoreno</span>${k.endsAt ? `<span class="serif text-sm font-bold s-warn num">Vreme: <span id="timer">${timerTxt()}</span></span>` : ""}`,
      ) +
      `<div class="px-4 sm:px-6 pt-5"><div class="max-w-[820px] grid gap-5">
  ${qs.reduce((acc, q) => {
    if (q.bucket !== lb) {
      if (lb !== null) acc += "</div>";
      acc += `<div class="box"><h2>${esc(q.bucket)}</h2>`;
      lb = q.bucket;
    }
    n++;
    const sel = k.answers[q.id] || [];
    const miss = k.missing?.includes(q.id);
    return (
      acc +
      `<div class="mb-5"><div class="serif font-bold text-[15px] mb-2 ${miss ? "s-bad" : ""}" style="${miss ? "" : "color:var(--lab)"}">${n}. ${esc(q.text)}${q.required && q.type !== "text" ? ' <span class="req">*</span>' : ""}${isT && q.type !== "text" ? ` <span class="text-xs font-normal s-mute">(${q.points} b.)</span>` : ""}</div>
   ${q.type === "text" ? `<textarea class="fin" rows="3" id="ta-${q.id}" data-take-text="${q.id}">${esc(typeof k.answers[q.id] === "string" ? k.answers[q.id] : "")}</textarea>` : `<div class="grid gap-2 ${q.type === "yesno" ? "sm:grid-cols-2" : ""}">${q.options.map((o) => `<label class="opt ${sel.includes(o.id) ? "sel" : ""}"><input type="${q.type === "multi" ? "checkbox" : "radio"}" name="${q.id}" data-chg="ans" data-q="${q.id}" data-o="${o.id}" ${sel.includes(o.id) ? "checked" : ""}><span>${esc(o.text)}</span></label>`).join("")}</div>`}</div>`
    );
  }, "")}</div>
  ${k.missing?.length ? `<div class="notice red p-3 serif text-sm">Odgovorite na sva obavezna pitanja (${k.missing.length} bez odgovora).</div>` : ""}
  <div class="flex flex-wrap gap-2 justify-end"><button class="btn btn-o" data-act="takeSave">Sačuvaj i nastavi kasnije</button><button class="btn btn-or" data-act="takeSubmit">Predaj ${tip(t)}</button></div></div></div>`
    );
  }
  const att = a.attempts.find((x) => x.id === k.attId),
    st = aStatus(a),
    docOn = isT ? att.passed && t.certificate.enabled : t.thankYou.enabled;
  const wrong =
    isT && t.settings.showFeedback
      ? att.drawn.map((id) => qById(t, id)).filter((q) => q && q.type !== "text" && !att.detail[q.id]?.ok)
      : [];
  return (
    tbar(esc(t.title)) +
    `<div class="px-4 sm:px-6 pt-5"><div class="max-w-[820px] grid gap-5"><div class="box"><h2>Rezultat</h2>
 ${isT ? `<div class="serif"><span class="text-4xl font-bold num ${att.passed ? "s-ok" : "s-bad"}">${att.pct}%</span> <span class="text-lg font-bold ${att.passed ? "s-ok" : "s-bad"}">${att.passed ? "Položili ste test." : "Test nije položen."}</span></div><div class="serif text-sm s-mute mt-1">${att.score} od ${att.max} bodova · prag ${t.settings.passMark}%${att.passed ? "" : st === "failed" ? " · iskorišćeni su svi pokušaji" : ` · preostalo pokušaja: ${maxAttempts(t, a) - a.attempts.length}`}</div>` : `<div class="serif text-lg font-bold s-ok">Hvala, upitnik je evidentiran.</div>`}
 ${wrong.length ? `<div class="mt-4"><div class="flbl mb-1">Netačni odgovori</div><ul class="serif text-sm list-disc pl-5">${wrong.map((q) => `<li>${esc(q.text)}</li>`).join("")}</ul></div>` : ""}</div>
 ${att.flags.length ? `<div class="box"><h2>Potrebna korekcija</h2>${att.flags.map((f) => `<div class="notice red p-3 mb-2 serif text-sm"><b>${esc(f.question)}</b> – vaš odgovor: ${esc(f.answer)}${f.regulatory ? " · <b>zahtev regulatora</b>" : ""}<div class="mt-1">${esc(f.message)}</div></div>`).join("")}<div class="text-xs s-mute">Smernice su poslate i u Poruke i na ${esc(user(a.userId).email)}.</div></div>` : ""}
 ${docOn ? `<div class="box"><h2>${isT ? "Sertifikat" : "Zahvalnica"} <button class="btn btn-n btn-sm font-sans" data-act="dlCert" data-a="${a.id}" data-at="${att.id}">Preuzmi</button></h2><img class="w-full rounded border" style="border-color:var(--line)" alt="dokument" src="${renderCert(t, isT ? "cert" : "thanks", att.certName, att.submittedAt)}"></div>` : ""}
 <div class="flex gap-2">${isPending(st) ? `<button class="btn btn-or" data-act="start" data-a="${a.id}">Ponovi test</button>` : ""}<button class="btn btn-o" data-act="go" data-v="c-list">Moje obuke</button></div></div></div>`
  );
}
const timerTxt = () => {
  const s = Math.max(0, Math.round((S.take.endsAt - Date.now()) / 1000));
  return p2(Math.floor(s / 60)) + ":" + p2(s % 60);
};

/* --- Dokument popunjenog testa --- */
function attDoc(a, at) {
  const t = tr(a.trainingId),
    u = user(a.userId),
    ag = agent(u.agentId);
  return `<div class="serif text-sm"><div class="grid sm:grid-cols-2 gap-x-6 gap-y-1 mb-3">${[["Obuka", t.title], ["Tip", t.type === "test" ? "Test" : "Upitnik"], ["Blagajnik", u.name + " (" + u.username + ")"], ["Agent", ag.name + ", " + ag.city], ["Ime na dokumentu", at.certName], ["Predato", fmtDT(at.submittedAt)], ...(t.type === "test" ? [["Rezultat", `${at.score}/${at.max} (${at.pct}%) – ${at.passed ? "POLOŽIO" : "NIJE POLOŽIO"}`]] : []), ...(t.settings.regulatoryRef ? [["Pravni osnov", t.settings.regulatoryRef]] : [])].map(([l, v]) => `<div><b>${l}:</b> ${esc(v)}</div>`).join("")}</div>
 <div class="tblwrap"><table class="grid-tbl"><thead><tr><th>#</th><th>Pitanje</th><th>Odgovor</th>${t.type === "test" ? "<th>Bodovi</th>" : ""}</tr></thead><tbody>${at.drawn
   .map((id, i) => {
     const q = qById(t, id);
     if (!q) return "";
     const v = at.answers[id];
     const txt =
       q.type === "text" ? v || "—" : (v || []).map((o) => q.options.find((x) => x.id === o)?.text).join(", ") || "—";
     const fl = at.flags.find((f) => f.qid === id);
     return `<tr><td>${i + 1}</td><td>${esc(q.text)}</td><td class="${fl ? "s-bad" : ""}">${esc(txt)}${fl ? " ⚑" : ""}</td>${t.type === "test" ? `<td class="num">${q.type === "text" ? "—" : (at.detail[id]?.got ?? 0) + "/" + (at.detail[id]?.max ?? q.points)}</td>` : ""}</tr>`;
   })
   .join("")}</tbody></table></div></div>`;
}
function docHtml(a, at) {
  return (
    '<!doctype html><html><head><meta charset="utf-8"><title>Obuka</title><style>body{font-family:Georgia,serif;padding:28px;color:#1f2547}table{width:100%;border-collapse:collapse}th{background:#333b66;color:#fff;text-align:left;padding:6px}td{border-bottom:1px solid #ccd;padding:6px}.s-bad{color:#c8382a}.tblwrap{margin-top:12px}</style></head><body><h2>TransferNova – dokaz o obuci</h2>' +
    attDoc(a, at) +
    "</body></html>"
  );
}

/* --- Modali --- */
const mw = (title, body, w = 760) =>
  `<div class="modal-bg" data-act="bg"><div class="modal" style="max-width:${w}px" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="filt-h">${title}<button class="btn-w" data-act="mclose">Zatvori</button></div><div class="p-5">${body}</div></div></div>`;
function renderModal() {
  const m = S.modal;
  if (!m) {
    $("#modal").innerHTML = "";
    return;
  }
  let h = "";
  if (m.type === "doc")
    h = mw(
      m.title,
      m.html +
        `<div class="flex justify-end mt-4"><button class="btn btn-n" data-act="${m.dl}" data-a="${m.a}" data-at="${m.at}">Preuzmi</button></div>`,
      m.w || 860,
    );
  else if (m.type === "errors")
    h = mw(
      "Obuka nije spremna za slanje",
      `<ul class="serif text-sm list-disc pl-5 grid gap-1">${m.list.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`,
      560,
    );
  else if (m.type === "sendConfirm") {
    const d = S.draft;
    h = mw(
      "Slanje obuke",
      `<div class="serif text-sm">Šaljete ${tip(d)} <b>„${esc(d.title)}“</b> na <b>${audUsers(d).length}</b> naloga. Rok: <b>${fmtD(S.now + d.settings.deadlineDays * DAY)}</b>.<div class="notice p-3 my-3">${esc(fill(d.notifyText, d, S.now + d.settings.deadlineDays * DAY))}</div>Podsetnik se šalje ${S.settings.reminderDays} dana pre isteka. ${d.settings.autoBlock ? "Po isteku roka nalog se automatski blokira." : "Blokadu po isteku roka radi menadžer."}</div><div class="flex justify-end gap-2 mt-4"><button class="btn btn-o" data-act="mclose">Odustani</button><button class="btn btn-n" data-act="sendNow">Pošalji</button></div>`,
      560,
    );
  } else if (m.type === "submit")
    h = mw(
      "Predaja",
      `<p class="serif text-sm">Nakon predaje odgovori se ne mogu menjati.</p><div class="flex justify-end gap-2 mt-4"><button class="btn btn-o" data-act="mclose">Nazad</button><button class="btn btn-or" data-act="takeSubmitNow">Predaj</button></div>`,
      460,
    );
  else if (m.type === "preview") {
    const d = S.draft;
    h = mw(
      "Pregled za blagajnika",
      `<div class="notice p-3 serif text-sm mb-3">${esc(fill(d.notifyText, d, S.now + d.settings.deadlineDays * DAY))}</div>${d.buckets.map((b) => `<div class="box mb-3"><h2>${esc(b.name)}${b.drawCount ? ` <span class="text-xs font-normal s-mute">${b.drawCount} nasumično</span>` : ""}</h2>${b.questions.map((q, i) => `<div class="mb-3"><div class="serif font-bold text-sm mb-1.5">${i + 1}. ${esc(q.text || "(bez teksta)")}</div>${q.type === "text" ? '<div class="fin s-mute">Slobodan odgovor</div>' : `<div class="grid gap-1.5">${q.options.map((o) => `<div class="opt !py-1.5 text-sm">${q.type === "multi" ? "☐" : "○"} ${esc(o.text)}</div>`).join("")}</div>`}</div>`).join("") || '<div class="s-mute text-sm">Nema pitanja.</div>'}</div>`).join("")}`,
    );
  } else if (m.type === "outbox") {
    const ms = S.messages.filter((x) => x.channel === "email").sort((a, b) => b.at - a.at);
    h = mw(
      "Poslata pošta",
      `<div class="grid gap-2 max-h-[65vh] overflow-y-auto">${
        ms
          .slice(0, 200)
          .map(
            (x) =>
              `<details class="border rounded p-2.5" style="border-color:var(--line)"><summary class="cursor-pointer serif text-sm"><span class="num s-mute">${fmtDT(x.at)}</span> · <b>${esc(x.subject)}</b> → ${esc(x.to)}</summary><div class="serif text-sm whitespace-pre-line mt-2 p-3 rounded" style="background:var(--field)">${esc(x.body)}\n\nSrdačan pozdrav,\nCompliance služba TransferNova</div></details>`,
          )
          .join("") || '<div class="serif text-sm s-mute">Još nije poslat nijedan e-mail.</div>'
      }</div>`,
    );
  } else if (m.type === "reset")
    h = mw(
      "Reset simulacije",
      `<p class="serif text-sm">Brišu se sve obuke, rezultati i poruke. Agenti i nalozi ostaju.</p><div class="flex justify-end gap-2 mt-4"><button class="btn btn-o" data-act="mclose">Odustani</button><button class="btn btn-r" data-act="resetNow">Resetuj</button></div>`,
      460,
    );
  else if (m.type === "gh") h = ghModal();
  else if (m.type === "ghConflict") h = ghConflictModal();
  else if (m.type === "ghLoadConfirm") h = ghLoadConfirmModal();
  $("#modal").innerHTML = h;
}
