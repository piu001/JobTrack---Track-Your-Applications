const API_BASE = "http://localhost:8080/api/applications";

let applications = [];
let editingId = null;

const $ = (id) => document.getElementById(id);


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  // Set today's date in Add Application form
  $("applicationForm").elements.appliedDate.value =
    new Date().toISOString().split("T")[0];


  // Navigation
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      switchView(btn.dataset.view);
    });
  });


  // Dashboard / modal buttons
  $("viewAllBtn").addEventListener(
    "click",
    () => switchView("applications")
  );

  $("openAddBtn").addEventListener(
    "click",
    openModal
  );

  $("closeModalBtn").addEventListener(
    "click",
    closeModal
  );

  $("cancelBtn").addEventListener(
    "click",
    closeModal
  );

  $("modalBackdrop").addEventListener(
    "click",
    closeModal
  );


  // Add application
  $("applicationForm").addEventListener(
    "submit",
    saveApplication
  );


  // Search and filter
  $("searchInput").addEventListener(
    "input",
    renderApplications
  );

  $("statusFilter").addEventListener(
    "change",
    renderApplications
  );


  // Edit page buttons
  $("backToApplicationsBtn").addEventListener(
    "click",
    backToApplications
  );

  $("cancelEditBtn").addEventListener(
    "click",
    backToApplications
  );


  // Edit application
  $("editApplicationForm").addEventListener(
    "submit",
    updateApplication
  );


  // Clear validation messages while typing
  setupValidationListeners();


  // Load data from backend
  loadApplications();
});


/* =========================================================
   VIEW SWITCHING
========================================================= */

function switchView(view) {

  $("dashboardView").classList.toggle(
    "hidden",
    view !== "dashboard"
  );

  $("applicationsView").classList.toggle(
    "hidden",
    view !== "applications"
  );

  $("editApplicationView").classList.toggle(
    "hidden",
    view !== "edit"
  );


  if (view === "dashboard") {
    $("pageTitle").textContent = "Dashboard";
  }


  if (view === "applications") {
    $("pageTitle").textContent = "Applications";
    renderApplications();
  }


  if (view === "edit") {
    $("pageTitle").textContent = "Edit Application";
  }


  document.querySelectorAll(".nav-item").forEach(btn => {

    btn.classList.toggle(
      "active",
      btn.dataset.view === view
    );

  });
}


/* =========================================================
   LOAD APPLICATIONS
========================================================= */

async function loadApplications() {

  try {

    const response = await fetch(API_BASE);


    if (!response.ok) {
      throw new Error("Could not load applications.");
    }


    applications = await response.json();


    renderDashboard();
    renderApplications();


  } catch (error) {

    console.error(error);


    showToast(
      "Backend unavailable — start Spring Boot on port 8080."
    );


    $("recentApplications").innerHTML =
      '<div class="empty-state">' +
      'Could not connect to the backend.<br>' +
      'Make sure Spring Boot is running on <b>localhost:8080</b>.' +
      '</div>';

  }
}


/* =========================================================
   BACKEND ERROR MESSAGE
========================================================= */

async function getErrorMessage(response) {

  try {

    const data = await response.json();


    /*
      Our Spring Boot GlobalExceptionHandler
      returns:

      {
        "message": "Validation failed",
        "errors": {
          "company": "Company name is required"
        }
      }
    */


    if (data.errors) {

      return Object.values(data.errors)
        .join(". ");

    }


    return data.message || "Request failed.";


  } catch {

    return "Something went wrong. Please try again.";

  }
}


/* =========================================================
   ADD APPLICATION
========================================================= */

async function saveApplication(event) {

  event.preventDefault();


  const form = event.target;


  // Clear old validation messages
  clearAddErrors();


  /*
    Frontend validation
    This gives our own messages instead of relying
    only on the browser's default messages.
  */

  if (!validateAddForm(form)) {
    return;
  }


  const formData = new FormData(form);


  const payload = {

    company: formData.get("company"),
    position: formData.get("position"),
    status: formData.get("status"),
    appliedDate: formData.get("appliedDate"),
    jobUrl: formData.get("jobUrl"),
    notes: formData.get("notes")

  };


  try {

    const response = await fetch(API_BASE, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(payload)

    });


    if (!response.ok) {

      const message =
        await getErrorMessage(response);

      throw new Error(message);

    }


    // Success
    closeModal();

    form.reset();


    // Set today's date again
    form.elements.appliedDate.value =
      new Date().toISOString().split("T")[0];


    clearAddErrors();


    showToast(
      "Application added successfully."
    );


    await loadApplications();


  } catch (error) {

    console.error(error);


    showToast(
      error.message ||
      "Could not save application."
    );

  }
}


