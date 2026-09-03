/* =====================================================================
   PAW TRAILS — Animal Welfare Initiative by CubeWorkSocial
   Script: js/script.js
   Vanilla JavaScript only. No dependencies. Frontend-only (no backend).

   TABLE OF CONTENTS
   1.  DOM Ready
   2.  Utility Functions
   3.  Mobile Navigation
   4.  Navbar Scroll State
   5.  Scroll Reveal
   6.  Impact Counters
   7.  Animal Filters
   8.  Gallery Filters
   9.  Donation Amounts
   10. Form Validation
   11. Toast Notifications
   12. Animal Story Modal
   13. Gallery Lightbox
   14. Footer Year
   15. Scroll Progress Bar (bonus — matches existing #pawTrail markup)
   16. Initialization
===================================================================== */

(function () {
  "use strict";

  /* =====================================================================
     1. DOM READY
  ===================================================================== */

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    initMobileMenu();
    initNavbar();
    initScrollReveal();
    initCounters();
    initAnimalFilters();
    initGalleryFilters();
    initDonationSelector();
    initForms();
    initAnimalModal();
    initGalleryLightbox();
    initFooterYear();
    initScrollProgress();
    initSmoothNav();
  }

  /* =====================================================================
     2. UTILITY FUNCTIONS
  ===================================================================== */

  /** Shortcut for querySelector, scoped optionally to a root. */
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  /** Shortcut for querySelectorAll → returns a real array. */
  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  /** True if the user prefers reduced motion. */
  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  /** Simple, safe email format check. */
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  /** Simple phone check — allows digits, spaces, +, -, parentheses, 7-15 digits. */
  function isValidPhone(value) {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }

  /* =====================================================================
     3. MOBILE NAVIGATION
  ===================================================================== */

  function initMobileMenu() {
    const hamburgerBtn = qs("#hamburgerBtn");
    const mobileNav = qs("#mobileNav");

    if (!hamburgerBtn || !mobileNav) return;

    function openMenu() {
      mobileNav.classList.add("is-open");
      hamburgerBtn.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
      mobileNav.classList.remove("is-open");
      hamburgerBtn.setAttribute("aria-expanded", "false");
    }

    function toggleMenu() {
      const isOpen = mobileNav.classList.contains("is-open");
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    hamburgerBtn.addEventListener("click", toggleMenu);

    // Close the mobile menu when any nav link inside it is clicked.
    qsa("a", mobileNav).forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Close on Escape key, wherever focus is.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileNav.classList.contains("is-open")) {
        closeMenu();
        hamburgerBtn.focus();
      }
    });

    // Close if the viewport is resized back up to desktop width.
    window.addEventListener("resize", function () {
      if (window.innerWidth > 991 && mobileNav.classList.contains("is-open")) {
        closeMenu();
      }
    });
  }

  /* =====================================================================
     4. NAVBAR SCROLL STATE
  ===================================================================== */

  function initNavbar() {
    const header = qs("#siteHeader");
    if (!header) return;

    let ticking = false;
    const SCROLL_THRESHOLD = 12;

    function updateHeaderState() {
      if (window.scrollY > SCROLL_THRESHOLD) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateHeaderState);
        ticking = true;
      }
    }

    // Set initial state (e.g. page loaded already scrolled/refreshed mid-page).
    updateHeaderState();

    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* =====================================================================
     5. SCROLL REVEAL
  ===================================================================== */

  function initScrollReveal() {
    const revealEls = qsa("[data-reveal]");
    if (!revealEls.length) return;

    // If the user prefers reduced motion, or IntersectionObserver isn't
    // supported, just show everything immediately.
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* =====================================================================
     6. IMPACT COUNTERS
  ===================================================================== */

  function initCounters() {
    const counterEls = qsa(".impact__stat[data-counter]");
    if (!counterEls.length) return;

    const reducedMotion = prefersReducedMotion();
    let hasAnimated = false;

    function animateCounter(statEl) {
      const numberEl = qs(".impact__number", statEl);
      if (!numberEl) return;

      const target = parseInt(statEl.getAttribute("data-counter"), 10) || 0;
      const suffix = statEl.getAttribute("data-suffix") || "";

      if (reducedMotion) {
        numberEl.textContent = target + suffix;
        return;
      }

      const duration = 1600; // ms
      const startTime = performance.now();

      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out for a smooth, professional finish.
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(eased * target);

        numberEl.textContent = currentValue + suffix;

        if (progress < 1) {
          window.requestAnimationFrame(tick);
        } else {
          numberEl.textContent = target + suffix;
        }
      }

      window.requestAnimationFrame(tick);
    }

    function runAllCounters() {
      if (hasAnimated) return;
      hasAnimated = true;
      counterEls.forEach(animateCounter);
    }

    // Trigger counting when the impact section scrolls into view.
    const impactSection = qs("#impact") || counterEls[0].closest("section");

    if (!impactSection || !("IntersectionObserver" in window)) {
      runAllCounters();
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runAllCounters();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(impactSection);
  }

  /* =====================================================================
     7. ANIMAL FILTERS
  ===================================================================== */

  function initAnimalFilters() {
    const filterBar = qs(".animal-filters");
    const grid = qs("#animalGrid");
    if (!filterBar || !grid) return;

    const chips = qsa(".chip[data-filter]", filterBar);
    const cards = qsa(".animal-card[data-status]", grid);
    if (!chips.length || !cards.length) return;

    function applyFilter(filterValue) {
      cards.forEach(function (card) {
        const status = card.getAttribute("data-status");
        const matches = filterValue === "all" || status === filterValue;
        card.classList.toggle("is-visible", matches);
      });
    }

    function setActiveChip(activeChip) {
      chips.forEach(function (chip) {
        chip.classList.toggle("is-active", chip === activeChip);
      });
    }

    // Event delegation on the filter bar.
    filterBar.addEventListener("click", function (e) {
      const chip = e.target.closest(".chip[data-filter]");
      if (!chip || !filterBar.contains(chip)) return;

      const filterValue = chip.getAttribute("data-filter");
      setActiveChip(chip);
      applyFilter(filterValue);
    });

    // Initial state: show whichever chip already has .is-active (defaults to "all").
    const initialChip = qs(".chip.is-active", filterBar) || chips[0];
    setActiveChip(initialChip);
    applyFilter(initialChip.getAttribute("data-filter"));
  }

  /* =====================================================================
     8. GALLERY FILTERS
  ===================================================================== */

  function initGalleryFilters() {
    const filterBar = qs(".gallery-filters");
    const grid = qs("#galleryGrid");
    if (!filterBar || !grid) return;

    const chips = qsa(".chip[data-gfilter]", filterBar);
    const items = qsa(".gallery-item[data-cat]", grid);
    if (!chips.length || !items.length) return;

    function applyFilter(filterValue) {
      items.forEach(function (item) {
        const cat = item.getAttribute("data-cat");
        const matches = filterValue === "all" || cat === filterValue;
        item.classList.toggle("is-visible", matches);
      });
    }

    function setActiveChip(activeChip) {
      chips.forEach(function (chip) {
        chip.classList.toggle("is-active", chip === activeChip);
      });
    }

    filterBar.addEventListener("click", function (e) {
      const chip = e.target.closest(".chip[data-gfilter]");
      if (!chip || !filterBar.contains(chip)) return;

      const filterValue = chip.getAttribute("data-gfilter");
      setActiveChip(chip);
      applyFilter(filterValue);
    });

    const initialChip = qs(".chip.is-active", filterBar) || chips[0];
    setActiveChip(initialChip);
    applyFilter(initialChip.getAttribute("data-gfilter"));
  }

  /* =====================================================================
     9. DONATION AMOUNTS
  ===================================================================== */

  function initDonationSelector() {
    const picker = qs(".amount-picker");
    if (!picker) return;

    const presetChips = qsa(".amount-chip[data-amount]", picker);
    const customInput = qs("#customAmount", picker);
    const customChip = qs(".amount-chip--custom", picker);

    // Holds the currently selected donation amount for future payment
    // integration (e.g. window.PawTrailsDonation.amount).
    const donationState = { amount: null };
    window.PawTrailsDonation = donationState;

    function clearActiveStates() {
      presetChips.forEach(function (chip) {
        chip.classList.remove("is-active");
      });
      if (customChip) customChip.classList.remove("is-active");
    }

    presetChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        clearActiveStates();
        chip.classList.add("is-active");
        const amount = parseInt(chip.getAttribute("data-amount"), 10);
        donationState.amount = amount;
        if (customInput) customInput.value = "";
      });
    });

    if (customInput) {
      customInput.addEventListener("input", function () {
        const raw = customInput.value.trim();

        if (raw === "") {
          donationState.amount = null;
          if (customChip) customChip.classList.remove("is-active");
          return;
        }

        const value = Number(raw);

        // Reject invalid, negative, or zero amounts.
        if (isNaN(value) || value <= 0) {
          donationState.amount = null;
          if (customChip) customChip.classList.remove("is-active");
          customInput.setAttribute("aria-invalid", "true");
          return;
        }

        customInput.removeAttribute("aria-invalid");
        clearActiveStates();
        if (customChip) customChip.classList.add("is-active");
        donationState.amount = value;
      });

      // Prevent negative numbers from being typed via the number spinner.
      customInput.addEventListener("keydown", function (e) {
        if (e.key === "-" || e.key === "e") {
          e.preventDefault();
        }
      });
    }
  }

  /* =====================================================================
     10. FORM VALIDATION
  ===================================================================== */

  function initForms() {
    setupForm("adoptionForm", "adoptFormStatus");
    setupForm("reportForm", "reportFormStatus");
    setupForm("volunteerForm", "volunteerFormStatus");
    setupForm("contactForm", "contactFormStatus");
  }

  /**
   * Wires up validation + demo "submission" behavior for a single form.
   * @param {string} formId
   * @param {string} statusId
   */
  function setupForm(formId, statusId) {
    const form = qs("#" + formId);
    if (!form) return;

    const statusEl = qs("#" + statusId);

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const isValid = validateForm(form);

      if (!isValid) {
        showFormStatus(statusEl, "Please fix the highlighted fields.", "error");
        showToast("Please correct the errors in the form.", "error");
        return;
      }

      if (formId === "contactForm") {
        // Send the contact form to the owner's email through FormSubmit.
        // This keeps the site static; FormSubmit may ask the owner to
        // confirm the email address the first time it receives a message.
        const submitButton = qs("button[type='submit']", form);
        if (submitButton) submitButton.disabled = true;
        showFormStatus(statusEl, "Sending your message...", "success");

        fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { "Accept": "application/json" }
        })
          .then(function (response) {
            if (!response.ok) throw new Error("Submission failed");
            // FormSubmit may respond with JSON or HTML — we only care
            // about the HTTP status, so don't force .json() parsing.
            return response;
          })
          .then(function () {
            showFormStatus(
              statusEl,
              "✓ Your message has been sent successfully.",
              "success"
            );
            showToast("✓ Your message has been sent successfully.", "success");
            form.reset();
            clearAllFieldErrors(form);
          })
          .catch(function () {
            showFormStatus(
              statusEl,
              "Sorry, your message could not be sent. Please try again.",
              "error"
            );
            showToast("Sorry, your message could not be sent.", "error");
          })
          .finally(function () {
            if (submitButton) submitButton.disabled = false;
          });
        return;
      }

      // Frontend-only demo behavior for the other forms.
      showFormStatus(
        statusEl,
        "✓ Thank you! Your request has been received in this demo.",
        "success"
      );
      showToast("✓ Your request has been submitted successfully.", "success");

      form.reset();
      clearAllFieldErrors(form);

      // Reset dependent UI state for specific forms.
      if (formId === "adoptionForm" || formId === "volunteerForm") {
        // no extra state to reset currently
      }
    });

    // Clear a field's error state as soon as the user starts fixing it.
    qsa("input, textarea, select", form).forEach(function (field) {
      field.addEventListener("input", function () {
        clearFieldError(field);
      });
      field.addEventListener("change", function () {
        clearFieldError(field);
      });
    });
  }

  /**
   * Validates every relevant field in a form. Adds/removes accessible
   * error states as it goes. Returns true if the whole form is valid.
   */
  function validateForm(form) {
    let isValid = true;

    qsa("input, textarea, select", form).forEach(function (field) {
      // Skip fields that aren't required and are empty — nothing to validate.
      const isRequired = field.hasAttribute("required");
      const value = field.value ? field.value.trim() : "";

      // Required check.
      if (isRequired && field.type !== "file" && value === "") {
        setFieldError(field, "This field is required.");
        isValid = false;
        return;
      }

      if (isRequired && field.type === "file" && field.files.length === 0) {
        // Only the report form's image is optional-by-spec (accept attr
        // present but not required in the HTML), so this only fires if
        // "required" is actually present on a file input.
        setFieldError(field, "Please choose a file.");
        isValid = false;
        return;
      }

      // Type-specific checks (run even on optional-but-filled fields).
      if (field.type === "email" && value !== "" && !isValidEmail(value)) {
        setFieldError(field, "Please enter a valid email address.");
        isValid = false;
        return;
      }

      if (field.type === "tel" && value !== "" && !isValidPhone(value)) {
        setFieldError(field, "Please enter a valid phone number.");
        isValid = false;
        return;
      }

      // Minimum length for longer free-text fields (message/why/description).
      const longTextIds = [
        "adoptWhy",
        "reportDescription",
        "contactMessage",
      ];
      if (longTextIds.indexOf(field.id) !== -1 && value !== "" && value.length < 10) {
        setFieldError(field, "Please provide a bit more detail (at least 10 characters).");
        isValid = false;
        return;
      }

      // Select fields with a placeholder disabled option (e.g. condition).
      if (field.tagName === "SELECT" && isRequired && value === "") {
        setFieldError(field, "Please make a selection.");
        isValid = false;
        return;
      }

      clearFieldError(field);
    });

    return isValid;
  }

  function setFieldError(field, message) {
    field.setAttribute("aria-invalid", "true");
    field.classList.add("is-invalid");

    let errorEl = field.parentElement.querySelector(".field-error");
    if (!errorEl) {
      errorEl = document.createElement("small");
      errorEl.className = "field-error";
      errorEl.style.display = "block";
      errorEl.style.color = "#C0392B";
      errorEl.style.marginTop = "0.35rem";
      errorEl.style.fontSize = "0.8rem";
      errorEl.style.fontWeight = "600";
      field.insertAdjacentElement("afterend", errorEl);
    }
    errorEl.textContent = message;
  }

  function clearFieldError(field) {
    field.removeAttribute("aria-invalid");
    field.classList.remove("is-invalid");

    const errorEl = field.parentElement
      ? field.parentElement.querySelector(".field-error")
      : null;
    if (errorEl) errorEl.remove();
  }

  function clearAllFieldErrors(form) {
    qsa(".is-invalid", form).forEach(clearFieldError);
    qsa(".field-error", form).forEach(function (el) {
      el.remove();
    });
  }

  function showFormStatus(statusEl, message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.style.color = type === "error" ? "#C0392B" : "#2F6B4F";
  }

  /* =====================================================================
     11. TOAST NOTIFICATIONS
  ===================================================================== */

  let toastContainer = null;

  function getToastContainer() {
    if (toastContainer) return toastContainer;

    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.setAttribute("aria-live", "polite");
    toastContainer.setAttribute("aria-atomic", "true");
    Object.assign(toastContainer.style, {
      position: "fixed",
      bottom: "1.5rem",
      right: "1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.6rem",
      zIndex: "2000",
      maxWidth: "min(90vw, 340px)",
    });
    document.body.appendChild(toastContainer);
    return toastContainer;
  }

  /**
   * Shows a temporary toast notification.
   * @param {string} message
   * @param {'success'|'error'|'info'} type
   */
  function showToast(message, type) {
    const container = getToastContainer();

    const colors = {
      success: "#2F6B4F",
      error: "#C0392B",
      info: "#E8894A",
    };

    const toast = document.createElement("div");
    toast.setAttribute("role", "status");
    Object.assign(toast.style, {
      background: colors[type] || colors.info,
      color: "#FFFFFF",
      padding: "0.85rem 1.1rem",
      borderRadius: "10px",
      boxShadow: "0 12px 30px rgba(36,51,43,0.25)",
      fontSize: "0.9rem",
      fontWeight: "600",
      opacity: "0",
      transform: "translateY(12px)",
      transition: "opacity 250ms ease, transform 250ms ease",
    });
    toast.textContent = message;

    container.appendChild(toast);

    // Animate in.
    requestAnimationFrame(function () {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    // Animate out and remove.
    const DURATION = 3500;
    window.setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(12px)";
      window.setTimeout(function () {
        toast.remove();
      }, 250);
    }, DURATION);
  }

  /* =====================================================================
     12. ANIMAL STORY MODAL
  ===================================================================== */

  // Demo content used to populate the modal — replace with real data
  // (or Supabase records) once the backend is connected.
  const ANIMAL_DATA = {
    bruno: {
      name: "Bruno",
      status: "Available for Adoption",
      location: "[ADD LOCATION]",
      image: "images/dog-care.jpg",
      story:
        "Bruno was found on a busy street corner and has since grown into a friendly, energetic companion who loves people and long walks. He's healthy, vaccinated, and ready for a home that can match his playful spirit.",
    },
    coco: {
      name: "Coco",
      status: "Adoption in Progress",
      location: "[ADD LOCATION]",
      image: "images/mother-puppies.jpg",
      story:
        "Coco is gentle and a little shy at first, but warms up quickly once she trusts you. She's currently being matched with a family who can give her the patient, loving environment she deserves.",
    },
    simba: {
      name: "Simba",
      status: "Adopted",
      location: "[ADD LOCATION]",
      image: "images/dog-group.jpg",
      story:
        "Once a rescue in need of urgent care, Simba is now living happily with his new family. His journey from the streets to a safe home is exactly why this work matters.",
    },
  };

  let animalModalEl = null;
  let lastFocusedBeforeModal = null;

  function buildAnimalModal() {
    const modal = document.createElement("div");
    modal.id = "animalStoryModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "animalModalTitle");
    modal.style.display = "none";
    Object.assign(modal.style, {
      position: "fixed",
      inset: "0",
      zIndex: "2100",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.25rem",
    });

    modal.innerHTML =
      '<div class="modal-backdrop" data-modal-close ' +
      'style="position:absolute;inset:0;background:rgba(36,51,43,0.55);"></div>' +
      '<div class="modal-panel" role="document" ' +
      'style="position:relative;background:#FFF9F1;max-width:520px;width:100%;' +
      'border-radius:18px;box-shadow:0 30px 60px -15px rgba(36,51,43,0.35);' +
      'overflow:hidden;max-height:90vh;overflow-y:auto;">' +
      '<button type="button" data-modal-close aria-label="Close" ' +
      'style="position:absolute;top:0.75rem;right:0.75rem;width:36px;height:36px;' +
      'border-radius:50%;background:#FFFFFF;font-size:1.1rem;line-height:1;' +
      'box-shadow:0 4px 10px rgba(0,0,0,0.15);">✕</button>' +
      '<img id="animalModalImg" src="" alt="" ' +
      'style="width:100%;height:260px;object-fit:cover;">' +
      '<div style="padding:1.5rem;">' +
      '<h3 id="animalModalTitle" style="font-family:\'Fraunces\',serif;font-size:1.4rem;margin-bottom:0.5rem;"></h3>' +
      '<p id="animalModalStatus" style="font-weight:700;color:#2F6B4F;margin-bottom:0.25rem;"></p>' +
      '<p id="animalModalLocation" style="font-weight:600;color:#D3702F;margin-bottom:0.75rem;"></p>' +
      '<p id="animalModalStory" style="color:#5B6B61;line-height:1.6;"></p>' +
      "</div>" +
      "</div>";

    document.body.appendChild(modal);
    return modal;
  }

  function openAnimalModal(animalKey) {
    const data = ANIMAL_DATA[animalKey];
    if (!data) return;

    if (!animalModalEl) {
      animalModalEl = buildAnimalModal();
      wireModalClose(animalModalEl, closeAnimalModal);
    }

    qs("#animalModalImg", animalModalEl).src = data.image;
    qs("#animalModalImg", animalModalEl).alt = data.name;
    qs("#animalModalTitle", animalModalEl).textContent = data.name;
    qs("#animalModalStatus", animalModalEl).textContent = data.status;
    qs("#animalModalLocation", animalModalEl).textContent = "📍 " + data.location;
    qs("#animalModalStory", animalModalEl).textContent = data.story;

    lastFocusedBeforeModal = document.activeElement;
    animalModalEl.style.display = "flex";
    document.body.style.overflow = "hidden";

    const closeBtn = qs("[data-modal-close][aria-label='Close']", animalModalEl);
    if (closeBtn) closeBtn.focus();
  }

  function closeAnimalModal() {
    if (!animalModalEl) return;
    animalModalEl.style.display = "none";
    document.body.style.overflow = "";
    if (lastFocusedBeforeModal) lastFocusedBeforeModal.focus();
  }

  /** Shared close wiring: backdrop click + close button + Escape. */
  function wireModalClose(modalEl, closeFn) {
    modalEl.addEventListener("click", function (e) {
      if (e.target.hasAttribute("data-modal-close")) {
        closeFn();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalEl.style.display !== "none") {
        closeFn();
      }
    });
  }

  function initAnimalModal() {
    const grid = qs("#animalGrid");
    if (!grid) return;

    grid.addEventListener("click", function (e) {
      const trigger = e.target.closest("[data-view-story]");
      if (!trigger) return;

      e.preventDefault();
      const animalKey = trigger.getAttribute("data-view-story");
      openAnimalModal(animalKey);
    });
  }

  /* =====================================================================
     13. GALLERY LIGHTBOX
  ===================================================================== */

  let lightboxEl = null;
  let lastFocusedBeforeLightbox = null;

  function buildLightbox() {
    const lightbox = document.createElement("div");
    lightbox.id = "galleryLightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Image preview");
    lightbox.style.display = "none";
    Object.assign(lightbox.style, {
      position: "fixed",
      inset: "0",
      zIndex: "2100",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    });

    lightbox.innerHTML =
      '<div class="lightbox-backdrop" data-modal-close ' +
      'style="position:absolute;inset:0;background:rgba(15,20,17,0.85);"></div>' +
      '<button type="button" data-modal-close aria-label="Close image preview" ' +
      'style="position:absolute;top:1.25rem;right:1.25rem;width:42px;height:42px;' +
      'border-radius:50%;background:#FFFFFF;font-size:1.2rem;z-index:1;">✕</button>' +
      '<img id="lightboxImg" src="" alt="" ' +
      'style="position:relative;max-width:min(92vw,900px);max-height:88vh;' +
      "object-fit:contain;border-radius:12px;box-shadow:0 30px 70px rgba(0,0,0,0.5);" +
      'opacity:0;transform:scale(0.96);transition:opacity 220ms ease,transform 220ms ease;">';

    document.body.appendChild(lightbox);
    return lightbox;
  }

  function openLightbox(imgSrc, imgAlt) {
    if (!lightboxEl) {
      lightboxEl = buildLightbox();
      wireModalClose(lightboxEl, closeLightbox);
    }

    const imgEl = qs("#lightboxImg", lightboxEl);
    imgEl.src = imgSrc;
    imgEl.alt = imgAlt || "";

    lastFocusedBeforeLightbox = document.activeElement;
    lightboxEl.style.display = "flex";
    document.body.style.overflow = "hidden";

    // Trigger the fade/scale-in on the next frame.
    requestAnimationFrame(function () {
      imgEl.style.opacity = "1";
      imgEl.style.transform = "scale(1)";
    });

    const closeBtn = qs("[data-modal-close][aria-label='Close image preview']", lightboxEl);
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    const imgEl = qs("#lightboxImg", lightboxEl);
    if (imgEl) {
      imgEl.style.opacity = "0";
      imgEl.style.transform = "scale(0.96)";
    }
    window.setTimeout(function () {
      lightboxEl.style.display = "none";
      document.body.style.overflow = "";
    }, 180);
    if (lastFocusedBeforeLightbox) lastFocusedBeforeLightbox.focus();
  }

  function initGalleryLightbox() {
    const grid = qs("#galleryGrid");
    if (!grid) return;

    grid.addEventListener("click", function (e) {
      const item = e.target.closest(".gallery-item");
      if (!item) return;

      const img = qs("img", item);
      if (!img) return;

      openLightbox(img.src, img.alt);
    });
  }

  /* =====================================================================
     14. FOOTER YEAR
  ===================================================================== */

  function initFooterYear() {
    const yearEl = qs("#footerYear");
    if (!yearEl) return;
    yearEl.textContent = new Date().getFullYear();
  }

  /* =====================================================================
     15. SCROLL PROGRESS BAR
     (Bonus: the HTML already ships a #pawTrail / #pawTrailFill element —
     wiring it up is a natural, low-risk addition.)
  ===================================================================== */

  function initScrollProgress() {
    const fill = qs("#pawTrailFill");
    if (!fill) return;

    let ticking = false;

    function updateFill() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      fill.style.width = Math.min(Math.max(progress, 0), 100) + "%";
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateFill);
        ticking = true;
      }
    }

    updateFill();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  /* =====================================================================
     16. SMOOTH NAVIGATION
  ===================================================================== */

  function initSmoothNav() {
    // The CSS already sets `scroll-behavior: smooth` and
    // `scroll-padding-top`, so native anchor scrolling handles offset
    // correctly. We only need to make sure the mobile menu closes and
    // that we don't interfere with external links — both already handled
    // in initMobileMenu(). Nothing further required here, but the hook
    // is kept for clarity / future extension (e.g. active-link highlighting).
  }
})();