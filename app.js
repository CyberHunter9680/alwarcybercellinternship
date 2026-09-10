/**
 * Alwar Police - Cyber Security Internship Portal & Realtime Admin Dashboard
 * Neon PostgreSQL + Vercel Serverless Integration with LocalStorage Fallback
 * Developed by Abhishek Sharma
 */

// App State (Zero fake data - starts with real data only)
let currentApplicants = [];
let selectedSkills = [];
let currentUploadedFile = null;
let isAdminAuthenticated = false;

// DOM Initialization
document.addEventListener("DOMContentLoaded", () => {
  loadLocalCache();
  setupDragAndDrop();
  setupCustomSkillKeyHandler();
  checkRoute();
  fetchApplicantsFromDB();
});

window.addEventListener("hashchange", checkRoute);

/**
 * Route-Based Admin & Form View Dispatcher
 * URL ending in /admin or #admin triggers Admin Auth
 */
function checkRoute() {
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  
  const isAdminRoute = 
    hash === "#admin" || 
    hash.startsWith("#admin") || 
    path.endsWith("/admin") || 
    path.endsWith("/admin.html") || 
    search.includes("admin");

  if (isAdminRoute) {
    if (isAdminAuthenticated) {
      switchView("dashboard");
    } else {
      openModal("pinModal");
      setTimeout(() => {
        const pinInput = document.getElementById("adminPinInput");
        if (pinInput) pinInput.focus();
      }, 150);
    }
  } else {
    switchView("form");
  }
}

/**
 * Load offline cached applicants
 */
function loadLocalCache() {
  const stored = localStorage.getItem("alwar_police_real_applicants_v1");
  if (stored) {
    try {
      currentApplicants = JSON.parse(stored);
    } catch (e) {
      console.error("Error reading cache", e);
      currentApplicants = [];
    }
  } else {
    currentApplicants = [];
  }
}

/**
 * Save current applicants to local cache
 */
function saveLocalCache() {
  localStorage.setItem("alwar_police_real_applicants_v1", JSON.stringify(currentApplicants));
}

/**
 * Fetch Realtime Applicants from Neon PostgreSQL Backend (/api/applicants)
 */
async function fetchApplicantsFromDB() {
  const syncBadge = document.getElementById("dbSyncStatus");
  
  try {
    const res = await fetch("/api/applicants", {
      headers: { "Cache-Control": "no-cache" }
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        currentApplicants = result.data;
        saveLocalCache();
        if (syncBadge) {
          syncBadge.textContent = "🟢 Realtime Neon Database Active";
          syncBadge.style.color = "#4ade80";
        }
      }
    }
  } catch (err) {
    console.log("Running in offline/local client mode:", err.message);
    if (syncBadge) {
      syncBadge.textContent = "🟡 Client Mode (Syncing Locally)";
      syncBadge.style.color = "#facc15";
    }
  }

  loadDashboardData();
}

/**
 * View Switcher: 'form' or 'dashboard'
 */
