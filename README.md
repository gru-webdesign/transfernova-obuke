# TransferNova · Obuke

Prototip sekcije **Obuke** za TransferNova aplikaciju: compliance testovi i upitnici (po uzoru na FlexiQuiz) koje menadžer kreira i šalje blagajničkim nalozima, sa praćenjem rezultata, flagovima, smernicama za korekciju, sertifikatima i arhivom.

Izgled prati postojeće ekrane aplikacije: beli okvir, navy navigacija, naslovna traka stranice, forme labela–polje, panel „Filteri“ i tabele sa navy zaglavljem.

## Pokretanje

Otvori `index.html` u pregledaču. Server ni build nisu potrebni.

Tailwind (CDN) i fontovi (Google Fonts) se učitavaju sa interneta. Stanje simulacije se čuva u `localStorage` pregledača, a dugme **Reset** briše sve obuke, rezultate i poruke.

Traka **Simulacija** iznad aplikacije služi samo za prototip:
- prebacivanje između prikaza menadžera i blagajnika;
- izbor blagajnika;
- pomeranje datuma (+1 / +5 dana), da bi se videli podsetnici, istek roka i blokade;
- pregled poslate e-pošte.

U produkciji se ova traka uklanja.

## Struktura

```
index.html            okvir stranice; učitava CSS i skripte redom
css/obuke.css         stilovi usklađeni sa postojećim ekranima
js/util.js            datumi, escape, rad sa putanjama u objektima
js/data.js            agenti i nalozi simulacije (10 / 20), podrazumevani tekstovi, prazni šabloni
js/domain.js          bodovanje, flagovi, statusi, obaveštenja, blokada, raspored rokova
js/certificate.js     sertifikat/zahvalnica na canvasu (PNG šablon + ime), čuvanje stanja
js/views-manager.js   ekrani menadžera
js/views-cashier.js   ekrani blagajnika, dokument popunjenog testa, modali
js/app.js             render, akcije (data-act), događaji, pokretanje
```

Skripte su klasične (nisu ES moduli) i dele globalni opseg, pa redosled u `index.html` mora da ostane isti.

## Ekrani

### Menadžer (meni **Obuke ▾**)

| Ekran | Šta radi |
|---|---|
| **Nova obuka** | Podaci o obuci (tip, naziv, kategorija, pravni osnov, rok, prag, pokušaji, vreme), podešavanja, sertifikat/zahvalnica, pitanja po buketima, obaveštenje blagajniku, primaoci |
| **Pregled obuka** | Filteri (period, tip, status) i lista obuka; nacrt se uređuje ili briše, poslata obuka otvara izveštaj; svaka se može kopirati |
| **Izveštaj obuke** | Zbir, filteri (agent, status, flag, ime), grupne akcije pod „Ostalo“, prikazi Nalozi / Flagovi / Analiza pitanja / Po agentima, izvoz u CSV |
| **Pregled naloga** | Podaci, akcije (podsetnik, produženje roka, dodatni pokušaj, blokada), pokušaji sa dokumentima, flagovi, poslata obaveštenja |
| **Arhiva obuka** | Svaki predat pokušaj sa popunjenim testom i sertifikatom/zahvalnicom za preuzimanje, kao dokaz |
| **Podešavanja obuka** | Podrazumevani rok, podsetnik pre isteka, automatska deblokada, e-mail obaveštenja |

### Blagajnik

| Ekran | Šta radi |
|---|---|
| **Početna** | Obaveštenje sa rokom za svaku nezavršenu obuku; kartice Isplata/Slanje su zaključane kad je nalog blokiran |
| **Moje obuke** | Lista dodeljenih obuka sa dugmadima Započni / Nastavi / Ponovi i dokumentima |
| **Rad testa / upitnika** | „Pre početka“ (unos imena za sertifikat), pitanja po buketima, čuvanje nacrta, predaja, rezultat sa smernicama i sertifikatom |
| **Poruke** | Sva obaveštenja; kod smernica blagajnik upisuje napomenu i označava „korigovano“ |

