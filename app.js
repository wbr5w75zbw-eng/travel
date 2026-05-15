// ============================================================
// Travel Explorer — interactivity
// Add your OpenWeather API key on the next line to enable live weather.
// Get one at https://openweathermap.org/api
const OPENWEATHER_API_KEY = "YOUR_API_KEY_HERE";
// Web3Forms access key for the enquiry form. Get one at
// https://web3forms.com/#start (enter stevenyong929@yahoo.com — they email
// the key instantly, no activation needed). Until set, the form saves
// locally only and shows a setup notice.
const WEB3FORMS_ACCESS_KEY = "YOUR_WEB3FORMS_KEY_HERE";
// ============================================================

(function () {
  "use strict";

  const SGD = new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD", maximumFractionDigits: 0 });

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const cities = window.CITIES || [];

  // Japanese-language accent labels per destination (display only).
  const JP_NAMES = {
    tokyo: "東京", seoul: "ソウル", bali: "バリ", singapore: "新嘉坡",
    bangkok: "バンコク", hongkong: "香港", kualalumpur: "吉隆坡",
    maldives: "モルディブ", phuket: "プーケット", sydney: "雪梨",
    taipei: "台北", hanoi: "河内"
  };
  const jp = (id) => JP_NAMES[id] || "";

  // ----- Footer year -----
  $("#year").textContent = new Date().getFullYear();

  // ===========================================================
  // City + Guides rendering
  // ===========================================================
  function renderCities() {
    const grid = $("#cities-grid");
    grid.innerHTML = cities.map(c => `
      <article class="city-card" data-city="${c.id}">
        <div class="city-image">
          <img src="${c.heroImage}" alt="${c.name}, ${c.country}" loading="lazy" />
        </div>
        <div class="city-body">
          <h3 class="city-name">${c.name}${jp(c.id) ? `<span class="city-jp" aria-hidden="true">${jp(c.id)}</span>` : ""}</h3>
          <p class="city-country">${c.country}</p>
          <p class="city-blurb">${c.blurb}</p>
          <dl class="city-meta">
            <dt>Flight</dt><dd>${c.flightTimeFromSGP}</dd>
            <dt>Daily</dt><dd>${SGD.format(c.dailyBudgetSGD)}</dd>
            <dt>Season</dt><dd>${c.bestSeason}</dd>
          </dl>
          <button class="btn btn-ghost btn-sm" data-open-guide="${c.id}">View Guide</button>
        </div>
      </article>
    `).join("");
  }

  function renderFeaturedGuides() {
    const strip = $("#guides-strip");
    const featuredIds = ["tokyo", "seoul", "bali"];
    const featured = featuredIds.map(id => cities.find(c => c.id === id)).filter(Boolean);
    strip.innerHTML = featured.map(c => `
      <article class="guide-feature" data-open-guide="${c.id}" tabindex="0" role="button" aria-label="Open ${c.name} guide">
        <img src="${c.heroImage}" alt="${c.name}" loading="lazy" />
        <div class="guide-feature-body">
          ${jp(c.id) ? `<span class="guide-jp" aria-hidden="true">${jp(c.id)}</span>` : ""}
          <h3>${c.name}</h3>
          <p>${c.blurb}</p>
        </div>
      </article>
    `).join("");
  }

  // ===========================================================
  // Modal
  // ===========================================================
  const modal = $("#guide-modal");
  const modalBody = $("#modal-body");

  function openGuide(id) {
    const c = cities.find(x => x.id === id);
    if (!c) return;
    modalBody.innerHTML = `
      <div class="modal-hero"><img src="${c.heroImage}" alt="${c.name}" /></div>
      <div class="modal-content">
        <h2 id="modal-title">${c.name}</h2>
        <p class="country">${c.country} · ${c.bestSeason} · Flight from SGP: ${c.flightTimeFromSGP}</p>

        <h4>Overview</h4>
        <p>${c.overview}</p>

        <h4>3-Day Itinerary</h4>
        <ul>${c.itinerary.map(d => `<li>${d}</li>`).join("")}</ul>

        <h4>Food</h4>
        <ul>${c.food.map(f => `<li>${f}</li>`).join("")}</ul>

        <h4>Transport</h4>
        <ul>${c.transport.map(t => `<li>${t}</li>`).join("")}</ul>

        <h4>Cost Breakdown</h4>
        <dl class="cost-grid">
          ${Object.entries(c.costBreakdown).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}
        </dl>

        <h4>Safety Tips</h4>
        <ul>${c.safetyTips.map(s => `<li>${s}</li>`).join("")}</ul>

        <h4>Best Photo Spots</h4>
        <ul>${c.photoSpots.map(p => `<li>${p}</li>`).join("")}</ul>
      </div>
    `;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $(".modal-close", modal).focus();
  }

  function closeGuide() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open-guide]");
    if (opener) { e.preventDefault(); openGuide(opener.dataset.openGuide); return; }
    if (e.target.matches("[data-close-modal]")) closeGuide();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeGuide();
    if (e.key === "Enter" && document.activeElement?.matches(".guide-feature")) {
      openGuide(document.activeElement.dataset.openGuide);
    }
  });

  // ===========================================================
  // Budget calculator
  // ===========================================================
  function initBudget() {
    const select = $("#budget-destination");
    select.innerHTML = `<option value="">Anywhere</option>` +
      cities.map(c => `<option value="${c.id}">${c.name}</option>`).join("");

    $("#budget-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const travellers = +fd.get("travellers");
      const days = +fd.get("days");
      const daily = +fd.get("daily");
      const dest = fd.get("destination");
      const total = travellers * days * daily;
      const destLabel = dest ? cities.find(c => c.id === dest)?.name : "your trip";
      $("#budget-output").innerHTML = `
        ${SGD.format(total)}
        <small>${travellers} traveller${travellers > 1 ? "s" : ""} × ${days} day${days > 1 ? "s" : ""} × ${SGD.format(daily)} per person · ${destLabel}</small>
      `;
    });
  }

  // ===========================================================
  // Packing checklist (persisted)
  // ===========================================================
  const PACKING = {
    Documents: ["Passport (6+ months validity)", "Visa / e-visa printout", "Travel insurance", "Flight + hotel bookings", "Driver's licence / IDP"],
    Clothing: ["T-shirts", "Underwear & socks", "Light jacket", "Swimwear", "Sandals", "Comfortable walking shoes"],
    Electronics: ["Phone + charger", "Power bank", "Universal adapter", "Camera + SD cards", "Earbuds / headphones"],
    Medication: ["Paracetamol / ibuprofen", "Anti-diarrheal", "Motion sickness pills", "Personal prescriptions", "Plasters / bandages"],
    "Travel essentials": ["Sunscreen SPF 50", "Sunglasses", "Reusable water bottle", "Wet wipes", "Hand sanitiser", "Day pack"]
  };

  function initPacking() {
    const root = $("#packing-list");
    const saved = JSON.parse(localStorage.getItem("packing") || "{}");
    root.innerHTML = Object.entries(PACKING).map(([cat, items]) => `
      <div class="checklist-cat">
        <div class="checklist-cat-title">${cat}</div>
        ${items.map((it, i) => {
          const key = `${cat}::${i}`;
          const checked = saved[key] ? "checked" : "";
          return `
            <label class="checklist-item ${checked ? "done" : ""}">
              <input type="checkbox" data-key="${key}" ${checked} />
              <span>${it}</span>
            </label>
          `;
        }).join("")}
      </div>
    `).join("");

    root.addEventListener("change", (e) => {
      if (!e.target.matches('input[type="checkbox"]')) return;
      const state = JSON.parse(localStorage.getItem("packing") || "{}");
      state[e.target.dataset.key] = e.target.checked;
      localStorage.setItem("packing", JSON.stringify(state));
      e.target.closest(".checklist-item").classList.toggle("done", e.target.checked);
    });
  }

  // ===========================================================
  // Itinerary planner (persisted)
  // ===========================================================
  function loadItinerary() {
    try { return JSON.parse(localStorage.getItem("itinerary") || "[]"); }
    catch { return []; }
  }
  function saveItinerary(list) { localStorage.setItem("itinerary", JSON.stringify(list)); }

  function renderItinerary() {
    const list = loadItinerary();
    const ul = $("#itinerary-list");
    if (!list.length) {
      ul.innerHTML = `<li class="muted" style="padding:10px 0;">No entries yet — add your first activity above.</li>`;
      return;
    }
    ul.innerHTML = list.map((it, i) => `
      <li class="itinerary-item">
        <div>
          <strong>${it.day} · ${it.time}</strong> ${it.activity}
          ${it.notes ? `<div class="it-notes">${it.notes}</div>` : ""}
        </div>
        <button class="remove" data-remove="${i}" aria-label="Remove">×</button>
      </li>
    `).join("");
  }

  function initItinerary() {
    renderItinerary();
    $("#itinerary-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const entry = {
        day: fd.get("day").trim(),
        time: fd.get("time"),
        activity: fd.get("activity").trim(),
        notes: (fd.get("notes") || "").trim()
      };
      const list = loadItinerary();
      list.push(entry);
      saveItinerary(list);
      e.target.reset();
      renderItinerary();
    });
    $("#itinerary-list").addEventListener("click", (e) => {
      if (!e.target.matches("[data-remove]")) return;
      const i = +e.target.dataset.remove;
      const list = loadItinerary();
      list.splice(i, 1);
      saveItinerary(list);
      renderItinerary();
    });
  }

  // ===========================================================
  // Weather
  // ===========================================================
  function renderWeather(data, mock = false) {
    const result = $("#weather-result");
    result.classList.add("show");
    result.innerHTML = `
      <div class="w-city">${data.name}${data.sys?.country ? ", " + data.sys.country : ""}</div>
      <div class="w-cond">${data.weather[0].description}</div>
      <div class="w-temp">${Math.round(data.main.temp)}°C</div>
      <div class="w-meta">
        <div>Feels like<strong>${Math.round(data.main.feels_like)}°C</strong></div>
        <div>Humidity<strong>${data.main.humidity}%</strong></div>
        <div>Wind<strong>${Math.round(data.wind.speed * 3.6)} km/h</strong></div>
      </div>
      ${mock ? `<div class="weather-banner">Showing sample data. Add your OpenWeather API key in <code>app.js</code> (line 5) to enable live weather.</div>` : ""}
    `;
  }

  function getMockWeather(city) {
    return {
      name: city || "Sample City",
      sys: { country: "" },
      weather: [{ description: "scattered clouds" }],
      main: { temp: 28, feels_like: 31, humidity: 72 },
      wind: { speed: 3.6 }
    };
  }

  async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Could not find weather for "${city}".`);
    }
    return res.json();
  }

  function initWeather() {
    $("#weather-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const city = $("#weather-city").value.trim();
      if (!city) return;
      const result = $("#weather-result");

      if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === "YOUR_API_KEY_HERE") {
        renderWeather(getMockWeather(city), true);
        return;
      }
      result.classList.add("show");
      result.innerHTML = `<p class="muted">Checking weather for ${city}…</p>`;
      try {
        const data = await fetchWeather(city);
        renderWeather(data);
      } catch (err) {
        result.innerHTML = `<p class="weather-error">${err.message}</p>`;
      }
    });
  }

  // ===========================================================
  // Enquiry form — posts to Web3Forms which emails the inbox
  // associated with WEB3FORMS_ACCESS_KEY (set up at the top of this file).
  // ===========================================================
  const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

  function initEnquiry() {
    const form = $("#enquiry-form");
    const success = $("#enquiry-success");
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitLabel = submitBtn ? submitBtn.textContent : "";

    function setError(field, msg) {
      const err = form.querySelector(`[data-err="${field}"]`);
      const input = form.elements[field];
      if (err) err.textContent = msg || "";
      if (input) input.classList.toggle("invalid", !!msg);
    }

    function showStatus(msg, kind) {
      success.textContent = msg;
      success.classList.remove("error");
      if (kind === "error") success.classList.add("error");
      success.classList.add("show");
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());

      let ok = true;
      const required = ["name", "email", "destination", "date"];
      required.forEach(f => {
        if (!data[f] || !String(data[f]).trim()) {
          setError(f, "Required.");
          ok = false;
        } else {
          setError(f, "");
        }
      });
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        setError("email", "Enter a valid email.");
        ok = false;
      }
      if (!ok) return;

      data.submittedAt = new Date().toISOString();
      const all = JSON.parse(localStorage.getItem("enquiries") || "[]");
      all.push(data);
      localStorage.setItem("enquiries", JSON.stringify(all));

      if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === "YOUR_WEB3FORMS_KEY_HERE") {
        showStatus(`Thanks, ${data.name.split(" ")[0]}! Your enquiry was saved locally. Email delivery is not yet configured — add a Web3Forms access key in app.js (line 10) to enable it.`, "error");
        form.reset();
        setTimeout(() => success.classList.remove("show"), 8000);
        return;
      }

      const payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `Travel Explorer enquiry — ${data.name} → ${data.destination}`,
        from_name: "Travel Explorer Enquiry",
        replyto: data.email,
        botcheck: "",
        ...data
      };

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }
      showStatus("Sending your enquiry…");

      try {
        const res = await fetch(WEB3FORMS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload)
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok || body.success === false) {
          throw new Error(body.message || `Request failed (${res.status}).`);
        }
        showStatus(`Thanks, ${data.name.split(" ")[0]}! Your enquiry is in — we'll be in touch within 24 hours.`);
        form.reset();
        setTimeout(() => success.classList.remove("show"), 6000);
      } catch (err) {
        showStatus(`Couldn't send right now: ${err.message} Your enquiry was saved locally — please try again later.`, "error");
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitLabel; }
      }
    });
  }

  // ===========================================================
  // Init
  // ===========================================================
  renderCities();
  renderFeaturedGuides();
  initBudget();
  initPacking();
  initItinerary();
  initWeather();
  initEnquiry();
})();