function switchView(viewName) {
  const formView = document.getElementById("formView");
  const dashView = document.getElementById("dashboardView");
  const heroBanner = document.getElementById("heroBanner");

  if (viewName === "form") {
    if (formView) formView.classList.add("active");
    if (dashView) dashView.classList.remove("active");
    if (heroBanner) heroBanner.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (viewName === "dashboard") {
    if (formView) formView.classList.remove("active");
    if (dashView) dashView.classList.add("active");
    if (heroBanner) heroBanner.style.display = "none";
    loadDashboardData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/**
 * Admin Authentication Logic
 */
function validateAdminPin() {
  const pinInput = document.getElementById("adminPinInput");
  const enteredPin = pinInput.value.trim();
  
  if (enteredPin === "1122" || enteredPin === "admin") {
    isAdminAuthenticated = true;
    closeModal("pinModal");
    pinInput.value = "";
    showToast("Officer Authentication Successful!", "success");
    window.location.hash = "#admin";
    switchView("dashboard");
    fetchApplicantsFromDB();
  } else {
    showToast("Invalid Security PIN! Please try again.", "error");
    pinInput.value = "";
    pinInput.focus();
  }
}

function quickDemoLogin() {
  isAdminAuthenticated = true;
  closeModal("pinModal");
  showToast("Officer Demo Access Granted!", "info");
  window.location.hash = "#admin";
  switchView("dashboard");
  fetchApplicantsFromDB();
}

function exitAdminPortal() {
  isAdminAuthenticated = false;
  window.location.hash = "#form";
  switchView("form");
  showToast("Logged out of Officer Portal", "info");
}

/* ==========================================================================
   SKILLS SELECTION & TAG MANAGEMENT
   ========================================================================== */

function toggleSkill(chipElement) {
  const skill = chipElement.getAttribute("data-skill");
  if (selectedSkills.includes(skill)) {
    selectedSkills = selectedSkills.filter(s => s !== skill);
    chipElement.classList.remove("selected");
  } else {
    selectedSkills.push(skill);
    chipElement.classList.add("selected");
  }
  document.getElementById("selectedSkillsJson").value = JSON.stringify(selectedSkills);
  
  if (selectedSkills.length > 0) {
    document.getElementById("group-skills").classList.remove("has-error");
  }
}

function setupCustomSkillKeyHandler() {
  const input = document.getElementById("customSkillInput");
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addCustomSkill();
      }
    });
  }
}

function addCustomSkill() {
  const input = document.getElementById("customSkillInput");
  const skillText = input.value.trim();
  
  if (!skillText) return;
  
  if (selectedSkills.includes(skillText)) {
    showToast("This skill is already added", "info");
    input.value = "";
    return;
  }

  selectedSkills.push(skillText);
  document.getElementById("selectedSkillsJson").value = JSON.stringify(selectedSkills);

  const container = document.getElementById("presetSkillsContainer");
  const newChip = document.createElement("button");
  newChip.type = "button";
  newChip.className = "skill-chip selected";
  newChip.setAttribute("data-skill", skillText);
  newChip.onclick = () => toggleSkill(newChip);
  newChip.innerHTML = `
    <span class="chip-dot"></span>
    ${escapeHtml(skillText)}
  `;
  container.appendChild(newChip);

  input.value = "";
  document.getElementById("group-skills").classList.remove("has-error");
}

/* ==========================================================================
   RESUME FILE UPLOAD & DRAG/DROP
   ========================================================================== */

function setupDragAndDrop() {
  const dropZone = document.getElementById("resumeDropZone");
  if (!dropZone) return;

  ["dragenter", "dragover"].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add("dragover");
    }, false);
  });

  ["dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove("dragover");
    }, false);
  });

  dropZone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      processSelectedFile(files[0]);
    }
  }, false);
}

function handleFileSelect(input) {
  if (input.files && input.files[0]) {
    processSelectedFile(input.files[0]);
  }
}

