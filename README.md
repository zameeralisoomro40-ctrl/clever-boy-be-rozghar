# 🇵🇰 Rozgar Pakistan (Daily All-Pakistan Jobs Portal)

A clean, minimalist, responsive, and user-friendly web application designed to post daily job announcements from every corner of Pakistan (Islamabad, Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Gilgit-Baltistan, and Azad Jammu & Kashmir).

Whenever a new job is announced anywhere in the country, it can be posted or streamed directly into the website and will immediately appear at the top of the feed with real-time badges, toast alerts, and live ticker updates.

---

## 📁 Complete Folder & File Structure

```
clever boy be-rozghar/
│
├── index.html                  # Main Application: Daily jobs feed, search, filters & live ticker
├── news.html                   # Dedicated News section (kept blank as requested)
├── README.md                   # Complete documentation & usage guide
│
└── assets/
    ├── css/
    │   ├── style.css           # Core minimalist design system, variables, typography & layout
    │   ├── components.css      # Reusable cards, tags, badges, modals, toasts & buttons
    │   └── responsive.css      # Responsive rules for mobile, tablet, and desktop viewports
    │
    ├── js/
    │   ├── data.js             # Nationwide dataset spanning all provinces, scales & sectors
    │   ├── job-manager.js      # Storage engine (localStorage), live injection & stream logic
    │   ├── ui.js               # Modal handlers, WhatsApp sharing, print slip, dark mode
    │   └── app.js              # Application controller: search, filtering, sorting, pagination
    │
    └── images/
        ├── logo.svg            # Clean minimalist Rozgar PK brand logo
        └── placeholder-ad.svg  # Official recruitment notification graphic template
```

---

## 🌟 Key Features

1. **Every Corner of Pakistan Covered**:
   - **Federal Capital / ICT**: FPSC, Ministries, NADRA, OGDCL, FIA, Central Secretariat.
   - **Punjab**: PPSC, Punjab Police, Rescue 1122, Higher Education Dept, LESCO.
   - **Sindh**: SPSC, Sindh High Court, State Bank of Pakistan, Dow University, KPT.
   - **Khyber Pakhtunkhwa**: KPPSC, LRH Peshawar, KPITB, PESCO.
   - **Balochistan**: BPSC, Gwadar Port Authority, Subordinate Judiciary, Bolan Medical.
   - **Gilgit-Baltistan & AJK**: Wildlife Rangers, GB Police, AJK Revenue Board.

2. **Real-Time Job Announcement Engine ("Whenever a new job is announced...")**:
   - **"Post a Job" Modal**: Clean admin/poster modal allowing anyone or administrators to publish new jobs with title, organization, quota, BPS scale, deadline, and eligibility.
   - **Immediate Live Injection**: New jobs appear at the top immediately with an animated `NEW TODAY` pulse badge without reloading.
   - **Persistent Storage**: All newly announced jobs are automatically saved in browser `localStorage`.
   - **⚡ Demo Live Ad**: A built-in demo button in the header that simulates incoming announcements in real-time, showing toast notifications and updating the top ticker.

3. **Pakistani Job Hunter Utilities**:
   - **WhatsApp Share**: One-click sharing with pre-formatted recruitment text (the #1 way job circulars are shared in Pakistan).
   - **Print Job Slip**: Clean printable summary slip for applicants.
   - **Bookmarking**: Save jobs for later review in the "Saved" tab.
   - **Instant Search**: Live multi-field search across title, department, city, or test agency (NTS, PPSC, FPSC, OTS).

4. **News Section**:
   - Kept cleanly blank as requested (`news.html`), with a minimalist placeholder ready for an RSS or API feed in the future.

5. **Clean & Minimalist Aesthetics**:
   - Neutral palette with Pakistani deep emerald accents.
   - Dark/Light mode toggle.
   - Zero external libraries or bloated frameworks (pure HTML5, CSS3, ES6 JavaScript).
   - Ultra-fast page load times and mobile-first design.

---

## 🚀 How to Run

No installations, build steps, or server dependencies required!

### Option 1: Direct in Browser
Simply double-click `index.html` or open it in Google Chrome, Microsoft Edge, Firefox, or Safari.

### Option 2: Local HTTP Server (Python / VS Code Live Server)
```bash
# Python 3
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

---

## 🛠️ Adding New Jobs Programmatically

You can add jobs through the UI using the **"📢 Post a Job"** button or by calling `window.jobManager.addNewJob()` in the browser console:

```javascript
window.jobManager.addNewJob({
  title: "Sub-Inspector (BPS-14)",
  organization: "Motorway Police (NHMP)",
  ministry: "Ministry of Communications",
  province: "Punjab",
  city: "Lahore",
  category: "Law Enforcement & Defense",
  sector: "Federal Government",
  bps: "BPS-14",
  vacancies: 150,
  education: "Graduation (2nd Division)",
  lastDate: "2026-12-20",
  applyLink: "https://www.fpsc.gov.pk",
  description: "Nationwide recruitment for National Highways & Motorway Police."
});
```
This will immediately dispatch a live notification and show the job in the feed.
