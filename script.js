/* ════════════════════════════════════════
   NIN APPLICATION — SCRIPT
════════════════════════════════════════ */

let currentStep = 1;
const TOTAL_STEPS = 4;

// ── Generate IDs ──────────────────────────────────────────────
function generateTrackingID() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
    let part1 = "", part2 = "";
    for (let i = 0; i < 9; i++) part1 += chars[Math.floor(Math.random() * chars.length)];
    const digits = String(Math.floor(Math.random() * 9000) + 1000);
    for (let i = 0; i < 2; i++) part2 += chars[Math.floor(Math.random() * 26)];
    return part1 + digits + part2;
}

function generateNIN() {
    return String(Math.floor(10000000000 + Math.random() * 90000000000));
}

// ── Progress bar ──────────────────────────────────────────────
function updateProgress(step) {
    const fill = document.getElementById("progressFill");
    fill.style.width = ((step - 1) / (TOTAL_STEPS - 1) * 87.5 + 12.5) + "%";

    document.querySelectorAll(".step").forEach(el => {
        const s = parseInt(el.dataset.step);
        el.classList.remove("active", "done");
        if (s === step) el.classList.add("active");
        else if (s < step) el.classList.add("done");
    });
}

// ── Step navigation ───────────────────────────────────────────
function showStep(step) {
    document.querySelectorAll(".form-step").forEach(el => {
        el.classList.remove("active");
    });
    const target = document.querySelector(`.form-step[data-step="${step}"]`);
    if (target) target.classList.add("active");
    currentStep = step;
    updateProgress(step);
    window.scrollTo({ top: document.getElementById("progressBar").offsetTop - 20, behavior: "smooth" });
}

function nextStep(from) {
    if (!validateStep(from)) return;
    if (from === TOTAL_STEPS - 1) buildReview();
    showStep(from + 1);
}

function prevStep(from) {
    showStep(from - 1);
}

// ── Validation ────────────────────────────────────────────────
function validateStep(step) {
    const section = document.querySelector(`.form-step[data-step="${step}"]`);
    const required = section.querySelectorAll("[required]");
    let valid = true;

    required.forEach(el => {
        const errEl = el.closest(".field-group")?.querySelector(".field-error");
        if (!el.value.trim()) {
            el.classList.add("invalid");
            if (errEl) errEl.textContent = "This field is required.";
            valid = false;
        } else {
            el.classList.remove("invalid");
            if (errEl) errEl.textContent = "";
        }
    });

    // Special: step 3 — passport photo required
    if (step === 3) {
        const photoInput = document.getElementById("passport_photo");
        const errPhoto = document.getElementById("err-photo");
        if (!photoInput.files || !photoInput.files[0]) {
            document.getElementById("zone-photo").style.borderColor = "var(--error)";
            errPhoto.textContent = "Passport photograph is required.";
            valid = false;
        } else {
            document.getElementById("zone-photo").style.borderColor = "";
            errPhoto.textContent = "";
        }
    }

    // Special: step 4 — consent
    if (step === 4) {
        const consent = document.getElementById("consent");
        const errConsent = document.getElementById("err-consent");
        if (!consent.checked) {
            errConsent.textContent = "You must confirm the declaration to continue.";
            valid = false;
        } else {
            errConsent.textContent = "";
        }
    }

    if (!valid) {
        showToast("Please fill in all required fields.", "error");
    }
    return valid;
}

// Inline validation on blur
document.querySelectorAll("input[required], select[required]").forEach(el => {
    el.addEventListener("blur", () => {
        const errEl = el.closest(".field-group")?.querySelector(".field-error");
        if (!el.value.trim()) {
            el.classList.add("invalid");
            if (errEl) errEl.textContent = "This field is required.";
        } else {
            el.classList.remove("invalid");
            if (errEl) errEl.textContent = "";
        }
    });
    el.addEventListener("input", () => {
        if (el.value.trim()) {
            el.classList.remove("invalid");
            const errEl = el.closest(".field-group")?.querySelector(".field-error");
            if (errEl) errEl.textContent = "";
        }
    });
});

