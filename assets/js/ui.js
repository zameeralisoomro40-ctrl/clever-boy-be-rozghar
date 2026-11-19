/**
 * ROZGAR PK - UI Utilities, Modals, Toasts, and Pakistani Job Hunting Tooling
 */

const UI = {
  // Show a minimalist toast notification
  showToast(message, type = "info", duration = 4000) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    // Icon based on type
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "warning") icon = "⚠️";
    if (type === "alert") icon = "📢";

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <div class="toast-content">${message}</div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);

    // Fade in
    setTimeout(() => toast.classList.add("show"), 10);

    const closeToast = () => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector(".toast-close").addEventListener("click", closeToast);
    setTimeout(closeToast, duration);
  },

  // Open the Job Detail Modal
  openJobDetailModal(jobId) {
    const job = window.jobManager.getJobById(jobId);
    if (!job) return;

    const modal = document.getElementById("job-detail-modal");
    if (!modal) return;

    const isSaved = window.jobManager.isJobSaved(job.id);

    // Populate modal elements
    document.getElementById("modal-job-id").textContent = job.id;
    document.getElementById("modal-job-title").textContent = job.title;
    document.getElementById("modal-job-org").textContent = job.organization;
    document.getElementById("modal-job-ministry").textContent = job.ministry || "Government Authority";
    document.getElementById("modal-job-province").textContent = job.province;
    document.getElementById("modal-job-city").textContent = job.city;
    document.getElementById("modal-job-bps").textContent = job.bps || "N/A";
    document.getElementById("modal-job-sector").textContent = job.sector;
    document.getElementById("modal-job-vacancies").textContent = `${job.vacancies} ${job.vacancies > 1 ? 'Positions' : 'Position'}`;
    document.getElementById("modal-job-education").textContent = job.education;
    document.getElementById("modal-job-age").textContent = job.ageLimit;
    document.getElementById("modal-job-agency").textContent = job.testingAgency || "Direct Selection";
    document.getElementById("modal-job-adref").textContent = job.adReference;
    document.getElementById("modal-job-lastdate").textContent = job.lastDate;
    document.getElementById("modal-job-posted").textContent = job.postedDate;
    document.getElementById("modal-job-desc").textContent = job.description;
    document.getElementById("modal-job-syllabus").textContent = job.syllabus || "Standard General Recruitment Test";

    // Setup action buttons
    const applyBtn = document.getElementById("modal-apply-btn");
    applyBtn.href = job.applyLink && job.applyLink !== "#" ? job.applyLink : "https://www.fpsc.gov.pk";
    applyBtn.target = "_blank";

    const bookmarkBtn = document.getElementById("modal-bookmark-btn");
    bookmarkBtn.innerHTML = isSaved ? "★ Saved in Bookmarks" : "☆ Save This Job";
    bookmarkBtn.classList.toggle("saved", isSaved);
    bookmarkBtn.onclick = () => {
      const saved = window.jobManager.toggleSaveJob(job.id);
      bookmarkBtn.innerHTML = saved ? "★ Saved in Bookmarks" : "☆ Save This Job";
      bookmarkBtn.classList.toggle("saved", saved);
      UI.showToast(saved ? `Job ${job.id} saved to your bookmarks!` : `Removed ${job.id} from bookmarks`, "info");
    };

    const shareWaBtn = document.getElementById("modal-share-wa");
    shareWaBtn.onclick = () => UI.shareToWhatsApp(job);

    const copyBtn = document.getElementById("modal-copy-link");
    copyBtn.onclick = () => UI.copyJobLink(job);

    const printBtn = document.getElementById("modal-print-btn");
    printBtn.onclick = () => UI.printJobSlip(job);

    modal.classList.add("active");
    document.body.classList.add("modal-open");
  },

  // Close any modal
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
      document.body.classList.remove("modal-open");
    }
  },

  // WhatsApp Share - widely used for job sharing in Pakistan
  shareToWhatsApp(job) {
    const text = `📢 *PAKISTAN JOB ANNOUNCEMENT*\n\n` +
      `💼 *Post:* ${job.title}\n` +
      `🏢 *Organization:* ${job.organization}\n` +
      `📍 *Location:* ${job.city}, ${job.province}\n` +
      `🎓 *Education:* ${job.education}\n` +
      `⏳ *Last Date:* ${job.lastDate}\n` +
      `🏛️ *Testing Agency:* ${job.testingAgency || 'Official Board'}\n\n` +
      `🔗 Apply Online: ${job.applyLink || 'https://www.fpsc.gov.pk'}\n\n` +
      `Shared via Rozgar Pakistan Daily Job Board`;

    const encoded = encodeURIComponent(text);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, "_blank");
  },

  // Copy direct link to job
  copyJobLink(job) {
    const url = `${window.location.origin}${window.location.pathname}?job=${job.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        UI.showToast("Job link copied to clipboard!", "success");
      });
    } else {
      prompt("Copy this link:", url);
    }
  },

  // Print Clean Slip for offline applicants / archives
  printJobSlip(job) {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recruitment Slip - ${job.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 40px; color: #111; }
          .header { border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 25px; }
          .header h1 { margin: 0; font-size: 24px; color: #0A5C36; }
          .header p { margin: 5px 0 0; color: #666; font-size: 13px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
          .table th { background: #f4f6f8; width: 30%; }
          .footer { margin-top: 40px; font-size: 12px; color: #777; border-top: 1px dashed #ccc; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ROZGAR PAKISTAN - JOB VACANCY NOTICE</h1>
          <p>Official Daily Announcement Archive | Job ID: ${job.id}</p>
        </div>
        <table class="table">
          <tr><th>Post Title</th><td><strong>${job.title}</strong></td></tr>
          <tr><th>Department / Organization</th><td>${job.organization}</td></tr>
          <tr><th>Ministry / Governing Body</th><td>${job.ministry || 'N/A'}</td></tr>
          <tr><th>Scale / BPS</th><td>${job.bps || 'N/A'}</td></tr>
          <tr><th>Quota / Province</th><td>${job.province} (${job.city})</td></tr>
          <tr><th>Vacancies</th><td>${job.vacancies}</td></tr>
          <tr><th>Eligibility / Education</th><td>${job.education}</td></tr>
          <tr><th>Age Bracket</th><td>${job.ageLimit}</td></tr>
          <tr><th>Testing Body</th><td>${job.testingAgency || 'Departmental'}</td></tr>
          <tr><th>Advertisement Ref</th><td>${job.adReference}</td></tr>
          <tr><th>Announcement Date</th><td>${job.postedDate}</td></tr>
          <tr><th>Application Deadline</th><td><strong style="color: #c00;">${job.lastDate}</strong></td></tr>
          <tr><th>Official Application Portal</th><td>${job.applyLink}</td></tr>
        </table>
        <div>
          <h3>Description & Syllabus</h3>
          <p>${job.description}</p>
          <p><strong>Testing Pattern:</strong> ${job.syllabus}</p>
        </div>
        <div class="footer">
          Printed from Rozgar Pakistan (Daily All-Pakistan Jobs Portal). Check official advertisement before applying.
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  },

  // Setup Theme Toggle (Dark/Light)
  initTheme() {
    const savedTheme = localStorage.getItem("rozgar_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const themeToggleBtn = document.getElementById("theme-toggle");
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = savedTheme === "dark" ? "☀️" : "🌙";
      themeToggleBtn.setAttribute("title", savedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode");

      themeToggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("rozgar_theme", newTheme);
        themeToggleBtn.innerHTML = newTheme === "dark" ? "☀️" : "🌙";
        themeToggleBtn.setAttribute("title", newTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode");
      });
    }
  }
};

window.UI = UI;