function processSelectedFile(file) {
  const allowedExtensions = [".pdf", ".doc", ".docx"];
  const fileExt = "." + file.name.split(".").pop().toLowerCase();
  
  if (!allowedExtensions.includes(fileExt)) {
    showToast("Please upload file in .pdf, .doc, or .docx format only", "error");
    return;
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    showToast("File size exceeds 5MB limit", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    currentUploadedFile = {
      name: file.name,
      size: formatFileSize(file.size),
      dataUrl: e.target.result
    };
    
    document.getElementById("fileNameDisplay").textContent = file.name;
    document.getElementById("fileSizeDisplay").textContent = formatFileSize(file.size);
    document.getElementById("filePreviewCard").style.display = "flex";
    document.getElementById("resumeDropZone").style.display = "none";
    document.getElementById("group-resume").classList.remove("has-error");
  };
  reader.readAsDataURL(file);
}

function removeSelectedFile() {
  currentUploadedFile = null;
  const fileInput = document.getElementById("resumeFileInput");
  if (fileInput) fileInput.value = "";
  document.getElementById("filePreviewCard").style.display = "none";
  document.getElementById("resumeDropZone").style.display = "block";
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function updateCharCounter(textarea) {
  const countSpan = document.getElementById("whyJoinCount");
  if (countSpan) {
    countSpan.textContent = textarea.value.length;
  }
  if (textarea.value.trim().length >= 30) {
    document.getElementById("group-whyJoin").classList.remove("has-error");
  }
}

/* ==========================================================================
   FORM VALIDATION & SUBMISSION (REALTIME API + DB)
   ========================================================================== */

async function handleFormSubmit(event) {
  event.preventDefault();

  const studentName = document.getElementById("studentName").value.trim();
  const course = document.getElementById("course").value;
  const yearSem = document.getElementById("yearSem").value;
  const duration = document.getElementById("internshipDuration").value;
  const college = document.getElementById("college").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const email = document.getElementById("email").value.trim();
  const whyJoin = document.getElementById("whyJoin").value.trim();
  const pledgeChecked = document.getElementById("pledgeCheck").checked;

  let isValid = true;

  if (!studentName || studentName.length < 2) {
    markFieldError("group-studentName");
    isValid = false;
  } else {
    clearFieldError("group-studentName");
  }

  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(mobile)) {
    markFieldError("group-mobile");
    isValid = false;
  } else {
    clearFieldError("group-mobile");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    markFieldError("group-email");
    isValid = false;
  } else {
    clearFieldError("group-email");
  }

  if (!course) {
    markFieldError("group-course");
    isValid = false;
  } else {
    clearFieldError("group-course");
  }

  if (!yearSem) {
    markFieldError("group-yearSem");
    isValid = false;
  } else {
    clearFieldError("group-yearSem");
  }

  if (!duration) {
    markFieldError("group-duration");
    isValid = false;
  } else {
    clearFieldError("group-duration");
  }

  if (!college || college.length < 3) {
    markFieldError("group-college");
    isValid = false;
  } else {
    clearFieldError("group-college");
  }

  if (selectedSkills.length === 0) {
    markFieldError("group-skills");
    isValid = false;
  } else {
    clearFieldError("group-skills");
  }

  if (!whyJoin || whyJoin.length < 30) {
    markFieldError("group-whyJoin");
    isValid = false;
  } else {
    clearFieldError("group-whyJoin");
  }

  if (!currentUploadedFile) {
    markFieldError("group-resume");
    isValid = false;
  } else {
    clearFieldError("group-resume");
  }

  if (!pledgeChecked) {
    showToast("Please agree to the ethics & confidentiality declaration", "error");
    isValid = false;
  }

  if (!isValid) {
    showToast("Please complete all required fields correctly", "error");
    return;
  }

  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.7";
  }

  // Create New Applicant Record
  const newAppId = generateApplicationId();
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const newApplicant = {
    id: newAppId,
    name: studentName,
    mobile: mobile,
    email: email,
    course: course,
    yearSem: yearSem,
    duration: duration,
    college: college,
    skills: [...selectedSkills],
    whyJoin: whyJoin,
    resumeName: currentUploadedFile.name,
    resumeSize: currentUploadedFile.size,
    resumeData: currentUploadedFile.dataUrl,
    status: "Pending",
    appliedAt: formattedDate
  };

  // Attempt Realtime Backend Save
  try {
    await fetch("/api/applicants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newApplicant)
    });
  } catch (e) {
    console.log("Local offline submission:", e);
  }

  // Update State & Local Storage
  currentApplicants.unshift(newApplicant);
  saveLocalCache();

  // Populate Slip
  document.getElementById("slipAppId").textContent = newAppId;
  document.getElementById("slipName").textContent = studentName;
  document.getElementById("slipDuration").textContent = duration;
  document.getElementById("slipCourse").textContent = `${course} (${yearSem})`;
  document.getElementById("slipCollege").textContent = college;
  document.getElementById("slipMobile").textContent = mobile;
  document.getElementById("slipEmail").textContent = email;

  openModal("successModal");
  showToast("Application Registered Successfully in Database!", "success");

  resetApplicationForm();

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
  }
}

function markFieldError(groupId) {
  const el = document.getElementById(groupId);
  if (el) el.classList.add("has-error");
}

function clearFieldError(groupId) {
  const el = document.getElementById(groupId);
  if (el) el.classList.remove("has-error");
}