// ── File upload preview ───────────────────────────────────────
function previewFile(key, input) {
    const file = input.files[0];
    if (!file) return;

    const img = document.getElementById("img-" + key);
    const preview = document.getElementById("preview-" + key);
    const zone = document.getElementById("zone-" + key);
    const fname = document.getElementById("fname-" + key);

    fname.textContent = "✓ " + file.name;

    if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = e => {
            img.src = e.target.result;
            img.style.display = "block";
            preview.style.display = "none";
            zone.classList.add("done");
        };
        reader.readAsDataURL(file);
    } else {
        zone.classList.add("done");
        preview.querySelector(".upload-icon").innerHTML = '<i class="fas fa-file-pdf" style="color:var(--error)"></i>';
    }
}

// ── Build review section ──────────────────────────────────────
function buildReview() {
    const get = id => document.getElementById(id)?.value.trim() || "—";
    const getSelect = id => document.getElementById(id)?.options[document.getElementById(id)?.selectedIndex]?.text || "—";
    const photoFile = document.getElementById("passport_photo").files[0];

    const grid = document.getElementById("reviewGrid");
    grid.innerHTML = `
        <div class="review-section-title">Personal Information</div>
        <div class="review-item"><div class="review-label">First Name</div><div class="review-value">${get("first_name")}</div></div>
        <div class="review-item"><div class="review-label">Last Name</div><div class="review-value">${get("last_name")}</div></div>
        <div class="review-item"><div class="review-label">Middle Name</div><div class="review-value">${get("middle_name") || "—"}</div></div>
        <div class="review-item"><div class="review-label">Date of Birth</div><div class="review-value">${formatDate(get("dob"))}</div></div>
        <div class="review-item"><div class="review-label">Place of Birth</div><div class="review-value">${get("place_of_birth")}</div></div>
        <div class="review-item"><div class="review-label">Gender</div><div class="review-value">${getSelect("gender")}</div></div>
        <div class="review-item"><div class="review-label">Marital Status</div><div class="review-value">${getSelect("marital_status")}</div></div>
        <div class="review-item"><div class="review-label">Nationality</div><div class="review-value">${get("nationality")}</div></div>

        <div class="review-section-title">Contact Information</div>
        <div class="review-item full"><div class="review-label">Address</div><div class="review-value">${get("address_street")}, ${get("address_city")}, ${getSelect("address_state")}</div></div>
        <div class="review-item"><div class="review-label">Phone</div><div class="review-value">${get("phone")}</div></div>
        <div class="review-item"><div class="review-label">Email</div><div class="review-value">${get("email") || "—"}</div></div>

        <div class="review-section-title">Documents</div>
        <div class="review-item"><div class="review-label">Passport Photo</div><div class="review-value" style="color:var(--green)">${photoFile ? "✓ " + photoFile.name : "Not uploaded"}</div></div>
        <div class="review-item"><div class="review-label">Birth Certificate</div><div class="review-value" style="color:${document.getElementById('birth_certificate').files[0] ? 'var(--green)' : 'var(--muted)'}">
            ${document.getElementById('birth_certificate').files[0] ? "✓ " + document.getElementById('birth_certificate').files[0].name : "Not uploaded"}</div></div>
        <div class="review-item"><div class="review-label">Proof of Address</div><div class="review-value" style="color:${document.getElementById('proof_of_address').files[0] ? 'var(--green)' : 'var(--muted)'}">
            ${document.getElementById('proof_of_address').files[0] ? "✓ " + document.getElementById('proof_of_address').files[0].name : "Not uploaded"}</div></div>
    `;
}

// ── Format date nicely ────────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr || dateStr === "—") return "—";
    try {
        const d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString("en-NG", { day: "2-digit", month: "long", year: "numeric" });
    } catch { return dateStr; }
}

// ── Toast notification ────────────────────────────────────────
function showToast(msg, type = "success") {
    const toast = document.getElementById("toast");
    const msgEl = document.getElementById("toastMsg");
    const icon = toast.querySelector("i");
    msgEl.textContent = msg;
    icon.className = type === "error" ? "fas fa-exclamation-circle" : "fas fa-check-circle";
    icon.style.color = type === "error" ? "#e74c3c" : "#4caf7d";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3500);
}

