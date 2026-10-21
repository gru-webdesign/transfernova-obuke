/* TransferNova · Obuke — github-sync.js
   Čuvanje i učitavanje zajedničkog stanja simulacije u GitHub repozitorijum
   (grana "podaci", fajl data/stanje.json) preko GitHub REST API-ja.
   - Učitavanje ne traži token (repo je javan).
   - Čuvanje traži fine-grained token sa dozvolom Contents: Read and write za ovaj repo.
   - Svako čuvanje je commit; konflikt se otkriva preko SHA fajla.
   Klasična skripta: učitava se posle certificate.js, a pre app.js. */

const GH = {
  owner: "gru-webdesign",
  repo: "transfernova-obuke",
  branch: "podaci",
  path: "data/stanje.json",
  metaKey: "tn-obuke-gh-meta",
};

/* Polja stanja koja se dele preko GitHub-a. Sve ostalo (prikaz, filteri, otvoren modal,
   nacrt u izradi, test u toku) ostaje lokalno u pregledaču. */
const SHARED_KEYS = ["now", "settings", "agents", "users", "trainings", "assignments", "messages", "audit"];

const ghMeta = (() => {
  let m = {};
  try {
    m = JSON.parse(localStorage.getItem(GH.metaKey) || "{}");
  } catch (e) {}
  return m; // { token, who, sha, syncedAt, remoteSha, remoteAt, remoteBy, busy }
})();
function ghSaveMeta() {
  try {
    const { busy, ...keep } = ghMeta;
    localStorage.setItem(GH.metaKey, JSON.stringify(keep));
  } catch (e) {}
}

const ghApi = (p) => `https://api.github.com/repos/${GH.owner}/${GH.repo}${p}`;
function ghHeaders(extra = {}) {
  const h = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...extra };
  if (ghMeta.token) h.Authorization = "Bearer " + ghMeta.token;
  return h;
}
function b64encode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
function ghErr(res, body) {
  if (res.status === 401) return "Token nije ispravan ili je istekao. Proverite ga u GitHub podešavanju.";
  if (res.status === 403 && /rate limit/i.test(body?.message || ""))
    return "GitHub je privremeno ograničio broj zahteva. Unesite token ili pokušajte za nekoliko minuta.";
  if (res.status === 403) return "Token nema dozvolu za upis u repozitorijum (potrebno: Contents – Read and write).";
  if (res.status === 404) return "Repozitorijum, grana ili fajl nisu pronađeni.";
  if (res.status === 409) return "Na GitHub-u postoji novije stanje. Prvo ga učitajte.";
  if (res.status === 413 || res.status === 422)
    return (
      "GitHub je odbio fajl (" +
      (body?.message || res.status) +
      "). Ako je stanje veliko, uklonite učitane PNG šablone."
    );
  return "GitHub greška " + res.status + (body?.message ? ": " + body.message : "");
}