function resetApplicationForm() {
  document.getElementById("internshipForm").reset();
  selectedSkills = [];
  document.getElementById("selectedSkillsJson").value = "[]";
  document.querySelectorAll(".skill-chip").forEach(chip => chip.classList.remove("selected"));
  document.querySelectorAll(".form-group").forEach(group => group.classList.remove("has-error"));
  document.getElementById("whyJoinCount").textContent = "0";
  removeSelectedFile();
}

function generateApplicationId() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `RJ-ALW-CYBER-2026-${randomNum}`;
}

function copyAppId() {
  const appId = document.getElementById("slipAppId").textContent;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(appId).then(() => {
      showToast("Application ID copied to clipboard!", "success");
    }).catch(() => {
      fallbackCopy(appId);
    });
  } else {
    fallbackCopy(appId);
  }
}

function fallbackCopy(text) {
  const temp = document.createElement("textarea");
  temp.value = text;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);
  showToast("Application ID copied to clipboard!", "success");
}

/* ==========================================================================
   DELETE APPLICANT FUNCTION (REALTIME NEON DB + LOCAL)
   ========================================================================== */

async function deleteApplicant(appId) {
  const applicant = currentApplicants.find(a => a.id === appId);
  const studentName = applicant ? applicant.name : appId;

  const confirmed = confirm(`Are you sure you want to permanently delete the application of "${studentName}" (${appId})?`);
  if (!confirmed) return;

  // Realtime API Delete call
  try {
    await fetch(`/api/applicants?id=${encodeURIComponent(appId)}`, {
      method: "DELETE"
    });
  } catch (e) {
    console.log("Local offline delete:", e);
  }

  // Update State
  currentApplicants = currentApplicants.filter(a => a.id !== appId);
  saveLocalCache();
  loadDashboardData();
  showToast(`Applicant ${appId} deleted successfully!`, "success");
}

/* ==========================================================================
   RESUME VIEWER & DOWNLOAD FUNCTIONS
   ========================================================================== */

function viewResume(appId) {
  const applicant = currentApplicants.find(a => a.id === appId);
  if (!applicant || !applicant.resumeData) {
    showToast("Resume file not available", "error");
    return;
  }

  const modal = document.getElementById("resumeViewerModal");
  const iframe = document.getElementById("resumeViewerFrame");
  const title = document.getElementById("resumeViewerTitle");
  const downloadBtn = document.getElementById("resumeModalDownloadBtn");

  title.textContent = `Resume - ${applicant.name} (${applicant.resumeName || "Document"})`;
  downloadBtn.onclick = () => downloadResume(appId);

  // Set iframe source
  iframe.src = applicant.resumeData;

  openModal("resumeViewerModal");
}