// ── Generate barcode bars ─────────────────────────────────────
function generateBarcode(nin) {
    const container = document.getElementById("slipBarcode");
    container.innerHTML = "";
    for (let i = 0; i < 60; i++) {
        const bar = document.createElement("div");
        const digit = parseInt(nin[i % nin.length]);
        const height = 20 + (digit * 2.8);
        bar.style.cssText = `
            width: ${i % 5 === 0 ? 3 : 1.5}px;
            height: ${height}px;
            background: #111;
            border-radius: 0.5px;
            flex-shrink: 0;
        `;
        container.appendChild(bar);
    }
}

// ── Form submit ───────────────────────────────────────────────
const form = document.getElementById("ninForm");
form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateStep(4)) return;

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.querySelector(".btn-text").style.display = "none";
    submitBtn.querySelector(".btn-loader").style.display = "inline-flex";

    // Simulate processing
    setTimeout(() => {
        const firstName = document.getElementById("first_name").value.trim();
        const middleName = document.getElementById("middle_name").value.trim();
        const lastName = document.getElementById("last_name").value.trim();
        const dob = document.getElementById("dob").value;
        const gender = document.getElementById("gender").value;
        const nationality = document.getElementById("nationality").value.trim();
        const addrStreet = document.getElementById("address_street").value.trim();
        const addrCity = document.getElementById("address_city").value.trim();
        const addrState = document.getElementById("address_state").value;
        const photoInput = document.getElementById("passport_photo");
        const photoFile = photoInput.files[0];

        const trackingID = generateTrackingID();
        const nin = generateNIN();
        const today = new Date().toLocaleDateString("en-NG", { day: "2-digit", month: "long", year: "numeric" });

        // Populate slip
        document.getElementById("displayTracking").textContent = trackingID;
        document.getElementById("displayDate").textContent = today;
        document.getElementById("displaySurname").textContent = lastName.toUpperCase();
        document.getElementById("displayFirst").textContent = firstName.toUpperCase();
        document.getElementById("displayMiddle").textContent = middleName ? middleName.toUpperCase() : "—";
        document.getElementById("displayGender").textContent = gender;
        document.getElementById("displayDob").textContent = formatDate(dob);
        document.getElementById("displayNationality").textContent = nationality.toUpperCase();
        document.getElementById("displayAddress").textContent = [addrStreet, addrCity, addrState].filter(Boolean).join(", ").toUpperCase();
        document.getElementById("displayNin").textContent = nin;

        // Photo
        if (photoFile) {
            const reader = new FileReader();
            reader.onload = ev => {
                document.getElementById("slipPhoto").src = ev.target.result;
            };
            reader.readAsDataURL(photoFile);
        }

        // Barcode
        generateBarcode(nin);

        // Show slip, hide form
        document.getElementById("formSection").style.display = "none";
        document.getElementById("progressBar").style.display = "none";
        const slip = document.getElementById("ninSlip");
        slip.style.display = "block";
        slip.scrollIntoView({ behavior: "smooth" });

        showToast("Application submitted successfully! 🎉");
    }, 2000);
});

// ── Download as PDF ───────────────────────────────────────────
function downloadSlip() {
    window.print();
}

// ── Reset form ────────────────────────────────────────────────
function resetForm() {
    form.reset();
    document.getElementById("ninSlip").style.display = "none";
    document.getElementById("formSection").style.display = "block";
    document.getElementById("progressBar").style.display = "block";

    // Reset upload previews
    ["photo", "cert", "addr"].forEach(key => {
        const img = document.getElementById("img-" + key);
        const preview = document.getElementById("preview-" + key);
        const zone = document.getElementById("zone-" + key);
        const fname = document.getElementById("fname-" + key);
        if (img) { img.src = ""; img.style.display = "none"; }
        if (preview) preview.style.display = "flex";
        if (zone) zone.classList.remove("done");
        if (fname) fname.textContent = "";
    });

    showStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Init ──────────────────────────────────────────────────────
updateProgress(1);