/* =========================================================
   DELETE APPLICATION
========================================================= */

async function deleteApplication(id) {

  if (!confirm("Delete this application?")) {
    return;
  }


  try {

    const response = await fetch(
      `${API_BASE}/${id}`,
      {
        method: "DELETE"
      }
    );


    if (!response.ok) {
      throw new Error("Delete failed.");
    }


    showToast(
      "Application deleted."
    );


    await loadApplications();


  } catch (error) {

    console.error(error);


    showToast(
      "Could not delete application."
    );

  }
}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

  const count = (status) =>
    applications.filter(
      a => a.status === status
    ).length;


  $("totalStat").textContent =
    applications.length;

  $("appliedStat").textContent =
    count("APPLIED");

  $("interviewStat").textContent =
    count("INTERVIEW");

  $("offerStat").textContent =
    count("OFFER");


  const recent = [...applications]
    .sort(
      (a, b) =>
        new Date(b.appliedDate) -
        new Date(a.appliedDate)
    )
    .slice(0, 5);


  $("recentApplications").innerHTML =
    recent.length

      ? recent
          .map(applicationRow)
          .join("")

      : '<div class="empty-state">' +
        'No applications yet. Add your first one!' +
        '</div>';
}


/* =========================================================
   APPLICATION LIST
========================================================= */

function renderApplications() {

  const search =
    $("searchInput")
      .value
      .trim()
      .toLowerCase();


  const status =
    $("statusFilter").value;


  const filtered =
    applications.filter(a => {

      const matchesSearch =
        !search ||

        (a.company || "")
          .toLowerCase()
          .includes(search) ||

        (a.position || "")
          .toLowerCase()
          .includes(search);


      const matchesStatus =
        !status ||
        a.status === status;


      return (
        matchesSearch &&
        matchesStatus
      );

    });


  $("applicationCount").textContent =
    `${filtered.length} application${
      filtered.length === 1 ? "" : "s"
    }`;


  $("applicationList").innerHTML =
    filtered.length

      ? filtered
          .map(applicationRow)
          .join("")

      : '<div class="empty-state">' +
        'No matching applications.' +
        '</div>';
}


/* =========================================================
   APPLICATION ROW
========================================================= */

function applicationRow(a) {

  const initial =
    (a.company || "?")
      .charAt(0)
      .toUpperCase();


  const status =
    a.status || "APPLIED";


  return `
    <div class="application-row">

      <div class="company-wrap">

        <div class="company-icon">
          ${escapeHtml(initial)}
        </div>

        <div>

          <div class="company">
            ${escapeHtml(a.company || "")}
          </div>

          <div class="position">
            ${escapeHtml(a.position || "")}
          </div>

        </div>

      </div>


      <div class="position">
        ${escapeHtml(a.jobUrl || "No job link")}
      </div>


      <span class="status status-${escapeHtml(status)}">
        ${formatStatus(status)}
      </span>


      <div class="date">
        ${formatDate(a.appliedDate)}
      </div>


      <div class="row-actions">

        <button
          class="more-btn"
          type="button"
          title="Application options"
          aria-label="Application options"
          aria-expanded="false"
          onclick="toggleActionMenu(this)"
        >
          ⋯
        </button>


        <div class="action-menu hidden">

          <button
            type="button"
            onclick="editApplication(${Number(a.id)})"
          >
            Edit
          </button>


          <button
            type="button"
            class="delete-option"
            onclick="deleteApplication(${Number(a.id)})"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  `;
}


/* =========================================================
   FORMAT STATUS
========================================================= */