function downloadResume(appId) {
  const applicant = currentApplicants.find(a => a.id === appId);
  if (!applicant || !applicant.resumeData) {
    showToast("Resume file not available", "error");
    return;
  }

  const link = document.createElement("a");
  link.href = applicant.resumeData;
  link.download = applicant.resumeName || `${applicant.name}_Resume.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Resume download initiated", "info");
}

/* ==========================================================================
   DASHBOARD DATA & TABLE RENDERING (MOBILE & DESKTOP)
   ========================================================================== */

function loadDashboardData() {
  const metricTotal = document.getElementById("metricTotal");
  if (metricTotal) {
    metricTotal.textContent = currentApplicants.length;
  }
  filterApplicants();
}

function filterApplicants() {
  const searchInput = document.getElementById("dashboardSearchInput");
  const search = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const durationFilter = document.getElementById("durationFilter").value;
  const courseFilter = document.getElementById("courseFilter").value;
  
  const filtered = currentApplicants.filter(app => {
    const matchesSearch = 
      (app.name && app.name.toLowerCase().includes(search)) ||
      (app.id && app.id.toLowerCase().includes(search)) ||
      (app.college && app.college.toLowerCase().includes(search)) ||
      (app.email && app.email.toLowerCase().includes(search)) ||
      (app.duration && app.duration.toLowerCase().includes(search)) ||
      (app.mobile && app.mobile.includes(search)) ||
      (app.skills && app.skills.some(s => s.toLowerCase().includes(search)));

    const matchesDuration = durationFilter === "ALL" || (app.duration && app.duration.includes(durationFilter));
    const matchesCourse = courseFilter === "ALL" || (app.course && app.course.includes(courseFilter));

    return matchesSearch && matchesDuration && matchesCourse;
  });

  renderApplicantRows(filtered);
}

function renderApplicantRows(applicants) {
  const tableBody = document.getElementById("applicantTableBody");
  const mobileList = document.getElementById("mobileApplicantCards");
  const emptyState = document.getElementById("emptyState");
  
  if (!tableBody) return;
  tableBody.innerHTML = "";
  if (mobileList) mobileList.innerHTML = "";

  if (applicants.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    return;
  } else {
    if (emptyState) emptyState.style.display = "none";
  }

  applicants.forEach(app => {
    // 1. Desktop Table Row
    const tr = document.createElement("tr");

    let skillsHtml = "";
    const appSkills = app.skills || [];
    const displaySkills = appSkills.slice(0, 3);
    displaySkills.forEach(sk => {
      skillsHtml += `<span class="skill-micro-badge">${escapeHtml(sk)}</span>`;
    });
    if (appSkills.length > 3) {
      skillsHtml += `<span class="skill-micro-badge" style="color:var(--gold-primary)">+${appSkills.length - 3}</span>`;
    }

    tr.innerHTML = `
      <td>
        <span class="applicant-id-pill">${escapeHtml(app.id)}</span>
        <div style="font-size:0.72rem; color:var(--text-muted); margin-top:0.3rem;">${escapeHtml(app.appliedAt || "Recent")}</div>
      </td>
      <td>
        <div class="applicant-name-cell">
          <span class="applicant-name-text">${escapeHtml(app.name)}</span>
          <span class="applicant-email-text">${escapeHtml(app.email)}</span>
          <span style="font-size:0.75rem; color:var(--cyan-primary); margin-top:2px;">📱 ${escapeHtml(app.mobile)}</span>
        </div>
      </td>
      <td>
        <span class="skill-micro-badge" style="background:rgba(245,158,11,0.12); color:var(--gold-light); font-weight:700;">
          ⏱️ ${escapeHtml(app.duration || "1 Month")}
        </span>
      </td>
      <td>
        <div class="applicant-course-tag">${escapeHtml(app.course)}</div>
        <div style="font-size:0.72rem; color:var(--text-muted);">${escapeHtml(app.yearSem || "")}</div>
      </td>
      <td class="applicant-college-cell">
        <div class="applicant-college-text" title="${escapeHtml(app.college)}">${escapeHtml(app.college)}</div>
      </td>
      <td>
        <div class="skills-pill-list">${skillsHtml}</div>
      </td>
      <td style="max-width: 220px;">
        <div style="font-size: 0.8rem; color: var(--text-secondary); max-height: 52px; overflow-y: auto; line-height: 1.4; white-space: pre-wrap;" title="${escapeHtml(app.whyJoin)}">${escapeHtml(app.whyJoin)}</div>
      </td>
      <td>
        <div style="display: flex; gap: 0.35rem; align-items: center;">
          <button class="btn-table-icon" style="background: rgba(0, 240, 255, 0.12); border-color: rgba(0, 240, 255, 0.3); color: var(--cyan-primary);" title="View Resume Preview" onclick="viewResume('${app.id}')">
            👁️
          </button>
          <button class="btn-table-icon" title="Download Resume" onclick="downloadResume('${app.id}')">
            📥
          </button>
        </div>
      </td>
      <td>
        <button class="btn-table-icon" style="background: rgba(239, 68, 68, 0.12); border-color: rgba(239, 68, 68, 0.35); color: #f87171;" title="Delete Applicant" onclick="deleteApplicant('${app.id}')">
          🗑️
        </button>
      </td>
    `;
    tableBody.appendChild(tr);

    // 2. Mobile Responsive Card
    if (mobileList) {
      const mCard = document.createElement("div");
      mCard.className = "mobile-app-card";
      mCard.innerHTML = `
        <div class="m-card-top">
          <div>
            <span class="applicant-id-pill">${escapeHtml(app.id)}</span>
            <div class="m-card-name" style="margin-top:0.35rem;">${escapeHtml(app.name)}</div>
          </div>
          <button style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; border-radius: 8px; padding: 0.3rem 0.6rem; cursor: pointer; font-size: 0.8rem;" onclick="deleteApplicant('${app.id}')">
            🗑️ Delete
          </button>
        </div>

        <div class="m-card-info-row">
          <div class="m-info-item">
            <span class="m-info-label">Duration</span>
            <span class="m-info-val" style="color:var(--gold-primary); font-weight:700;">${escapeHtml(app.duration || "1 Month")}</span>
          </div>
          <div class="m-info-item">
            <span class="m-info-label">College</span>
            <span class="m-info-val">${escapeHtml(app.college)}</span>
          </div>
          <div class="m-info-item">
            <span class="m-info-label">Course</span>
            <span class="m-info-val">${escapeHtml(app.course)}</span>
          </div>
          <div class="m-info-item">
            <span class="m-info-label">Contact</span>
            <span class="m-info-val">${escapeHtml(app.mobile)}</span>
          </div>
        </div>

        <div style="margin-top:0.2rem;">
          <span class="m-info-label" style="display:block; margin-bottom:0.25rem;">Why Join (SOP):</span>
          <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4;">${escapeHtml(app.whyJoin)}</div>
        </div>

        <div style="margin-top:0.35rem;">
          <span class="m-info-label" style="display:block; margin-bottom:0.25rem;">Skills:</span>
          <div class="skills-pill-list">${skillsHtml}</div>
        </div>

        <div class="m-card-actions">
          <button class="m-btn-full btn-action btn-export" onclick="viewResume('${app.id}')">
            <span>👁️ View Resume</span>
          </button>
          <button class="m-btn-full btn-action btn-refresh" onclick="downloadResume('${app.id}')">
            <span>📥 Download</span>
          </button>
        </div>
      `;
      mobileList.appendChild(mCard);
    }
  });
}

/* ==========================================================================
   EXPORT TO CSV FUNCTIONALITY
   ========================================================================== */

function exportApplicantsCSV() {
  if (currentApplicants.length === 0) {
    showToast("No applicant records to export", "error");
    return;
  }

  const headers = [
    "Application ID",
    "Student Name",
    "Duration",
    "Course",
    "Year/Sem",
    "University/College",
    "Mobile",
    "Email",
    "Skills",
    "Why Join Internship",
    "Applied Date"
  ];

  const rows = currentApplicants.map(app => [
    app.id,
    `"${(app.name || "").replace(/"/g, '""')}"`,
    `"${(app.duration || "").replace(/"/g, '""')}"`,
    `"${(app.course || "").replace(/"/g, '""')}"`,
    `"${(app.yearSem || "").replace(/"/g, '""')}"`,
    `"${(app.college || "").replace(/"/g, '""')}"`,
    `"${app.mobile || ""}"`,
    `"${app.email || ""}"`,
    `"${(app.skills || []).join(", ").replace(/"/g, '""')}"`,
    `"${(app.whyJoin || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    `"${app.appliedAt || ""}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Alwar_Police_Cyber_Internship_Applicants_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast("Excel/CSV exported successfully!", "success");
}

/* ==========================================================================
   MODAL UTILITIES & TOAST ALERTS
   ========================================================================== */

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    if (modalId === "resumeViewerModal") {
      const iframe = document.getElementById("resumeViewerFrame");
      if (iframe) iframe.src = "";
    }
  }
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("active");
    if (e.target.id === "pinModal") {
      window.location.hash = "#form";
    }
    if (e.target.id === "resumeViewerModal") {
      const iframe = document.getElementById("resumeViewerFrame");
      if (iframe) iframe.src = "";
    }
  }
});

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  let iconSvg = "";
  if (type === "success") {
    iconSvg = `<svg width="20" height="20" fill="currentColor" color="#4ade80" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`;
  } else if (type === "error") {
    iconSvg = `<svg width="20" height="20" fill="currentColor" color="#f87171" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>`;
  } else {
    iconSvg = `<svg width="20" height="20" fill="currentColor" color="#38bdf8" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <span style="flex:1;">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
