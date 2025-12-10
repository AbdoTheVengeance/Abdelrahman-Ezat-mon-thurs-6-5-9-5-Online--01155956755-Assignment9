class ContactHub {
  constructor() {
    this.contacts = [];
    this.currentEditId = null;
    // Modal elements for avatar
    this.modalAvatarInput = document.getElementById("avatarInput");
    this.modalAvatarPreviewImg = document.getElementById("modalAvatarImg");
    this.modalAvatarPreviewIcon = document.getElementById("modalAvatarIcon");
    this.currentAvatarDataUrl = "";
    this.init();
  }
  init() {
    this.loadContacts();
    this.setupEventListeners();
    this.renderContacts();
    this.renderSidebar();
    this.updateStats();
  }
  // Local Storage
  loadContacts() {
    const saved = localStorage.getItem("contacthub-contacts");
    this.contacts = saved ? JSON.parse(saved) : [];
  }
  saveContacts() {
    localStorage.setItem("contacthub-contacts", JSON.stringify(this.contacts));
    this.updateStats();
  }
  // Validation
  validateName(name) {
    const regex = /^[a-zA-Z\s]{2,50}$/;
    return regex.test(name.trim());
  }
  validatePhone(phone) {
    const regex = /^[\+]?[0-9\s\-\(\)]{8,20}$/;
    return regex.test(phone.trim());
  }
  validateEmail(email) {
    if (!email.trim()) return true; // Email is optional
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
  }
  // Contact Operations
  addContact(contactData) {
    const contact = {
      id: Date.now().toString(),
      ...contactData,
      createdAt: new Date().toISOString(),
    };
    this.contacts.unshift(contact);
    this.saveContacts();
    this.renderContacts();
    this.renderSidebar();
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Contact added successfully",
      timer: 2000,
      showConfirmButton: false,
    });
  }
  updateContact(id, contactData) {
    const index = this.contacts.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.contacts[index] = { ...this.contacts[index], ...contactData };
      this.saveContacts();
      this.renderContacts();
      this.renderSidebar();
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Contact updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }
  deleteContact(id) {
    Swal.fire({
      title: "Are you sure?",
      text: "This contact will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.contacts = this.contacts.filter((c) => c.id !== id);
        this.saveContacts();
        this.renderContacts();
        this.renderSidebar();
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Contact has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  }
  toggleFavorite(id) {
    const contact = this.contacts.find((c) => c.id === id);
    if (contact) {
      contact.isFavorite = !contact.isFavorite;
      this.saveContacts();
      this.renderContacts();
      this.renderSidebar();
      const action = contact.isFavorite ? "added to" : "removed from";
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Contact ${action} favorites`,
        timer: 1500,
        showConfirmButton: false,
      });
    }
  }
  // Rendering
  renderContacts(filter = "") {
    const container = document.getElementById("contactsContainer");
    const searchTerm = filter.toLowerCase();
    // Filter contacts
    let filteredContacts = this.contacts;
    if (searchTerm) {
      filteredContacts = this.contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm) ||
          contact.phone.toLowerCase().includes(searchTerm) ||
          (contact.email && contact.email.toLowerCase().includes(searchTerm))
      );
    }
    // Show/hide no contacts message
    const noContacts = document.getElementById("noContacts");
    if (filteredContacts.length === 0) {
      noContacts.style.display = "block";
      container.innerHTML = "";
      return;
    }
    noContacts.style.display = "none";
    // Generate contact cards
    container.innerHTML = filteredContacts
      .map((contact) => this.createContactCard(contact))
      .join("");
    // Update subtitle
    const subtitle = document.getElementById("contactsSubtitle");
    subtitle.textContent = `Manage and organize your ${
      filteredContacts.length
    } contact${filteredContacts.length !== 1 ? "s" : ""}`;
  }
  createContactCard(contact) {
    const initials = this.getInitials(contact.name);
    const groupClass = contact.group ? `badge-${contact.group}` : "";
    const avatarContent = contact.avatar
      ? `<img src="${contact.avatar}" alt="${contact.name}" class="contact-card-avatar-img">`
      : `<span class="contact-avatar-initials">${initials}</span>`;

    return `
            <div class="card contact-card ${
              contact.isFavorite ? "favorite" : ""
            } ${contact.isEmergency ? "emergency" : ""}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-auto">
                            <div class="contact-avatar">
                                ${avatarContent}
                            </div>
                        </div>
                        <div class="col">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h5 class="card-title mb-1">${this.escapeHTML(
                                      contact.name
                                    )}</h5>
                                    <p class="card-text text-muted mb-1">
                                        <i class="fas fa-phone-alt me-1"></i>${this.escapeHTML(
                                          contact.phone
                                        )}
                                    </p>
                                    ${
                                      contact.email
                                        ? `
                                        <p class="card-text text-muted mb-1">
                                            <i class="fas fa-envelope me-1"></i>${this.escapeHTML(
                                              contact.email
                                            )}
                                        </p>
                                    `
                                        : ""
                                    }
                                    ${
                                      contact.group
                                        ? `
                                        <span class="group-badge ${groupClass}">${contact.group}</span>
                                    `
                                        : ""
                                    }
                                </div>
                                <div class="contact-actions d-flex">
                                    ${
                                      contact.phone
                                        ? `
                                        <a href="tel:${contact.phone}" class="btn btn-action btn-call" title="Call">
                                            <i class="fas fa-phone"></i>
                                        </a>
                                    `
                                        : ""
                                    }
                                    ${
                                      contact.email
                                        ? `
                                        <a href="mailto:${contact.email}" class="btn btn-action btn-email" title="Email">
                                            <i class="fas fa-envelope"></i>
                                        </a>
                                    `
                                        : ""
                                    }
                                    <button class="btn btn-action btn-favorite ${
                                      contact.isFavorite ? "active" : ""
                                    }" 
                                            onclick="contactHub.toggleFavorite('${
                                              contact.id
                                            }')"
                                            title="${
                                              contact.isFavorite
                                                ? "Remove from favorites"
                                                : "Add to favorites"
                                            }">
                                        <i class="fas fa-star"></i>
                                    </button>
                                    <button class="btn btn-action btn-edit" 
                                            onclick="contactHub.openEditModal('${
                                              contact.id
                                            }')"
                                            title="Edit contact">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-action btn-delete" 
                                            onclick="contactHub.deleteContact('${
                                              contact.id
                                            }')"
                                            title="Delete contact">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            ${
                              contact.address || contact.notes
                                ? `
                                <div class="mt-3 pt-3 border-top">
                                    ${
                                      contact.address
                                        ? `
                                        <p class="card-text small mb-1">
                                            <i class="fas fa-map-marker-alt me-1"></i>${this.escapeHTML(
                                              contact.address
                                            )}
                                        </p>
                                    `
                                        : ""
                                    }
                                    ${
                                      contact.notes
                                        ? `
                                        <p class="card-text small text-muted mb-0">
                                            <i class="fas fa-sticky-note me-1"></i>${this.escapeHTML(
                                              contact.notes
                                            )}
                                        </p>
                                    `
                                        : ""
                                    }
                                </div>
                            `
                                : ""
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
  }
  renderSidebar() {
    // Render favorites
    const favorites = this.contacts.filter((c) => c.isFavorite);
    const favoritesList = document.getElementById("favoritesList");
    const noFavorites = document.getElementById("noFavorites");
    if (favorites.length > 0) {
      noFavorites.style.display = "none";
      favoritesList.innerHTML = favorites
        .map((contact) => this.createSidebarItem(contact))
        .join("");
    } else {
      noFavorites.style.display = "block";
      favoritesList.innerHTML = "";
    }
    // Render emergency contacts
    const emergencies = this.contacts.filter((c) => c.isEmergency);
    const emergencyList = document.getElementById("emergencyList");
    const noEmergency = document.getElementById("noEmergency");

    if (emergencies.length > 0) {
      noEmergency.style.display = "none";
      emergencyList.innerHTML = emergencies
        .map((contact) => this.createSidebarItem(contact, true))
        .join("");
    } else {
      noEmergency.style.display = "block";
      emergencyList.innerHTML = "";
    }
  }
  createSidebarItem(contact, isEmergency = false) {
    const initials = this.getInitials(contact.name);
    const sidebarAvatarContent = contact.avatar
      ? `<img src="${contact.avatar}" alt="${contact.name}" class="sidebar-avatar-img">`
      : `${initials}`;

    return `
            <div class="sidebar-contact">
                <div class="sidebar-avatar">
                    ${sidebarAvatarContent}
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-0">${this.escapeHTML(contact.name)}</h6>
                    <small class="text-muted">${this.escapeHTML(
                      contact.phone
                    )}</small>
                </div>
                ${
                  isEmergency
                    ? `
                    <a href="tel:${contact.phone}" class="btn btn-sm btn-danger" title="Emergency Call">
                        <i class="fas fa-phone"></i>
                    </a>
                `
                    : `
                    <a href="tel:${contact.phone}" class="btn btn-sm btn-outline-primary" title="Call">
                        <i class="fas fa-phone"></i>
                    </a>
                `
                }
            </div>
        `;
  }
  updateStats() {
    document.getElementById("totalContacts").textContent = this.contacts.length;
    document.getElementById("favoritesCount").textContent =
      this.contacts.filter((c) => c.isFavorite).length;
    document.getElementById("emergencyCount").textContent =
      this.contacts.filter((c) => c.isEmergency).length;
  }
  // Modal Handling
  openAddModal() {
    this.currentEditId = null;
    document.getElementById("modalTitle").textContent = "Add New Contact";
    document.getElementById("contactForm").reset();
    document.getElementById("contactId").value = "";
    // Reset avatar preview for add modal
    this.currentAvatarDataUrl = "";
    this.modalAvatarPreviewImg.src = "";
    this.modalAvatarPreviewImg.classList.add("d-none");
    this.modalAvatarPreviewIcon.classList.remove("d-none");
    this.modalAvatarInput.value = ""; // Clear file input
    // Reset validation
    document.querySelectorAll(".form-control").forEach((input) => {
      input.classList.remove("is-invalid");
    });
    const modal = new bootstrap.Modal(document.getElementById("contactModal"));
    modal.show();
  }
  openEditModal(id) {
    const contact = this.contacts.find((c) => c.id === id);
    if (!contact) return;
    this.currentEditId = id;
    document.getElementById("modalTitle").textContent = "Edit Contact";
    // Fill form
    document.getElementById("contactId").value = contact.id;
    document.getElementById("contactName").value = contact.name;
    document.getElementById("contactPhone").value = contact.phone;
    document.getElementById("contactEmail").value = contact.email || "";
    document.getElementById("contactAddress").value = contact.address || "";
    document.getElementById("contactGroup").value = contact.group || "";
    document.getElementById("contactNotes").value = contact.notes || "";
    document.getElementById("contactFavorite").checked =
      contact.isFavorite || false;
    document.getElementById("contactEmergency").checked =
      contact.isEmergency || false;
    // Set avatar
    if (contact.avatar) {
      this.currentAvatarDataUrl = contact.avatar;
      this.modalAvatarPreviewImg.src = contact.avatar;
      this.modalAvatarPreviewImg.classList.remove("d-none");
      this.modalAvatarPreviewIcon.classList.add("d-none");
    } else {
      this.currentAvatarDataUrl = "";
      this.modalAvatarPreviewImg.src = "";
      this.modalAvatarPreviewImg.classList.add("d-none");
      this.modalAvatarPreviewIcon.classList.remove("d-none");
    }
    this.modalAvatarInput.value = "";
    // Reset validation
    document.querySelectorAll(".form-control").forEach((input) => {
      input.classList.remove("is-invalid");
    });

    const modal = new bootstrap.Modal(document.getElementById("contactModal"));
    modal.show();
  }
  handleFormSubmit(event) {
    event.preventDefault();
    // Get form data
    const formData = {
      name: document.getElementById("contactName").value.trim(),
      phone: document.getElementById("contactPhone").value.trim(),
      email: document.getElementById("contactEmail").value.trim(),
      address: document.getElementById("contactAddress").value.trim(),
      group: document.getElementById("contactGroup").value,
      notes: document.getElementById("contactNotes").value.trim(),
      isFavorite: document.getElementById("contactFavorite").checked,
      isEmergency: document.getElementById("contactEmergency").checked,
      avatar: this.currentAvatarDataUrl,
    };
    // Another validation
    let isValid = true;
    if (!this.validateName(formData.name)) {
      document.getElementById("contactName").classList.add("is-invalid");
      isValid = false;
    } else {
      document.getElementById("contactName").classList.remove("is-invalid");
    }
    if (!this.validatePhone(formData.phone)) {
      document.getElementById("contactPhone").classList.add("is-invalid");
      isValid = false;
    } else {
      document.getElementById("contactPhone").classList.remove("is-invalid");
    }
    if (!this.validateEmail(formData.email)) {
      document.getElementById("contactEmail").classList.add("is-invalid");
      isValid = false;
    } else {
      document.getElementById("contactEmail").classList.remove("is-invalid");
    }
    if (!isValid) return;
    // Save contact
    if (this.currentEditId) {
      this.updateContact(this.currentEditId, formData);
    } else {
      this.addContact(formData);
    }
    // Close modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("contactModal")
    );
    modal.hide();
  }
  // Helper Methods
  getInitials(name) {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  // Handle avatar file selection and preview
  handleAvatarChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.currentAvatarDataUrl = e.target.result;
        this.modalAvatarPreviewImg.src = e.target.result;
        this.modalAvatarPreviewImg.classList.remove("d-none");
        this.modalAvatarPreviewIcon.classList.add("d-none");
      };
      reader.readAsDataURL(file);
    } else {
      // If no file is selected (reset to default)
      this.currentAvatarDataUrl = "";
      this.modalAvatarPreviewImg.src = "";
      this.modalAvatarPreviewImg.classList.add("d-none");
      this.modalAvatarPreviewIcon.classList.remove("d-none");
    }
  }
  // Event Listeners
  setupEventListeners() {
    // Add contact buttons
    document
      .getElementById("addContactBtn")
      .addEventListener("click", () => this.openAddModal());
    document
      .getElementById("addContactBtn2")
      .addEventListener("click", () => this.openAddModal());
    // Search input
    document.getElementById("searchInput").addEventListener("input", (e) => {
      this.renderContacts(e.target.value);
    });
    // Form submission
    document
      .getElementById("contactForm")
      .addEventListener("submit", (e) => this.handleFormSubmit(e));
    // Avatar preview click to trigger file input
    document
      .querySelector(".avatar-preview")
      .addEventListener("click", () => this.modalAvatarInput.click());
    // Listen for changes on the hidden file input
    this.modalAvatarInput.addEventListener(
      "change",
      this.handleAvatarChange.bind(this)
    );
  }
}
// Initialize the application
let contactHub;
document.addEventListener("DOMContentLoaded", () => {
  contactHub = new ContactHub();
  window.contactHub = contactHub;
});
