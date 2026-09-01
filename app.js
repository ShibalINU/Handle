(function () {
  "use strict";

  const CATEGORIES = [
    "Plumbing", "Electrical", "Carpentry", "Cleaning", "Tutoring",
    "Beauty & Wellness", "Tech Support", "Events Staffing", "Automotive", "Gardening"
  ];

  const SEED_LISTINGS = [
    { id: "s1", name: "Renz Villanueva", category: "Plumbing", title: "Leak repair & pipe installation", desc: "10 years fixing residential leaks, water heaters, and pipe replacements. Same-day service in most cases.", rate: "₱500/hr", location: "Quezon City", contact: "0917 111 2233" },
    { id: "s2", name: "Maria Santos", category: "Tutoring", title: "Math tutor, Grade 7–10", desc: "Licensed teacher, 6 years tutoring high school algebra and geometry. Patient with struggling students.", rate: "₱350/hr", location: "Makati", contact: "0918 222 3344" },
    { id: "s3", name: "Jerome Cruz", category: "Electrical", title: "Home electrical repair & rewiring", desc: "Certified electrician handling outlet repairs, breaker issues, and full rewiring jobs.", rate: "₱600/hr", location: "Pasig", contact: "0919 333 4455" },
    { id: "s4", name: "Ana Reyes", category: "Cleaning", title: "Deep home & aircon cleaning", desc: "Team of 3, we handle full house deep cleans and aircon unit cleaning with our own equipment.", rate: "₱600/unit", location: "Quezon City", contact: "0920 444 5566" },
    { id: "s5", name: "Paolo Dizon", category: "Tech Support", title: "Laptop & PC repair", desc: "Hardware and software troubleshooting, virus removal, data recovery. Home visits available.", rate: "₱450/visit", location: "Taguig", contact: "0921 555 6677" },
    { id: "s6", name: "Liza Fernandez", category: "Beauty & Wellness", title: "Mobile hair & makeup artist", desc: "Bridal and event makeup, 8 years experience. I bring my own kit to your location.", rate: "₱2,500/booking", location: "Mandaluyong", contact: "0922 666 7788" },
    { id: "s7", name: "Carlo Mendoza", category: "Carpentry", title: "Custom furniture & repairs", desc: "Built-in cabinets, shelving, and furniture repair. Free estimates on larger jobs.", rate: "₱1,500/job", location: "Marikina", contact: "0923 777 8899" },
    { id: "s8", name: "Grace Aquino", category: "Events Staffing", title: "Event coordinator & host crew", desc: "Team available for birthdays, corporate events, and weddings — coordination, hosting, setup.", rate: "₱3,000/event", location: "Pasay", contact: "0924 888 9900" }
  ];

  const store = {
    getListings() {
      const raw = localStorage.getItem("handleph_listings");
      if (!raw) {
        localStorage.setItem("handleph_listings", JSON.stringify(SEED_LISTINGS));
        return SEED_LISTINGS.slice();
      }
      try { return JSON.parse(raw); } catch (e) { return SEED_LISTINGS.slice(); }
    },
    saveListings(list) {
      localStorage.setItem("handleph_listings", JSON.stringify(list));
    },
    getRequests() {
      const raw = localStorage.getItem("handleph_requests");
      if (!raw) return [];
      try { return JSON.parse(raw); } catch (e) { return []; }
    },
    saveRequests(list) {
      localStorage.setItem("handleph_requests", JSON.stringify(list));
    }
  };

  // ---------- NAVIGATION ----------
  const views = ["home", "browse", "post", "requests"];
  function showView(name) {
    views.forEach(v => {
      const el = document.getElementById("view-" + v);
      if (el) el.hidden = (v !== name);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (name === "browse") renderListings();
    if (name === "requests") renderRequests();
  }
  document.querySelectorAll("[data-nav]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      showView(el.getAttribute("data-nav"));
    });
  });

  // ---------- HOME: chips + stats ----------
  function initHome() {
    const chipRow = document.getElementById("hero-chip-row");
    const featured = ["Plumbing", "Tutoring", "Cleaning", "Electrical", "Events Staffing"];
    featured.forEach(cat => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = cat;
      b.addEventListener("click", () => {
        showView("browse");
        document.getElementById("browse-category").value = cat;
        renderListings();
      });
      chipRow.appendChild(b);
    });

    const listings = store.getListings();
    document.getElementById("stat-listings").textContent = listings.length;
    document.getElementById("stat-categories").textContent = CATEGORIES.length;

    document.getElementById("hero-search-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const term = document.getElementById("hero-search-input").value;
      showView("browse");
      document.getElementById("browse-search").value = term;
      renderListings();
    });
  }

  // ---------- BROWSE ----------
  function populateCategorySelects() {
    const catSelect = document.getElementById("browse-category");
    const postSelect = document.getElementById("f-category");
    CATEGORIES.forEach(cat => {
      const o1 = document.createElement("option");
      o1.value = cat; o1.textContent = cat;
      catSelect.appendChild(o1);
      const o2 = document.createElement("option");
      o2.value = cat; o2.textContent = cat;
      postSelect.appendChild(o2);
    });
  }

  function populateLocationSelect() {
    const locSelect = document.getElementById("browse-location");
    const locations = [...new Set(store.getListings().map(l => l.location))].sort();
    locations.forEach(loc => {
      const o = document.createElement("option");
      o.value = loc; o.textContent = loc;
      locSelect.appendChild(o);
    });
  }

  function renderListings() {
    const grid = document.getElementById("listing-grid");
    const empty = document.getElementById("empty-state");
    const countEl = document.getElementById("result-count");
    const term = document.getElementById("browse-search").value.trim().toLowerCase();
    const cat = document.getElementById("browse-category").value;
    const loc = document.getElementById("browse-location").value;

    let listings = store.getListings();
    listings = listings.filter(l => {
      const matchesTerm = !term || (l.title + l.desc + l.name + l.category).toLowerCase().includes(term);
      const matchesCat = !cat || l.category === cat;
      const matchesLoc = !loc || l.location === loc;
      return matchesTerm && matchesCat && matchesLoc;
    });

    grid.innerHTML = "";
    countEl.textContent = listings.length + (listings.length === 1 ? " listing found" : " listings found");
    empty.hidden = listings.length !== 0;

    listings.forEach(l => {
      const card = document.createElement("div");
      card.className = "listing-card";
      card.innerHTML = `
        <span class="listing-cat">${escapeHtml(l.category)}</span>
        <h3>${escapeHtml(l.title)}</h3>
        <p class="listing-meta">${escapeHtml(l.name)} · ${escapeHtml(l.location)}</p>
        <p class="listing-desc">${escapeHtml(l.desc)}</p>
        <div class="listing-foot">
          <span class="listing-rate">${escapeHtml(l.rate)}</span>
          <button class="contact-btn" data-id="${l.id}">Send request</button>
        </div>
      `;
      grid.appendChild(card);
    });

    grid.querySelectorAll(".contact-btn").forEach(btn => {
      btn.addEventListener("click", () => openModal(btn.getAttribute("data-id")));
    });
  }

  ["browse-search", "browse-category", "browse-location"].forEach(id => {
    document.getElementById(id).addEventListener("input", renderListings);
  });

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  // ---------- POST FORM ----------
  document.getElementById("post-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const listings = store.getListings();
    const newListing = {
      id: "l" + Date.now(),
      name: document.getElementById("f-name").value.trim(),
      category: document.getElementById("f-category").value,
      title: document.getElementById("f-title").value.trim(),
      desc: document.getElementById("f-desc").value.trim(),
      rate: document.getElementById("f-rate").value.trim(),
      location: document.getElementById("f-location").value.trim(),
      contact: document.getElementById("f-contact").value.trim()
    };
    listings.unshift(newListing);
    store.saveListings(listings);

    document.getElementById("post-form").reset();
    const note = document.getElementById("post-confirmation");
    note.hidden = false;
    setTimeout(() => { note.hidden = true; }, 4000);

    document.getElementById("stat-listings").textContent = listings.length;
  });

  // ---------- CONTACT MODAL ----------
  let activeListingId = null;
  function openModal(listingId) {
    activeListingId = listingId;
    const listing = store.getListings().find(l => l.id === listingId);
    if (!listing) return;
    document.getElementById("modal-title").textContent = "Send a request to " + listing.name;
    document.getElementById("modal-sub").textContent = listing.title + " · " + listing.rate;
    document.getElementById("modal-backdrop").hidden = false;
  }
  function closeModal() {
    document.getElementById("modal-backdrop").hidden = true;
    document.getElementById("contact-form").reset();
    activeListingId = null;
  }
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-backdrop") closeModal();
  });

  document.getElementById("contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const listing = store.getListings().find(l => l.id === activeListingId);
    if (!listing) return;
    const requests = store.getRequests();
    requests.unshift({
      id: "r" + Date.now(),
      listingTitle: listing.title,
      listingName: listing.name,
      listingContact: listing.contact,
      fromName: document.getElementById("c-name").value.trim(),
      message: document.getElementById("c-message").value.trim(),
      time: new Date().toLocaleString()
    });
    store.saveRequests(requests);
    closeModal();
    showView("requests");
  });

  // ---------- REQUESTS ----------
  function renderRequests() {
    const list = document.getElementById("requests-list");
    const empty = document.getElementById("requests-empty");
    const requests = store.getRequests();
    list.innerHTML = "";
    empty.hidden = requests.length !== 0;
    requests.forEach(r => {
      const item = document.createElement("div");
      item.className = "request-item";
      item.innerHTML = `
        <h4>${escapeHtml(r.listingTitle)} — ${escapeHtml(r.listingName)}</h4>
        <p>"${escapeHtml(r.message)}" — from ${escapeHtml(r.fromName)}</p>
        <p class="request-time">Sent ${escapeHtml(r.time)} · reach them directly at ${escapeHtml(r.listingContact)}</p>
      `;
      list.appendChild(item);
    });
  }

  // ---------- INIT ----------
  populateCategorySelects();
  populateLocationSelect();
  initHome();
  showView("home");
})();