function formatStatus(status) {

  return (
    status.charAt(0) +
    status.slice(1).toLowerCase()
  );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(date) {

  if (!date) {
    return "-";
  }


  return new Date(date)
    .toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
}


/* =========================================================
   MODAL
========================================================= */

function openModal() {

  $("applicationModal")
    .classList
    .remove("hidden");


  document.body.style.overflow =
    "hidden";


  clearAddErrors();

}


function closeModal() {

  $("applicationModal")
    .classList
    .add("hidden");


  document.body.style.overflow =
    "";

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

  const toast = $("toast");


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  setTimeout(
    () =>
      toast.classList.remove(
        "show"
      ),
    2800
  );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================================
   ACTION MENU
========================================================= */

function toggleActionMenu(button) {

  const rowActions =
    button.closest(
      ".row-actions"
    );


  const menu =
    rowActions.querySelector(
      ".action-menu"
    );


  const willOpen =
    menu.classList.contains(
      "hidden"
    );


  // Close all other menus

  document
    .querySelectorAll(
      ".action-menu"
    )
    .forEach(openMenu => {

      openMenu.classList.add(
        "hidden"
      );


      const otherButton =
        openMenu.parentElement
          .querySelector(
            ".more-btn"
          );


      if (otherButton) {

        otherButton.setAttribute(
          "aria-expanded",
          "false"
        );

      }

    });


  // Open clicked menu

  if (willOpen) {

    menu.classList.remove(
      "hidden"
    );


    button.setAttribute(
      "aria-expanded",
      "true"
    );

  }

}


/* =========================================================
   EDIT APPLICATION
========================================================= */

function editApplication(id) {

  const application =
    applications.find(
      a =>
        Number(a.id) ===
        Number(id)
    );


  if (!application) {
    return;
  }


  editingId = id;


  const form =
    $("editApplicationForm");


  form.elements.company.value =
    application.company || "";


  form.elements.position.value =
    application.position || "";


  form.elements.status.value =
    application.status || "APPLIED";


  form.elements.appliedDate.value =
    application.appliedDate || "";


  form.elements.jobUrl.value =
    application.jobUrl || "";


  form.elements.notes.value =
    application.notes || "";


  clearEditErrors();


  switchView("edit");

}


/* =========================================================
   BACK TO APPLICATIONS
========================================================= */

function backToApplications() {

  editingId = null;


  clearEditErrors();


  switchView(
    "applications"
  );

}


/* =========================================================
   UPDATE APPLICATION
========================================================= */

async function updateApplication(event) {

  event.preventDefault();


  if (editingId === null) {

    showToast(
      "No application selected for editing."
    );

    return;
  }


  const form =
    event.target;


  clearEditErrors();


  // Frontend validation

  if (!validateEditForm(form)) {
    return;
  }


  const formData =
    new FormData(form);


  const payload = {

    company:
      formData.get("company"),

    position:
      formData.get("position"),

    status:
      formData.get("status"),

    appliedDate:
      formData.get("appliedDate"),

    jobUrl:
      formData.get("jobUrl"),

    notes:
      formData.get("notes")

  };


  try {

    const response =
      await fetch(
        `${API_BASE}/${editingId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(
              payload
            )
        }
      );


    if (!response.ok) {

      const message =
        await getErrorMessage(
          response
        );


      throw new Error(
        message
      );

    }


    showToast(
      "Application updated successfully."
    );


    editingId = null;


    form.reset();


    clearEditErrors();


    switchView(
      "applications"
    );


    await loadApplications();


  } catch (error) {

    console.error(error);


    showToast(
      error.message ||
      "Could not update application."
    );

  }

}


/* =========================================================
   FRONTEND VALIDATION
========================================================= */


/*
   Add Application validation
*/

function validateAddForm(form) {

  let valid = true;


  const company =
    form.elements.company.value.trim();


  const position =
    form.elements.position.value.trim();


  const appliedDate =
    form.elements.appliedDate.value;


  const jobUrl =
    form.elements.jobUrl.value.trim();


  // Company

  if (!company) {

    $("companyError").textContent =
      "Company name is required.";

    valid = false;

  }


  // Position

  if (!position) {

    $("positionError").textContent =
      "Position is required.";

    valid = false;

  }


  // Applied date

  if (!appliedDate) {

    $("appliedDateError").textContent =
      "Application date is required.";

    valid = false;

  } else if (isFutureDate(appliedDate)) {

    $("appliedDateError").textContent =
      "Application date cannot be in the future.";

    valid = false;

  }


  // Job URL

  if (
    jobUrl &&
    !isValidUrl(jobUrl)
  ) {

    $("jobUrlError").textContent =
      "Please enter a valid job URL.";

    valid = false;

  }


  return valid;

}


/*
   Edit Application validation
*/

function validateEditForm(form) {

  let valid = true;


  const company =
    form.elements.company.value.trim();


  const position =
    form.elements.position.value.trim();


  const appliedDate =
    form.elements.appliedDate.value;


  const jobUrl =
    form.elements.jobUrl.value.trim();


  // Company

  if (!company) {

    $("editCompanyError").textContent =
      "Company name is required.";

    valid = false;

  }


  // Position

  if (!position) {

    $("editPositionError").textContent =
      "Position is required.";

    valid = false;

  }


  // Applied date

  if (!appliedDate) {

    $("editAppliedDateError").textContent =
      "Application date is required.";

    valid = false;

  } else if (isFutureDate(appliedDate)) {

    $("editAppliedDateError").textContent =
      "Application date cannot be in the future.";

    valid = false;

  }


  // Job URL

  if (
    jobUrl &&
    !isValidUrl(jobUrl)
  ) {

    $("editJobUrlError").textContent =
      "Please enter a valid job URL.";

    valid = false;

  }


  return valid;

}


/* =========================================================
   DATE VALIDATION
========================================================= */

function isFutureDate(dateString) {

  const selectedDate =
    new Date(
      dateString + "T00:00:00"
    );


  const today =
    new Date();


  today.setHours(
    0,
    0,
    0,
    0
  );


  return selectedDate > today;

}


/* =========================================================
   URL VALIDATION
========================================================= */

function isValidUrl(value) {

  try {

    const url =
      new URL(value);


    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );


  } catch {

    return false;

  }

}


/* =========================================================
   CLEAR ADD FORM ERRORS
========================================================= */

function clearAddErrors() {

  $("companyError").textContent =
    "";

  $("positionError").textContent =
    "";

  $("statusError").textContent =
    "";

  $("appliedDateError").textContent =
    "";

  $("jobUrlError").textContent =
    "";

}


/* =========================================================
   CLEAR EDIT FORM ERRORS
========================================================= */

function clearEditErrors() {

  $("editCompanyError").textContent =
    "";

  $("editPositionError").textContent =
    "";

  $("editStatusError").textContent =
    "";

  $("editAppliedDateError").textContent =
    "";

  $("editJobUrlError").textContent =
    "";

}


/* =========================================================
   CLEAR ERRORS WHILE USER TYPES
========================================================= */

function setupValidationListeners() {

  const addForm =
    $("applicationForm");


  const editForm =
    $("editApplicationForm");


  /*
    ADD FORM
  */

  addForm.elements.company
    .addEventListener(
      "input",
      () => {
        $("companyError").textContent = "";
      }
    );


  addForm.elements.position
    .addEventListener(
      "input",
      () => {
        $("positionError").textContent = "";
      }
    );


  addForm.elements.appliedDate
    .addEventListener(
      "input",
      () => {
        $("appliedDateError").textContent = "";
      }
    );


  addForm.elements.jobUrl
    .addEventListener(
      "input",
      () => {
        $("jobUrlError").textContent = "";
      }
    );


  /*
    EDIT FORM
  */

  editForm.elements.company
    .addEventListener(
      "input",
      () => {
        $("editCompanyError").textContent = "";
      }
    );


  editForm.elements.position
    .addEventListener(
      "input",
      () => {
        $("editPositionError").textContent = "";
      }
    );


  editForm.elements.appliedDate
    .addEventListener(
      "input",
      () => {
        $("editAppliedDateError").textContent = "";
      }
    );


  editForm.elements.jobUrl
    .addEventListener(
      "input",
      () => {
        $("editJobUrlError").textContent = "";
      }
    );

}