## Pravila

### Tipovi obuke
- **Test**: boduje se. Svako pitanje ima bodove, a obuka ima prag za prolaz (%) i broj pokušaja. Za položen test izdaje se sertifikat.
- **Upitnik**: ne boduje se. Koristi se za posredne kontrole. Po predaji se izdaje zahvalnica.

### Pitanja
- Tipovi pitanja: jedan odgovor, više odgovora, Da/Ne i slobodan tekst. Slobodan tekst se ne boduje i ne podiže flag.
- Pitanja su grupisana u **bukete**. Buket može da izvuče N nasumičnih pitanja (`drawCount`), pa svaki blagajnik dobija svoj skup pitanja.
- Kod pitanja sa više tačnih odgovora bodovi se dobijaju samo za tačan skup, osim ako su uključeni delimični bodovi: tada je skor (tačni − pogrešni) / broj tačnih, najmanje 0.

### Flag
Flag je oznaka neusklađenosti vezana za **ponuđeni odgovor**, a ne za celo pitanje. Primer: na pitanje „Da li imate istaknute Opšte uslove za RIA?“ flag se stavlja na odgovor „Ne“.

Svaki flag ima:
- ozbiljnost (visok, srednji, nizak);
- oznaku da li je zahtev regulatora;
- tekst smernice za korekciju.

Kada blagajnik izabere takav odgovor:
1. Pri predaji nastaje zapis flaga sa statusom **Otvoren**.
2. Smernica se prikazuje na rezultatu i šalje se u Poruke i na e-mail.
3. Blagajnik označava korekciju, a status prelazi u **Korigovano – na proveri**.
4. Menadžer flag **zatvara** ili smernicu **šalje ponovo**, čime se flag vraća u Otvoren.

Flag ne utiče na bodove: test može biti položen sa otvorenim flagom.

**Sistemski flagovi** se računaju sami: rok istekao, iskorišćeni svi pokušaji i završeno posle roka.

### Statusi dodele

| Status | Uslov |
|---|---|
| Nije započeto | nema pokušaja ni nacrta, rok nije istekao |
| U toku | postoji sačuvan nacrt |
| Nije položio – ima pokušaj | test, pao, ostali su pokušaji |
| Rok istekao | nije završeno, a rok je prošao |
| Položio / Popunjeno | uspešno završeno (test / upitnik) |
| Nije položio | test, iskorišćeni svi pokušaji |

### Rokovi i blokada
- Rok = datum slanja + broj dana iz obuke.
- Podsetnik se šalje N dana pre isteka (Podešavanja).
- Po isteku roka blagajnik dobija obaveštenje. Ako je u obuci uključena automatska blokada, nalog se blokira. U suprotnom, blokadu radi menadžer, pojedinačno ili grupno.
- Ako je uključena automatska deblokada, nalog se odblokira čim blagajnik završi obuku zbog koje je blokiran.

### Obaveštenja
Svako obaveštenje ide u aplikaciju i, ako je uključeno, na e-mail naloga. Šalje se kod:
- dodele obuke;
- podsetnika;
- isteka roka;
- flaga;
- rezultata;
- blokade i deblokade;
- produženja roka i dodatnog pokušaja.

Tekst obaveštenja o dodeli podržava zamene `{tip}`, `{naziv}`, `{dana}` i `{rok}`.

## Model podataka (predlog)

