# AGI — Art Gallery Interactive

> "AGI" here stands for **Art Gallery Interactive**, not Artificial General Intelligence.

A gallery installation that turns visitors' emotional state into part of the artwork.
A visitor opens the web form on their phone, registers under a name of their choosing,
and rates how they feel across three axes plus three qualities of the piece itself.
Those responses are aggregated in near real time into a single set of averages that
the installation reads back — so the room reflects the mood of everyone who has
walked through it.

This repository is a case study for the official AGI project development.

Deployed as a Firebase Hosting site (`chromatherapy-agi`) backed by Cloud Firestore
and Cloud Functions.

## How it works

| Piece | What it does |
| --- | --- |
| [`public/index.html`](public/index.html) | The visitor-facing form — sliders, rating radios, free-text feedback. |
| [`public/app.js`](public/app.js) | Signs in anonymously, registers the visitor's name, writes the submission to Firestore. |
| [`functions/index.js`](functions/index.js) | Firestore triggers that recompute aggregate averages whenever a participant record is created or updated. |
| [`firestore.rules`](firestore.rules) | Access rules — see [Data and privacy](#data-and-privacy). |

Data flows one way: the form writes to `participants/{name}`, a Cloud Function
recomputes every average and writes `averages/current`, and that aggregate document
is the only thing any client can read back.

## Data and privacy

Participants are told their names are not shared with third parties, and the rules
enforce that rather than relying on convention:

- **`participants/`** — write-only from the client. Submissions are keyed by the
  participant's name, so reads are denied outright; no client can retrieve them.
- **`users/`** — the name registry that prevents duplicate names. Rules allow `get`
  but deny `list`, so the form can check the one name a visitor just typed while the
  roster as a whole stays un-enumerable. The client checks names with a direct
  document read for exactly this reason — a collection query would require `list`.
- **`averages/`** — publicly readable, and the only public view of the data. It holds
  aggregate numbers with no names attached. Client writes are denied; the Cloud
  Functions write it through the Admin SDK, which bypasses rules.
- Everything else is denied by a closing catch-all.

Submissions are also shape-validated in the rules: only the expected fields, sliders
within 0–100, ratings within 0–5, feedback capped at 2000 characters.

### About the Firebase config

The project config is not checked into this repository. Firebase Hosting serves it at
[`/__/firebase/init.js`](https://firebase.google.com/docs/hosting/reserved-urls),
which `index.html` loads and which calls `initializeApp` before `app.js` runs.

Worth being clear about what this does and does not buy: a Firebase **Web** API key
is not a credential and not a secret. It identifies the project to Google's servers
and is served to every browser that loads the site, so keeping it out of the repo is
tidiness, not a security control. The Firestore rules above are what actually control
access. The key should additionally be scoped in the Google Cloud console by HTTP
referrer, with App Check enabled so only the real app can reach the backend.

## Running locally

```bash
npm install
firebase emulators:start
```

Deploying rules and functions:

```bash
firebase deploy --only firestore:rules,functions
```

Anonymous authentication must be enabled under **Firebase Console → Authentication →
Sign-in method** — every write is gated on an authenticated caller, so the form will
fail without it.

Pushes to `main` deploy hosting automatically via
[the GitHub Actions workflow](.github/workflows/firebase-hosting-merge.yml).
