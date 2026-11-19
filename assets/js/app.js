/**
 * ROZGAR PK - Main Application Controller
 * Handles filtering, search, rendering, user interactions, and live stream updates.
 */

document.addEventListener("DOMContentLoaded", () => {
  // State
  const state = {
    searchQuery: "",
    selectedProvince: "All Pakistan",
    selectedCategory: "All Categories",
    selectedSector: "All Sectors",
    selectedEducation: "All Qualifications",
    filterDate: "all", // "all", "today", "urgent"
    viewMode: "all", // "all", "saved", "federal", "punjab", "sindh", "kpk", "balochistan"
    sortBy: "newest", // "newest", "closing", "vacancies"
    currentPage: 1,
    itemsPerPage: 9
  };

  // DOM Elements
  const jobsGrid = document.getElementById("jobs-grid");
  const emptyState = document.getElementById("empty-state");
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search");
  const provinceFilter = document.getElementById("province-filter");
  const categoryFilter = document.getElementById("category-filter");
  const sectorFilter = document.getElementById("sector-filter");
  const educationFilter = document.getElementById("education-filter");
  const sortSelect = document.getElementById("sort-select");
  const resultsCount = document.getElementById("results-count");
  const totalJobsBadge = document.getElementById("total-jobs-badge");
  const todayJobsBadge = document.getElementById("today-jobs-badge");
  const savedJobsBadge = document.getElementById("saved-jobs-badge");
  const navTabs = document.querySelectorAll(".nav-tab");
  const quickFilters = document.querySelectorAll(".quick-chip");
  const liveTickerContent = document.getElementById("live-ticker-content");
  const simulateBtn = document.getElementById("simulate-job-btn");
  const postJobBtn = document.getElementById("open-post-modal-btn");
  const postJobModal = document.getElementById("post-job-modal");
  const postJobForm = document.getElementById("post-job-form");

  // Initialize UI
  UI.initTheme();
  populateDropdownFilters();
  bindEvents();
  renderApp();
  checkUrlParams();

  // Populate dynamic select dropdowns from data.js
  function populateDropdownFilters() {
    if (provinceFilter) {
      provinceFilter.innerHTML = PAKISTAN_PROVINCES.map(p => `<option value="${p}">${p}</option>`).join("");
    }
    if (categoryFilter) {
      categoryFilter.innerHTML = JOB_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join("");
    }
    if (sectorFilter) {
      sectorFilter.innerHTML = JOB_SECTORS.map(s => `<option value="${s}">${s}</option>`).join("");
    }
    if (educationFilter) {
      educationFilter.innerHTML = EDUCATION_LEVELS.map(e => `<option value="${e}">${e}</option>`).join("");
    }
  }

  // Bind All Event Handlers
  function bindEvents() {
    // Search input
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        state.currentPage = 1;
        if (clearSearchBtn) {
          clearSearchBtn.style.display = state.searchQuery ? "block" : "none";
        }
        renderJobs();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        state.searchQuery = "";
        clearSearchBtn.style.display = "none";
        state.currentPage = 1;
        renderJobs();
      });
    }

    // Dropdown filters
    if (provinceFilter) {
      provinceFilter.addEventListener("change", (e) => {
        state.selectedProvince = e.target.value;
        state.currentPage = 1;
        updateActiveNavState();
        renderJobs();
      });
    }

    if (categoryFilter) {
      categoryFilter.addEventListener("change", (e) => {
        state.selectedCategory = e.target.value;
        state.currentPage = 1;
        renderJobs();
      });
    }

    if (sectorFilter) {
      sectorFilter.addEventListener("change", (e) => {
        state.selectedSector = e.target.value;
        state.currentPage = 1;
        renderJobs();
      });
    }

    if (educationFilter) {
      educationFilter.addEventListener("change", (e) => {
        state.selectedEducation = e.target.value;
        state.currentPage = 1;
        renderJobs();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        state.sortBy = e.target.value;
        renderJobs();
      });
    }

    // Quick filter chips
    quickFilters.forEach(chip => {
      chip.addEventListener("click", () => {
        quickFilters.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        const filterType = chip.dataset.filter;

        if (filterType === "all") {
          state.filterDate = "all";
          state.viewMode = "all";
        } else if (filterType === "today") {
          state.filterDate = "today";
        } else if (filterType === "urgent") {
          state.filterDate = "urgent";
        } else if (filterType === "federal") {
          state.selectedProvince = "Islamabad";
          if (provinceFilter) provinceFilter.value = "Islamabad";
        } else if (filterType === "punjab") {
          state.selectedProvince = "Punjab";
          if (provinceFilter) provinceFilter.value = "Punjab";
        } else if (filterType === "sindh") {
          state.selectedProvince = "Sindh";
          if (provinceFilter) provinceFilter.value = "Sindh";
        } else if (filterType === "kpk") {
          state.selectedProvince = "KPK";
          if (provinceFilter) provinceFilter.value = "KPK";
        }

        state.currentPage = 1;
        renderJobs();
      });
    });

    // Navigation Tabs
    navTabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        // If it's the external/separate news link or blank section
        const targetView = tab.dataset.view;
        if (!targetView) return;

        navTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        if (targetView === "saved") {
          state.viewMode = "saved";
        } else if (targetView === "all") {
          state.viewMode = "all";
          state.selectedProvince = "All Pakistan";
          if (provinceFilter) provinceFilter.value = "All Pakistan";
        } else {
          state.viewMode = "all";
          state.selectedProvince = targetView;
          if (provinceFilter) provinceFilter.value = targetView;
        }

        state.currentPage = 1;
        renderJobs();
      });
    });

    // Post Job Modal openers and closers
    if (postJobBtn) {
      postJobBtn.addEventListener("click", () => {
        if (postJobModal) {
          postJobModal.classList.add("active");
          document.body.classList.add("modal-open");
        }
      });
    }

    document.querySelectorAll(".modal-close-trigger").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal-backdrop");
        if (modal) {
          modal.classList.remove("active");
          document.body.classList.remove("modal-open");
        }
      });
    });

    // Post Job Form Submit
    if (postJobForm) {
      postJobForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(postJobForm);
        const newJobData = {
          title: formData.get("title"),
          organization: formData.get("organization"),
          ministry: formData.get("ministry"),
          province: formData.get("province"),
          city: formData.get("city"),
          category: formData.get("category"),
          sector: formData.get("sector"),
          bps: formData.get("bps"),
          vacancies: formData.get("vacancies"),
          education: formData.get("education"),
          ageLimit: formData.get("ageLimit"),
          testingAgency: formData.get("testingAgency"),
          lastDate: formData.get("lastDate"),
          applyLink: formData.get("applyLink"),
          description: formData.get("description"),
          syllabus: formData.get("syllabus"),
          isUrgent: formData.get("isUrgent") === "on"
        };

        const added = window.jobManager.addNewJob(newJobData);
        postJobForm.reset();
        UI.closeModal("post-job-modal");
        UI.showToast(`🎉 New Job Announced: "${added.title}" is now published live!`, "alert", 5000);
      });
    }

    // Simulate New Incoming Announcement Button (Fulfills: Whenever a new job is announced, it appears immediately)
    if (simulateBtn) {
      simulateBtn.addEventListener("click", () => {
        const simulated = window.jobManager.simulateIncomingJob();
        UI.showToast(`📢 Just Announced: ${simulated.title} (${simulated.organization}) in ${simulated.province}!`, "alert", 6000);
      });
    }

    // Listen to real-time events from JobManager
    window.addEventListener("rozgar:jobAdded", (e) => {
      renderApp();
      updateTicker();
    });

    window.addEventListener("rozgar:bookmarkChanged", () => {
      updateStats();
      if (state.viewMode === "saved") {
        renderJobs();
      }
    });

    window.addEventListener("rozgar:databaseReset", () => {
      renderApp();
      UI.showToast("Database reset to factory seeds.", "info");
    });

    // Reset database helper button (if present)
    const resetBtn = document.getElementById("reset-db-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("Reset all jobs back to initial Pakistan jobs list?")) {
          window.jobManager.resetToDefaults();
        }
      });
    }
  }

  // Update active state in navigation
  function updateActiveNavState() {
    navTabs.forEach(t => {
      if (t.dataset.view === state.selectedProvince) {
        t.classList.add("active");
      } else if (state.selectedProvince === "All Pakistan" && t.dataset.view === "all") {
        t.classList.add("active");
      } else if (t.dataset.view !== "saved") {
        t.classList.remove("active");
      }
    });
  }

  // Filter & Sort Logic
  function getFilteredJobs() {
    let jobs = window.jobManager.getAllJobs();

    // View mode: saved
    if (state.viewMode === "saved") {
      const savedIds = window.jobManager.getSavedJobIds();
      jobs = jobs.filter(j => savedIds.includes(j.id));
    }

    // Search query
    if (state.searchQuery) {
      jobs = jobs.filter(j => {
        return (
          j.title.toLowerCase().includes(state.searchQuery) ||
          j.organization.toLowerCase().includes(state.searchQuery) ||
          j.city.toLowerCase().includes(state.searchQuery) ||
          (j.testingAgency && j.testingAgency.toLowerCase().includes(state.searchQuery)) ||
          (j.bps && j.bps.toLowerCase().includes(state.searchQuery)) ||
          j.category.toLowerCase().includes(state.searchQuery)
        );
      });
    }

    // Province filter
    if (state.selectedProvince !== "All Pakistan") {
      jobs = jobs.filter(j => j.province.toLowerCase() === state.selectedProvince.toLowerCase());
    }

    // Category filter
    if (state.selectedCategory !== "All Categories") {
      jobs = jobs.filter(j => j.category === state.selectedCategory);
    }

    // Sector filter
    if (state.selectedSector !== "All Sectors") {
      jobs = jobs.filter(j => j.sector === state.selectedSector);
    }

    // Education filter
    if (state.selectedEducation !== "All Qualifications") {
      jobs = jobs.filter(j => j.education.toLowerCase().includes(state.selectedEducation.toLowerCase().replace("all qualifications", "")));
    }

    // Date / Quick Filter
    const todayStr = new Date().toISOString().split("T")[0];
    if (state.filterDate === "today") {
      jobs = jobs.filter(j => j.postedDate === todayStr || j.isNew);
    } else if (state.filterDate === "urgent") {
      jobs = jobs.filter(j => j.isUrgent);
    }

    // Sorting
    jobs.sort((a, b) => {
      if (state.sortBy === "newest") {
        return new Date(b.postedDate) - new Date(a.postedDate);
      } else if (state.sortBy === "closing") {
        return new Date(a.lastDate) - new Date(b.lastDate);
      } else if (state.sortBy === "vacancies") {
        return b.vacancies - a.vacancies;
      }
      return 0;
    });

    return jobs;
  }

  // Render Grid
  function renderJobs() {
    const filteredJobs = getFilteredJobs();

    // Update count display
    if (resultsCount) {
      resultsCount.textContent = `Showing ${filteredJobs.length} active announcements`;
    }

    if (filteredJobs.length === 0) {
      jobsGrid.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      renderPagination(0);
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    // Pagination slice
    const totalPages = Math.ceil(filteredJobs.length / state.itemsPerPage);
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + state.itemsPerPage);

    // Build Cards HTML
    jobsGrid.innerHTML = paginatedJobs.map(job => createJobCardHTML(job)).join("");

    // Attach card event listeners
    attachCardListeners();
    renderPagination(totalPages);
  }

  // Generate HTML for a single job card
  function createJobCardHTML(job) {
    const isSaved = window.jobManager.isJobSaved(job.id);
    const todayStr = new Date().toISOString().split("T")[0];
    const isToday = job.postedDate === todayStr;

    // Days remaining calculation
    const lastDate = new Date(job.lastDate);
    const today = new Date();
    const diffTime = lastDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let deadlineBadge = `<span class="card-chip chip-date">Deadline: ${job.lastDate}</span>`;
    if (diffDays <= 3 && diffDays >= 0) {
      deadlineBadge = `<span class="card-chip chip-deadline-urgent">Closing in ${diffDays} day${diffDays === 1 ? '' : 's'}!</span>`;
    }

    return `
      <article class="job-card ${job.isNew ? 'is-new-announcement' : ''}" data-job-id="${job.id}">
        <div class="card-top">
          <div class="card-badges">
            <span class="badge badge-province badge-${job.province.toLowerCase().replace(/[^a-z]/g, '')}">${job.province}</span>
            <span class="badge badge-sector">${job.sector}</span>
            ${job.bps && job.bps !== "N/A" ? `<span class="badge badge-bps">${job.bps}</span>` : ""}
            ${isToday || job.isNew ? `<span class="badge badge-new pulse">NEW TODAY</span>` : ""}
          </div>
          <button class="bookmark-btn ${isSaved ? 'active' : ''}" data-save-id="${job.id}" title="${isSaved ? 'Remove Bookmark' : 'Save Job'}" aria-label="Save Job">
            ${isSaved ? '★' : '☆'}
          </button>
        </div>

        <h3 class="job-title" data-view-id="${job.id}">
          <a href="javascript:void(0)" class="title-link">${escapeHtml(job.title)}</a>
        </h3>

        <div class="job-meta">
          <div class="meta-item org-name">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="7" width="20" height="14" rx="2" stroke-width="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke-width="2"/></svg>
            <span>${escapeHtml(job.organization)}</span>
          </div>
          <div class="meta-item location">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke-width="2"/><circle cx="12" cy="10" r="3" stroke-width="2"/></svg>
            <span>${job.city}, ${job.province}</span>
          </div>
          <div class="meta-item education">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke-width="2"/><path d="M6 12v5c3 3 9 3 12 0v-5" stroke-width="2"/></svg>
            <span class="text-truncate">${escapeHtml(job.education)}</span>
          </div>
        </div>

        <div class="card-chips-row">
          <span class="card-chip chip-vacancies">${job.vacancies} Vacanc${job.vacancies > 1 ? 'ies' : 'y'}</span>
          ${job.testingAgency ? `<span class="card-chip chip-agency">${job.testingAgency}</span>` : ""}
          ${deadlineBadge}
        </div>

        <div class="card-footer">
          <button class="btn btn-outline btn-sm view-details-btn" data-view-id="${job.id}">
            View Details
          </button>
          <div class="quick-actions">
            <button class="btn-icon wa-share-btn" data-wa-id="${job.id}" title="Share to WhatsApp" aria-label="Share on WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.44 0-2.85-.38-4.09-1.11l-.29-.17-3.04.8 1.05-2.96-.19-.3A8.175 8.175 0 0 1 3.8 11.91c0-4.54 3.7-8.24 8.25-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.53.61.2 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.2-.58.2-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/></svg>
            </button>
            <a href="${job.applyLink}" target="_blank" class="btn btn-primary btn-sm apply-external-link">
              Apply
            </a>
          </div>
        </div>
      </article>
    `;
  }

  // Attach dynamic card listeners
  function attachCardListeners() {
    // Open details
    document.querySelectorAll("[data-view-id]").forEach(el => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-view-id");
        UI.openJobDetailModal(id);
      });
    });

    // Bookmark toggle
    document.querySelectorAll("[data-save-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-save-id");
        const saved = window.jobManager.toggleSaveJob(id);
        btn.classList.toggle("active", saved);
        btn.innerHTML = saved ? '★' : '☆';
        UI.showToast(saved ? `Saved job ${id}` : `Removed bookmark ${id}`, "info", 2000);
      });
    });

    // WhatsApp share
    document.querySelectorAll("[data-wa-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-wa-id");
        const job = window.jobManager.getJobById(id);
        if (job) UI.shareToWhatsApp(job);
      });
    });
  }

  // Render pagination controls
  function renderPagination(totalPages) {
    const container = document.getElementById("pagination-container");
    if (!container) return;

    if (totalPages <= 1) {
      container.innerHTML = "";
      return;
    }

    let html = `
      <div class="pagination">
        <button class="page-btn ${state.currentPage === 1 ? 'disabled' : ''}" id="prev-page" ${state.currentPage === 1 ? 'disabled' : ''}>
          &laquo; Previous
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      html += `
        <button class="page-btn page-num ${state.currentPage === i ? 'active' : ''}" data-page="${i}">
          ${i}
        </button>
      `;
    }

    html += `
        <button class="page-btn ${state.currentPage === totalPages ? 'disabled' : ''}" id="next-page" ${state.currentPage === totalPages ? 'disabled' : ''}>
          Next &raquo;
        </button>
      </div>
    `;

    container.innerHTML = html;

    // Attach pagination listeners
    const prevBtn = document.getElementById("prev-page");
    const nextBtn = document.getElementById("next-page");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (state.currentPage > 1) {
          state.currentPage--;
          renderJobs();
          window.scrollTo({ top: document.getElementById("jobs-section").offsetTop - 100, behavior: "smooth" });
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (state.currentPage < totalPages) {
          state.currentPage++;
          renderJobs();
          window.scrollTo({ top: document.getElementById("jobs-section").offsetTop - 100, behavior: "smooth" });
        }
      });
    }

    document.querySelectorAll(".page-num").forEach(btn => {
      btn.addEventListener("click", () => {
        state.currentPage = parseInt(btn.dataset.page, 10);
        renderJobs();
        window.scrollTo({ top: document.getElementById("jobs-section").offsetTop - 100, behavior: "smooth" });
      });
    });
  }

  // Update Top Stats & Badges
  function updateStats() {
    const all = window.jobManager.getAllJobs();
    const todayStr = new Date().toISOString().split("T")[0];
    const newTodayCount = all.filter(j => j.postedDate === todayStr || j.isNew).length;
    const savedCount = window.jobManager.getSavedJobIds().length;

    if (totalJobsBadge) totalJobsBadge.textContent = all.length;
    if (todayJobsBadge) todayJobsBadge.textContent = newTodayCount;
    if (savedJobsBadge) savedJobsBadge.textContent = savedCount;

    // Update provincial count pills if present
    const fedCountEl = document.getElementById("count-fed");
    const punjabCountEl = document.getElementById("count-punjab");
    const sindhCountEl = document.getElementById("count-sindh");
    const kpkCountEl = document.getElementById("count-kpk");
    const balochCountEl = document.getElementById("count-baloch");

    if (fedCountEl) fedCountEl.textContent = all.filter(j => j.province === "Islamabad").length;
    if (punjabCountEl) punjabCountEl.textContent = all.filter(j => j.province === "Punjab").length;
    if (sindhCountEl) sindhCountEl.textContent = all.filter(j => j.province === "Sindh").length;
    if (kpkCountEl) kpkCountEl.textContent = all.filter(j => j.province === "KPK").length;
    if (balochCountEl) balochCountEl.textContent = all.filter(j => j.province === "Balochistan").length;
  }

  // Update Top Live Announcement Ticker
  function updateTicker() {
    if (!liveTickerContent) return;
    const all = window.jobManager.getAllJobs();
    const latestFive = all.slice(0, 5);

    liveTickerContent.innerHTML = latestFive.map(j => `
      <span class="ticker-item" data-view-id="${j.id}">
        <span class="ticker-dot"></span>
        <strong>${escapeHtml(j.title)}</strong> - ${escapeHtml(j.organization)} (${j.city}, ${j.province})
        <span class="ticker-date">Last Date: ${j.lastDate}</span>
      </span>
    `).join(" &nbsp;&nbsp;|&nbsp;&nbsp; ");

    // Reattach view listeners to ticker items
    liveTickerContent.querySelectorAll("[data-view-id]").forEach(el => {
      el.addEventListener("click", () => {
        UI.openJobDetailModal(el.dataset.viewId);
      });
    });
  }

  // Render complete app
  function renderApp() {
    updateStats();
    updateTicker();
    renderJobs();
  }

  // Check URL query parameter (e.g. ?job=PK-2026-001)
  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get("job");
    if (jobId) {
      setTimeout(() => {
        UI.openJobDetailModal(jobId);
      }, 300);
    }
  }

  // Simple HTML Escaping for security
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