```
training        id, title, type TEST|SURVEY, category, description, material,
                status DRAFT|SENT|CLOSED, deadline_days, pass_mark, attempts, time_limit,
                shuffle, show_feedback, partial_credit, auto_block, regulatory_ref,
                notify_text, audience_mode, sent_at, deadline_at, created_by
training_agent  training_id, agent_id                       (kad su primaoci izabrani agenti)
question_bucket id, training_id, name, draw_count, sort
question        id, bucket_id, text, type SINGLE|MULTI|YESNO|TEXT, points, required, sort
answer_option   id, question_id, text, is_correct, flag_on, flag_severity,
                flag_message, flag_regulatory, sort
doc_template    training_id, kind CERT|THANKS, enabled, image_png, name_x, name_y,
                font_size, color, show_title, show_date, text
assignment      id, training_id, user_id, assigned_at, deadline_at, extra_attempts,
                reminder_sent, overdue_notified, draft_json
attempt         id, assignment_id, started_at, submitted_at, cert_name, drawn_qids,
                answers_json, score, max_score, pct, passed, document_path
flag            id, attempt_id, question_id, option_id, severity, regulatory,
                status OPEN|CORRECTED|CLOSED, note, corrected_at, closed_at, closed_by
message         id, user_id, channel APP|EMAIL, kind, subject, body, assignment_id,
                flag_id, sent_at, read_at
user_block      id, user_id, reason, by SYSTEM|MANAGER, training_id, at, released_at
```

Indeksi: `assignment(training_id, user_id)`, `assignment(user_id)`, `flag(status)`, `attempt(assignment_id)`.

## API (predlog)

```
MENADŽER
POST   /api/trainings                         novi nacrt
PUT    /api/trainings/{id}                    izmena nacrta
POST   /api/trainings/{id}/copy               kopija kao nacrt
DELETE /api/trainings/{id}                    brisanje nacrta
POST   /api/trainings/{id}/send               dodela + obaveštenja
POST   /api/trainings/{id}/close
GET    /api/trainings?from=&to=&type=&status=
GET    /api/trainings/{id}/summary            zbirne brojke
GET    /api/trainings/{id}/assignments?agent=&status=&flag=&q=&page=&size=25
GET    /api/trainings/{id}/flags
GET    /api/trainings/{id}/questions/stats
GET    /api/trainings/{id}/agents/stats
GET    /api/trainings/{id}/export.csv
POST   /api/trainings/{id}/remind | extend | block-overdue
POST   /api/assignments/{id}/remind | extend | extra-attempt
PATCH  /api/flags/{id}                        CLOSED / OPEN (+ ponovno slanje)
POST   /api/users/{id}/block | unblock
GET    /api/attempts/{id}/document            popunjen test (PDF)
GET    /api/attempts/{id}/certificate         sertifikat / zahvalnica

BLAGAJNIK
GET    /api/me/assignments
POST   /api/me/assignments/{id}/start         izvlači pitanja; odgovori BEZ is_correct i flag polja
PUT    /api/me/assignments/{id}/draft
POST   /api/me/assignments/{id}/submit        bodovanje, flagovi, poruke, dokument
GET    /api/me/messages
PATCH  /api/me/messages/{id}/read
PATCH  /api/me/flags/{id}/corrected           napomena blagajnika

JOB    dnevno: podsetnici, istek roka, automatska blokada
```

## Napomene za produkciju

- **Bodovanje i flagovi rade na serveru.** Prototip boduje u pregledaču samo radi demonstracije. Tačni odgovori, flag pravila i smernice ne smeju da stignu do blagajnika pre predaje.
- **Velik broj naloga (1000+):** zbirne brojke, raspodele i analiza pitanja računaju se agregatnim SQL upitima (`GROUP BY` status, agent, option). Tabela naloga se učitava stranično.
- **Dokazi:** popunjen test i sertifikat generišu se jednom pri predaji (npr. JasperReports → PDF) i čuvaju se nepromenljivi. Prototip ih generiše u letu, kao HTML i PNG.
- **Blokada naloga** se proverava u postojećim tokovima Isplata/Slanje (hard-stop).
- **Uloge:** menadžerski ekrani zahtevaju SUPERVISOR/ADMIN, a blagajnički AGENT. Blagajnik vidi samo svoje dodele.
- **Podaci u `data.js` su izmišljeni.** U produkciji se agenti i nalozi čitaju iz postojećih tabela.
