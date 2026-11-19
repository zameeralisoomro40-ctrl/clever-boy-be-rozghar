/**
 * ROZGAR PK - Job Manager & Real-Time Announcement Engine
 * Manages jobs database, local persistence, live dynamic job injection,
 * and handles "Whenever a new job is announced anywhere in Pakistan, it appears here".
 */

class JobManager {
  constructor() {
    this.STORAGE_KEY = "rozgar_pk_all_jobs_v1";
    this.SAVED_JOBS_KEY = "rozgar_pk_saved_jobs_v1";
    this.STREAM_KEY = "rozgar_pk_stream_active";
    this.initDatabase();
    this.streamInterval = null;
  }

  // Initialize database from localStorage or seed dataset
  initDatabase() {
    const existing = localStorage.getItem(this.STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(INITIAL_PAKISTAN_JOBS));
    }
    const saved = localStorage.getItem(this.SAVED_JOBS_KEY);
    if (!saved) {
      localStorage.setItem(this.SAVED_JOBS_KEY, JSON.stringify([]));
    }
  }

  // Get all active jobs (newest first)
  getAllJobs() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [...INITIAL_PAKISTAN_JOBS];
    } catch (e) {
      console.error("Error reading jobs from storage:", e);
      return [...INITIAL_PAKISTAN_JOBS];
    }
  }

  // Get a single job by ID
  getJobById(id) {
    const jobs = this.getAllJobs();
    return jobs.find(job => job.id === id) || null;
  }

  // Add a newly announced job (from admin form, scrape simulation, or external hook)
  addNewJob(jobData) {
    const allJobs = this.getAllJobs();
    const today = new Date().toISOString().split("T")[0];

    const newJob = {
      id: `PK-${new Date().getFullYear()}-${String(allJobs.length + 1).padStart(3, '0')}`,
      title: jobData.title.trim(),
      organization: jobData.organization.trim(),
      ministry: jobData.ministry ? jobData.ministry.trim() : "Recruitment Board of Pakistan",
      category: jobData.category || "Administration & Clerical",
      sector: jobData.sector || "Government",
      bps: jobData.bps ? jobData.bps.trim() : "Standard Scale",
      province: jobData.province || "Islamabad",
      city: jobData.city ? jobData.city.trim() : "Islamabad",
      vacancies: parseInt(jobData.vacancies, 10) || 1,
      gender: jobData.gender || "Male / Female",
      education: jobData.education || "Bachelor's Degree",
      ageLimit: jobData.ageLimit ? jobData.ageLimit.trim() : "18 - 30 Years",
      postedDate: today,
      lastDate: jobData.lastDate || this.calculateDefaultDeadline(),
      testingAgency: jobData.testingAgency ? jobData.testingAgency.trim() : "Official Departmental Testing",
      adReference: jobData.adReference ? jobData.adReference.trim() : `Gazette Notice-${Math.floor(1000 + Math.random() * 9000)}/2026`,
      applyLink: jobData.applyLink ? jobData.applyLink.trim() : "#",
      description: jobData.description ? jobData.description.trim() : "Official nationwide vacancy announced by recruiting authority. Eligible candidates across Pakistan are requested to apply before deadline.",
      syllabus: jobData.syllabus ? jobData.syllabus.trim() : "General Screening Test (English, Math, Current Affairs, Job Knowledge)",
      isUrgent: !!jobData.isUrgent,
      isNew: true
    };

    // Prepend so new announcements appear on top immediately
    allJobs.unshift(newJob);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allJobs));

    // Dispatch system-wide event for real-time reactivity
    window.dispatchEvent(new CustomEvent("rozgar:jobAdded", {
      detail: { job: newJob }
    }));

    return newJob;
  }

  // Calculate default deadline (15 days from today)
  calculateDefaultDeadline() {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split("T")[0];
  }

  // Toggle Saved / Bookmarked Job
  toggleSaveJob(id) {
    let saved = this.getSavedJobIds();
    const index = saved.indexOf(id);
    let isSaved = false;

    if (index > -1) {
      saved.splice(index, 1);
      isSaved = false;
    } else {
      saved.push(id);
      isSaved = true;
    }

    localStorage.setItem(this.SAVED_JOBS_KEY, JSON.stringify(saved));
    window.dispatchEvent(new CustomEvent("rozgar:bookmarkChanged", {
      detail: { id, isSaved, totalSaved: saved.length }
    }));

    return isSaved;
  }

  getSavedJobIds() {
    try {
      const data = localStorage.getItem(this.SAVED_JOBS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  isJobSaved(id) {
    return this.getSavedJobIds().includes(id);
  }

  getSavedJobs() {
    const ids = this.getSavedJobIds();
    const all = this.getAllJobs();
    return all.filter(j => ids.includes(j.id));
  }

  // Reset database back to default seed
  resetToDefaults() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(INITIAL_PAKISTAN_JOBS));
    localStorage.setItem(this.SAVED_JOBS_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent("rozgar:databaseReset"));
  }

  // Simulated Live Announcement Generator (for demonstration & testing new jobs)
  simulateIncomingJob() {
    const sampleAnnouncements = [
      {
        title: "Inspector Inland Revenue (BPS-16)",
        organization: "Federal Board of Revenue (FBR)",
        ministry: "Ministry of Finance & Revenue",
        category: "Revenue & Land Management",
        sector: "Federal Government",
        bps: "BPS-16",
        province: "Islamabad",
        city: "Islamabad",
        vacancies: 75,
        gender: "Male / Female",
        education: "Bachelor's in Commerce / Accounting / Economics / Law",
        ageLimit: "20 - 28 Years (+ 5 Years Relaxation)",
        testingAgency: "FPSC",
        description: "Fresh nationwide recruitment of Inland Revenue Inspectors under FBR field formations.",
        syllabus: "English 20%, Fiscal Laws & FBR Act 30%, Basic Accounts 30%, Pakistan Affairs 20%",
        isUrgent: true
      },
      {
        title: "Staff Nurse & Pharmacist (BPS-16/17)",
        organization: "Civil Hospital Karachi / Dow Health",
        ministry: "Health Department Sindh",
        category: "Healthcare & Medicine",
        sector: "Provincial Government",
        bps: "BPS-16",
        province: "Sindh",
        city: "Karachi",
        vacancies: 50,
        gender: "Male / Female",
        education: "Pharm-D / B.Sc Nursing with Registration",
        ageLimit: "21 - 32 Years",
        testingAgency: "SPSC",
        description: "Recruitment to reinforce emergency and specialized clinical units at tertiary care hospital.",
        syllabus: "Subject paper 80%, General Knowledge 20%",
        isUrgent: false
      },
      {
        title: "Assistant Director Information Technology (BPS-17)",
        organization: "KPK Information Technology Board (KPITB)",
        ministry: "Science & Technology Dept KP",
        category: "IT & Software",
        sector: "Autonomous Federal Body",
        bps: "BPS-17",
        province: "KPK",
        city: "Peshawar",
        vacancies: 12,
        gender: "Male / Female",
        education: "BS / MS Computer Science or Software Engineering",
        ageLimit: "22 - 32 Years",
        testingAgency: "ETEA",
        description: "Digital governance infrastructure and cybersecurity cell expansion across KP districts.",
        syllabus: "Computer Networks, Database Admin, Cloud Systems 80%, English 20%",
        isUrgent: true
      },
      {
        title: "Tehsildar & Naib Tehsildar (BPS-16/14)",
        organization: "Punjab Revenue Authority / Board of Revenue",
        ministry: "Government of the Punjab",
        category: "Revenue & Land Management",
        sector: "Provincial Government",
        bps: "BPS-16",
        province: "Punjab",
        city: "Multan",
        vacancies: 60,
        gender: "Male / Female",
        education: "Graduation (2nd Division)",
        ageLimit: "21 - 28 Years (+ General Relaxation)",
        testingAgency: "PPSC",
        description: "Land revenue and digital registry management for South and Central Punjab administrative zones.",
        syllabus: "Punjab Land Revenue Act, English Essay, General Knowledge, Urdu Comprehension",
        isUrgent: false
      },
      {
        title: "Judicial Magistrate & Civil Judge (BPS-18)",
        organization: "Balochistan High Court / Subordinate Judiciary",
        ministry: "Judicial Department Balochistan",
        category: "Civil Services & Executive",
        sector: "Judicial Body",
        bps: "BPS-18",
        province: "Balochistan",
        city: "Quetta",
        vacancies: 16,
        gender: "Male / Female",
        education: "LLB with 2 years active bar practice certificate",
        ageLimit: "22 - 35 Years",
        testingAgency: "Balochistan High Court Selection Board",
        description: "Induction into Provincial Subordinate Judiciary across Quetta, Makran, and Kalat divisions.",
        syllabus: "Civil Law, Criminal Procedure, Evidence Act, Constitution of Pakistan",
        isUrgent: true
      }
    ];

    const pick = sampleAnnouncements[Math.floor(Math.random() * sampleAnnouncements.length)];
    return this.addNewJob(pick);
  }
}

// Global instance
window.jobManager = new JobManager();
