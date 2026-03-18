# ⚡ Chik-Check

> Zero-infrastructure, serverless check-in for recurring-entry venues. No server. No app store. No budget.

---

## The Problem

A bouncer with a printed list is single-threaded. Every person requires the bouncer to search manually, creating a queue that grows faster than it shrinks. Digital screenshots are worse — they're static, shareable, and fake-able in seconds.

## The Solution

**Self-service validation via QR code, with live fraud prevention.**

A QR code at the gate links to this web app. The person enters their ID. The bouncer glances at the screen — not a list.

---

## How Fraud is Prevented

Three layers working together:

### 1. Physical Gate Key
A secret word written only on a sign *at the gate*. Without being physically present you cannot complete validation. Remote check-ins and forwarded links are useless without the key.

### 2. Entry Key ≠ Exit Key
There are two separate gate keys — one posted at the entry point, one at the exit. The server detects which key was used and returns `entry` or `exit` accordingly. A person cannot re-use their entry screen to exit, and vice versa.

### 3. Live Clock + Countdown (un-fakeable proof)
On successful validation the screen shows:

| Element | What it proves |
|---------|---------------|
| **Live HH:MM:SS clock** (local phone time) | The screen is running right now, not a static image |
| **5-minute countdown** | The approval window expires; a screenshot is useless after it runs out |
| **Expired state** | When the countdown hits 0 the screen flashes red and forces re-validation |

A screenshot cannot fake a running clock or a live countdown.

---

## Status Colors

| Color | Meaning | Bouncer action |
|-------|---------|----------------|
| 🟢 Green + "כניסה" | Valid ID, entry key used | Let them in |
| 🟡 Yellow + "יציאה" | Valid ID, exit key used | Let them out |
| 🔴 Red flash + error text | ID not on list, or wrong key | Deny |
| 🔴 Red + "פג תוקף" | 5-minute window expired | Ask to re-validate |

---

## Architecture

```
Person's Phone (local time only)
     │  HTTPS — sends ID + gate key
     ▼
Google Apps Script (doGet / checkIn)
     │  Reads column A only
     ▼
Google Sheet "Guests"
  Column A: authorized ID numbers (read-only)

No data is written. No timestamps stored server-side.
The countdown and clock run entirely on the phone.
```

**Why Google Sheets?** Zero cost, zero ops, zero infra. The free tier handles any normal event or workplace.

---

## Setup

### Prerequisites

```bash
npm install -g @google/clasp
npm install
clasp login
```

### 1. Create the Google Sheet

One spreadsheet, two tabs:

**Tab: `Guests`**
- A1: `ID` (header)
- A2 onward: paste your ID list — from Excel, another sheet, anywhere

**Tab: `Config`**

| A | B |
|---|---|
| ENTRY_KEY | your-entry-word |
| EXIT_KEY | your-exit-word |

To rotate keys before an event: just edit cells B1/B2. No code, no editor.

### 2. Link to Apps Script

```bash
# Open the sheet → Extensions → Apps Script → copy the Script ID from the URL
# Paste it into .clasp.json:  "scriptId": "YOUR_SCRIPT_ID_HERE"

clasp push
```

### 3. Guest list

Paste your ID column directly from Excel into the `Guests` tab, column A from row 2. Nothing else needed — the backend reads whatever is in that column.

### 4. Deploy as Web App

- **Deploy → New deployment**
- Type: **Web App**
- Execute as: **Me**
- Access: **Anyone** (anonymous — required for guests without Google accounts)
- Copy the URL → generate a QR code → print and post at entry/exit

### 5. Run tests

```bash
npm test
```

---

## Per-event / per-day workflow

```bash
# 1. Update ENTRY_KEY and EXIT_KEY in Script Properties
# 2. Push any code changes (if any):
clasp push
# 3. Create a new versioned deployment:
clasp deploy --description "Event 2024-06-15"
```

---

## Project Structure

```
chik-check/
├── src/
│   ├── Code.js          ← GAS backend: ID lookup + key direction detection
│   ├── Index.html       ← Frontend: Hebrew RTL, live clock, countdown, expiry
│   └── appsscript.json  ← GAS manifest
├── tests/
│   └── timer.test.js    ← Jest: countdown format, state resolution, urgency
├── .clasp.json          ← set your scriptId here
├── .gitignore
├── package.json
└── README.md
```