/* Metapodaci fajla na GitHub-u (SHA i poslednji commit). null = fajl još ne postoji. */
async function ghRemoteInfo() {
  const r = await fetch(ghApi(`/contents/${GH.path}?ref=${GH.branch}`), { headers: ghHeaders(), cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(ghErr(r, await r.json().catch(() => null)));
  const j = await r.json();
  let at = null,
    by = null;
  try {
    const c = await fetch(ghApi(`/commits?sha=${GH.branch}&path=${GH.path}&per_page=1`), {
      headers: ghHeaders(),
      cache: "no-store",
    });
    if (c.ok) {
      const [last] = await c.json();
      at = last?.commit?.committer?.date ? Date.parse(last.commit.committer.date) : null;
      by = (last?.commit?.message || "").split("\n")[0];
    }
  } catch (e) {}
  return { sha: j.sha, at, by };
}

/* Proverava da li na GitHub-u postoji stanje novije od lokalnog (bez učitavanja). */
async function ghCheck(silent = true) {
  try {
    const info = await ghRemoteInfo();
    ghMeta.remoteSha = info?.sha || null;
    ghMeta.remoteAt = info?.at || null;
    ghMeta.remoteBy = info?.by || null;
    ghSaveMeta();
    render();
    if (!silent) toast(info ? "Provereno: GitHub stanje je dostupno." : "Na GitHub-u još nema sačuvanog stanja.");
    return info;
  } catch (e) {
    if (!silent) toast(e.message);
    return undefined;
  }
}
const ghHasNewer = () => !!ghMeta.remoteSha && ghMeta.remoteSha !== ghMeta.sha;

async function ghLoad() {
  if (ghMeta.busy) return;
  ghMeta.busy = "load";
  render();
  try {
    const info = await ghRemoteInfo();
    if (!info) {
      toast("Na GitHub-u još nema sačuvanog stanja.");
      return;
    }
    const r = await fetch(ghApi(`/contents/${GH.path}?ref=${GH.branch}`), {
      headers: ghHeaders({ Accept: "application/vnd.github.raw+json" }),
      cache: "no-store",
    });
    if (!r.ok) throw new Error(ghErr(r, await r.json().catch(() => null)));
    const data = JSON.parse(await r.text());
    if (!data || data.format !== "tn-obuke-stanje" || !data.state)
      throw new Error("Fajl na GitHub-u nije ispravno stanje.");
    for (const k of SHARED_KEYS) if (k in data.state) S[k] = data.state[k];
    // Ako lokalni prikaz pokazuje nešto što više ne postoji, vrati na početnu.
    if (S.view.startsWith("t:") && !tr(S.view.slice(2))) S.view = "home";
    if (S.view.startsWith("acc:") && !asg(S.view.slice(4))) S.view = "home";
    if (S.take && !asg(S.take.aid)) {
      S.take = null;
      if (S.view === "take") S.view = "home";
    }
    if (!user(S.cashierId)) S.cashierId = S.users[0]?.id;
    Object.assign(ghMeta, {
      sha: info.sha,
      remoteSha: info.sha,
      remoteAt: info.at,
      remoteBy: info.by,
      syncedAt: Date.now(),
    });
    ghSaveMeta();
    S.modal = null;
    save();
    toast("Učitano stanje sa GitHub-a" + (info.at ? " (" + fmtDT(info.at) + ")" : "") + ".");
  } catch (e) {
    toast(e.message);
  } finally {
    ghMeta.busy = null;
    render();
  }
}

async function ghSave(force = false) {
  if (ghMeta.busy) return;
  if (!ghMeta.token) {
    S.modal = { type: "gh" };
    render();
    toast("Za čuvanje unesite GitHub token.");
    return;
  }
  ghMeta.busy = "save";
  render();
  try {
    const info = await ghRemoteInfo();
    const remoteSha = info?.sha || null;
    if (!force && remoteSha && remoteSha !== ghMeta.sha) {
      Object.assign(ghMeta, { remoteSha, remoteAt: info.at, remoteBy: info.by });
      ghSaveMeta();
      S.modal = { type: "ghConflict" };
      return;
    }
    const state = {};
    for (const k of SHARED_KEYS) state[k] = S[k];
    const who = (ghMeta.who || "").trim() || (S.role === "manager" ? ME : user(S.cashierId)?.name || "Blagajnik");
    const payload = { format: "tn-obuke-stanje", version: 1, savedAt: new Date().toISOString(), savedBy: who, state };
    const body = {
      message: `Stanje: ${who} – ${fmtDT(Date.now())} (datum simulacije ${fmtD(S.now)})`,
      content: b64encode(JSON.stringify(payload, null, 1)),
      branch: GH.branch,
    };
    if (remoteSha) body.sha = remoteSha;
    const r = await fetch(ghApi(`/contents/${GH.path}`), {
      method: "PUT",
      headers: ghHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) {
      if (r.status === 409 || r.status === 422) {
        if (r.status === 409 || /sha/i.test(j?.message || "")) {
          S.modal = { type: "ghConflict" };
          return;
        }
      }
      throw new Error(ghErr(r, j));
    }
    const sha = j.content.sha;
    Object.assign(ghMeta, { sha, remoteSha: sha, remoteAt: Date.now(), remoteBy: body.message, syncedAt: Date.now() });
    ghSaveMeta();
    S.modal = null;
    toast("Sačuvano na GitHub.");
  } catch (e) {
    toast(e.message);
  } finally {
    ghMeta.busy = null;
    render();
  }
}

/* Deo trake Simulacija */
function ghBar() {
  const st = ghMeta.busy
    ? ghMeta.busy === "save"
      ? "čuvanje…"
      : "učitavanje…"
    : ghHasNewer()
      ? `<b style="color:var(--or)">na GitHub-u ima novije stanje</b>`
      : ghMeta.syncedAt
        ? `usklađeno ${fmtDT(ghMeta.syncedAt)}`
        : "nije povezano";
  return `<span>GitHub: <button data-act="ghSave" ${ghMeta.busy ? "disabled" : ""}>Sačuvaj</button> · <button data-act="ghLoad" ${ghMeta.busy ? "disabled" : ""}>Učitaj</button> · <button data-act="modal" data-m="gh">Podešavanje</button> <span class="s-mute">(${st})</span></span>`;
}

function ghModal() {
  const repoUrl = `https://github.com/${GH.owner}/${GH.repo}/tree/${GH.branch}/data`;
  return mw(
    "GitHub – zajedničko stanje",
    `<div class="serif text-sm grid gap-3">
<p>Stanje simulacije (obuke, dodele, odgovori, flagovi, poruke, blokade) čuva se u repozitorijumu <b>${GH.owner}/${GH.repo}</b>, grana <b>${GH.branch}</b>, fajl <b>${GH.path}</b>. Svako čuvanje je jedan commit, pa se ranije verzije mogu vratiti iz istorije.</p>
<p class="s-bad">Repozitorijum je javan: sve što sačuvate vidi svako ko ga otvori. Ne unosite stvarne lične podatke.</p>
${fr("Vaše ime (u commitu)", `<input class="fin" id="gh-who" value="${esc(ghMeta.who || "")}" placeholder="npr. Goran – menadžer">`)}
${fr(
  "GitHub token",
  `<input class="fin" id="gh-token" type="password" autocomplete="off" value="${esc(ghMeta.token || "")}" placeholder="github_pat_…"><div class="text-xs s-mute mt-1">Potreban samo za čuvanje. Čuva se u ovom pregledaču.</div>`,
)}
<details><summary class="flab cursor-pointer">Kako napraviti token ▾</summary><ol class="list-decimal pl-5 mt-2 grid gap-1">
<li>GitHub → Settings → Developer settings → Personal access tokens → <b>Fine-grained tokens</b> → <b>Generate new token</b>.</li>
<li>Resource owner: <b>${GH.owner}</b>. Repository access: <b>Only select repositories</b> → <b>${GH.repo}</b>.</li>
<li>Permissions → Repository permissions → <b>Contents: Read and write</b>. Ostalo ostaje „No access“.</li>
<li>Izaberite rok važenja (npr. 30 dana), kliknite Generate i kopirajte token ovde.</li></ol></details>
<div class="text-xs s-mute">Poslednje usklađivanje: ${ghMeta.syncedAt ? fmtDT(ghMeta.syncedAt) : "—"} · Na GitHub-u: ${ghMeta.remoteAt ? fmtDT(ghMeta.remoteAt) : "—"}${ghMeta.remoteBy ? " · " + esc(ghMeta.remoteBy) : ""}</div>
<div class="text-xs">Fajlovi: <a class="lnk" href="${repoUrl}" target="_blank" rel="noopener">${repoUrl.replace("https://", "")}</a></div>
<div class="flex flex-wrap justify-end gap-2 mt-1">${ghMeta.token ? `<button class="btn btn-r" data-act="ghForget">Ukloni token</button>` : ""}<button class="btn btn-o" data-act="ghCheck">Proveri vezu</button><button class="btn btn-n" data-act="ghSaveCfg">Sačuvaj podešavanje</button></div></div>`,
    620,
  );
}
function ghConflictModal() {
  return mw(
    "Na GitHub-u postoji novije stanje",
    `<div class="serif text-sm grid gap-3"><p>Neko je sačuvao stanje posle vašeg poslednjeg učitavanja${ghMeta.remoteAt ? " (" + fmtDT(ghMeta.remoteAt) + ")" : ""}.${ghMeta.remoteBy ? "<br><span class='s-mute'>" + esc(ghMeta.remoteBy) + "</span>" : ""}</p>
<p><b>Učitaj</b> preuzima to stanje i odbacuje vaše nesačuvane izmene. <b>Prepiši</b> čuva vaše stanje preko njega (prethodna verzija ostaje u istoriji commitova).</p>
<div class="flex flex-wrap justify-end gap-2"><button class="btn btn-o" data-act="mclose">Odustani</button><button class="btn btn-r" data-act="ghForce">Prepiši</button><button class="btn btn-n" data-act="ghLoad">Učitaj novije</button></div></div>`,
    560,
  );
}

const GH_ACTIONS = {
  ghSave: () => ghSave(false),
  ghForce: () => {
    S.modal = null;
    ghSave(true);
  },
  ghLoad: () => {
    if (ghHasNewer() || !ghMeta.sha || S.modal?.type === "ghConflict") return ghLoad();
    S.modal = { type: "ghLoadConfirm" };
    render();
  },
  ghLoadNow: () => ghLoad(),
  ghCheck: () => ghCheck(false),
  ghSaveCfg: () => {
    ghMeta.token = ($("#gh-token")?.value || "").trim();
    ghMeta.who = ($("#gh-who")?.value || "").trim();
    ghSaveMeta();
    S.modal = null;
    render();
    toast("Podešavanje je sačuvano.");
  },
  ghForget: () => {
    delete ghMeta.token;
    ghSaveMeta();
    render();
    toast("Token je uklonjen iz pregledača.");
  },
};
function ghLoadConfirmModal() {
  return mw(
    "Učitavanje sa GitHub-a",
    `<p class="serif text-sm">Lokalno stanje će biti zamenjeno poslednjim sačuvanim stanjem sa GitHub-a. Nesačuvane izmene se gube.</p><div class="flex justify-end gap-2 mt-4"><button class="btn btn-o" data-act="mclose">Odustani</button><button class="btn btn-n" data-act="ghLoadNow">Učitaj</button></div>`,
    480,
  );
}

/* Pri pokretanju: ako nema lokalnog stanja, učitaj zajedničko; inače samo proveri da li postoji novije. */
function ghStartup(hadLocal) {
  if (!/^https?:/.test(location.protocol)) return;
  if (!hadLocal) ghLoad();
  else ghCheck(true);
  setInterval(() => {
    if (!ghMeta.busy && document.visibilityState === "visible") ghCheck(true);
  }, 120000);
}
