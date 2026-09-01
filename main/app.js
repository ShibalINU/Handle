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

  // Some environments (e.g. sandboxed previews) block localStorage entirely.
  // Detect that once, and fall back to an in-memory store so the app still works —
  // it just won't persist across a page reload in that specific environment.
  const memoryFallback = { listings: null, requests: null, chats: null };
  let storageAvailable = true;
  try {
    const testKey = "__handleph_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
  } catch (e) {
    storageAvailable = false;
    console.warn("Handle.ph: localStorage unavailable, using in-memory storage for this session.");
  }

  const store = {
    getListings() {
      if (!storageAvailable) {
        if (!memoryFallback.listings) memoryFallback.listings = SEED_LISTINGS.slice();
        return memoryFallback.listings;
      }
      const raw = localStorage.getItem("handleph_listings");
      if (!raw) {
        localStorage.setItem("handleph_listings", JSON.stringify(SEED_LISTINGS));
        return SEED_LISTINGS.slice();
      }
      try { return JSON.parse(raw); } catch (e) { return SEED_LISTINGS.slice(); }
    },
    saveListings(list) {
      if (!storageAvailable) { memoryFallback.listings = list; return; }
      localStorage.setItem("handleph_listings", JSON.stringify(list));
    },
    getChats() {
      if (!storageAvailable) {
        if (!memoryFallback.chats) memoryFallback.chats = {};
        return memoryFallback.chats;
      }
      const raw = localStorage.getItem("handleph_chats");
      if (!raw) return {};
      try { return JSON.parse(raw); } catch (e) { return {}; }
    },
    saveChats(chats) {
      if (!storageAvailable) { memoryFallback.chats = chats; return; }
      localStorage.setItem("handleph_chats", JSON.stringify(chats));
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
          <button class="contact-btn" data-id="${l.id}">Chat now</button>
        </div>
      `;
      grid.appendChild(card);
    });

    grid.querySelectorAll(".contact-btn").forEach(btn => {
      btn.addEventListener("click", () => openChat(btn.getAttribute("data-id")));
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

  // ---------- CHAT ----------
  const CANNED_GREETINGS = [
    "Hi! Thanks for reaching out — happy to help. What do you need done?",
    "Hello! I saw you're interested in this listing. What's the job you have in mind?",
    "Hi there! I'm available this week. Tell me more about what you need."
  ];
  const CANNED_REPLIES = [
    "Got it, that sounds doable. When were you hoping to get this done?",
    "Sure, I can take that on. What's the best area/address to meet you at?",
    "Noted! I'll need a bit more detail — can you share your location and preferred schedule?",
    "That works for me. I'll confirm the rate once I see the full scope on-site.",
    "Understood. I'm usually free on weekdays after 2pm — does that fit your schedule?",
    "Thanks for the details! I'll follow up shortly to lock in a time."
  ];

  function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function initials(name) {
    return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  }

  let activeListingId = null;

  function openChat(listingId) {
    activeListingId = listingId;
    const listing = store.getListings().find(l => l.id === listingId);
    if (!listing) return;

    const chats = store.getChats();
    if (!chats[listingId]) {
      chats[listingId] = {
        listingTitle: listing.title,
        listingName: listing.name,
        listingContact: listing.contact,
        messages: [
          { from: "worker", text: pickRandom(CANNED_GREETINGS), time: new Date().toISOString() }
        ]
      };
      store.saveChats(chats);
    }

    document.getElementById("chat-avatar").textContent = initials(listing.name);
    document.getElementById("modal-title").textContent = listing.name;
    document.getElementById("modal-sub").textContent = listing.title + " · " + listing.rate;
    document.getElementById("modal-backdrop").hidden = false;
    renderChatMessages(listingId);
    document.getElementById("c-message").focus();
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

  function formatTime(iso) {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function renderChatMessages(listingId) {
    const container = document.getElementById("chat-messages");
    const chats = store.getChats();
    const thread = chats[listingId];
    if (!thread) return;
    container.innerHTML = "";
    thread.messages.forEach(m => {
      const bubble = document.createElement("div");
      bubble.className = "chat-bubble " + (m.from === "user" ? "from-user" : "from-worker");
      bubble.textContent = m.text;
      container.appendChild(bubble);

      const time = document.createElement("div");
      time.className = "chat-time" + (m.from === "worker" ? " from-worker-time" : "");
      time.textContent = formatTime(m.time);
      container.appendChild(time);
    });
    container.scrollTop = container.scrollHeight;
  }

  function showTypingIndicator() {
    const container = document.getElementById("chat-messages");
    const indicator = document.createElement("div");
    indicator.className = "typing-indicator";
    indicator.id = "typing-indicator";
    indicator.innerHTML = "<span></span><span></span><span></span>";
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
  }

  document.getElementById("contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!activeListingId) return;
    const input = document.getElementById("c-message");
    const text = input.value.trim();
    if (!text) return;

    const chats = store.getChats();
    const thread = chats[activeListingId];
    if (!thread) return;

    thread.messages.push({ from: "user", text, time: new Date().toISOString() });
    store.saveChats(chats);
    renderChatMessages(activeListingId);
    input.value = "";

    showTypingIndicator();
    const listingIdAtSend = activeListingId;
    setTimeout(() => {
      // Only follow through if the same chat is still open (or just update storage either way)
      const chatsNow = store.getChats();
      const threadNow = chatsNow[listingIdAtSend];
      if (!threadNow) return;
      threadNow.messages.push({ from: "worker", text: pickRandom(CANNED_REPLIES), time: new Date().toISOString() });
      store.saveChats(chatsNow);
      if (activeListingId === listingIdAtSend) {
        const indicator = document.getElementById("typing-indicator");
        if (indicator) indicator.remove();
        renderChatMessages(listingIdAtSend);
      }
    }, 1100 + Math.random() * 900);
  });

  // ---------- MY CHATS LIST ----------
  function renderRequests() {
    const list = document.getElementById("requests-list");
    const empty = document.getElementById("requests-empty");
    const chats = store.getChats();
    const ids = Object.keys(chats);
    list.innerHTML = "";
    empty.hidden = ids.length !== 0;

    ids
      .sort((a, b) => {
        const aLast = chats[a].messages[chats[a].messages.length - 1].time;
        const bLast = chats[b].messages[chats[b].messages.length - 1].time;
        return new Date(bLast) - new Date(aLast);
      })
      .forEach(id => {
        const thread = chats[id];
        const lastMsg = thread.messages[thread.messages.length - 1];
        const item = document.createElement("button");
        item.type = "button";
        item.className = "chat-list-item";
        item.innerHTML = `
          <div class="chat-list-avatar">${escapeHtml(initials(thread.listingName))}</div>
          <div class="chat-list-info">
            <h4>${escapeHtml(thread.listingName)} — ${escapeHtml(thread.listingTitle)}</h4>
            <p>${lastMsg.from === "user" ? "You: " : ""}${escapeHtml(lastMsg.text)}</p>
          </div>
          <div class="chat-list-time">${formatTime(lastMsg.time)}</div>
        `;
        item.addEventListener("click", () => openChat(id));
        list.appendChild(item);
      });
  }

  // ---------- INIT ----------
  populateCategorySelects();
  populateLocationSelect();
  initHome();
  showView("home");
})();