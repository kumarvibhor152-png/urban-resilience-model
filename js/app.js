/**
 * Urban Natural Disaster Resilience Framework - Web Demonstration Controller
 * Rashtriya Raksha University (RRU)
 * Authors: Ujjawal Kumar & Kumar Vibhor
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Math & Visualization engines
  const model = new ResilienceModel(RESILIENCE_DATA);
  const charts = new ResilienceCharts();

  // App State
  let activeCityId = model.data.cities[0].id;
  let showAllRecovery = false;
  let radarFilterCityIds = null; // null means all
  let cltSimulationData = null;

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Auto-render KaTeX if available
  function triggerMathRender() {
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\(", right: "\\)", display: false }
        ],
        throwOnError: false
      });
    }
  }

  /* =========================================================================
     1. Tab Navigation System
     ========================================================================= */
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add("active");
        handleTabSwitch(targetId);
      }
    });
  });

  function handleTabSwitch(tabId) {
    if (tabId === "tab-dashboard") {
      updateDashboardCharts();
    } else if (tabId === "tab-model-calculator") {
      updateCalculatorView();
    } else if (tabId === "tab-recovery-dynamics") {
      updateRecoveryView();
    } else if (tabId === "tab-indicator-matrix") {
      renderIndicatorMatrix();
    } else if (tabId === "tab-sensitivity") {
      updateSensitivityView();
    } else if (tabId === "tab-clt") {
      if (!cltSimulationData) runCLTSimulation();
      else updateCLTView();
    }
    triggerMathRender();
  }

  /* =========================================================================
     2. KPI Cards & Overall Dashboard
     ========================================================================= */
  function updateKPICards() {
    const results = model.evaluateAllCities();
    const count = results.length;
    const meanCi = results.reduce((acc, c) => acc + c.Ci, 0) / count;
    const meanHi = results.reduce((acc, c) => acc + c.Hi, 0) / count;
    const meanPenalty = results.reduce((acc, c) => acc + c.hazardPenaltyPct, 0) / count;
    const meanRecovery = results.reduce((acc, c) => acc + c.Ri, 0) / count;

    document.getElementById("kpi-cities-count").textContent = count;
    document.getElementById("kpi-mean-ci").innerHTML = `${meanCi.toFixed(3)} <small>/ 1.00</small>`;
    document.getElementById("kpi-mean-hi").innerHTML = `${meanHi.toFixed(2)} <small>Index</small>`;
    document.getElementById("kpi-mean-penalty").innerHTML = `-${meanPenalty.toFixed(1)} <small>%</small>`;
    document.getElementById("kpi-mean-recovery").innerHTML = `${meanRecovery.toFixed(3)} <small>R(T)</small>`;
  }

  function renderRankingsTable() {
    const tbody = document.getElementById("table-rankings-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const results = model.evaluateAllCities();
    // Sort by NDRS descending
    const sorted = [...results].sort((a, b) => b.ndrs - a.ndrs);

    sorted.forEach((city, index) => {
      const tr = document.createElement("tr");

      // Rank styling
      let rankClass = "rank-def";
      if (city.ndrsRank === 1) rankClass = "rank-1";
      else if (city.ndrsRank === 2) rankClass = "rank-2";
      else if (city.ndrsRank === 3) rankClass = "rank-3";

      // Rank shift delta
      let shiftHtml = `<span class="rank-delta rank-same"><i data-lucide="minus" style="width:12px;height:12px;"></i> 0</span>`;
      if (city.rankDelta > 0) {
        shiftHtml = `<span class="rank-delta rank-up"><i data-lucide="arrow-up" style="width:12px;height:12px;"></i> +${city.rankDelta}</span>`;
      } else if (city.rankDelta < 0) {
        shiftHtml = `<span class="rank-delta rank-down"><i data-lucide="arrow-down" style="width:12px;height:12px;"></i> ${city.rankDelta}</span>`;
      }

      // Pillars mini summary
      const p = city.pillars;
      const pillarText = `P1:${(p.infrastructure*100).toFixed(0)}% P2:${(p.governance*100).toFixed(0)}% P3:${(p.economic*100).toFixed(0)}% P4:${(p.ecological*100).toFixed(0)}%`;

      tr.innerHTML = `
        <td>
          <span class="rank-badge ${rankClass}">#${city.ndrsRank}</span>
        </td>
        <td>
          <div class="city-cell-name">
            <span class="city-dot" style="background: ${city.color};"></span>
            <div>
              <div>${city.name}</div>
              <small style="color: var(--text-muted); font-size: 0.75rem;">${city.archetype}</small>
            </div>
          </div>
        </td>
        <td style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-secondary);">${pillarText}</td>
        <td style="font-family: var(--font-mono); font-weight: 600;">${city.Ci.toFixed(3)} <small style="color:var(--text-muted);">(#${city.baselineRank})</small></td>
        <td>
          <div style="font-family: var(--font-mono); font-weight: 600;">${city.Hi.toFixed(2)}</div>
          <div class="hazard-bar-container">
            <div class="hazard-bar-fill" style="width: ${(city.Hi * 100).toFixed(0)}%;"></div>
          </div>
        </td>
        <td style="color: var(--accent-rose); font-weight: 600; font-family: var(--font-mono);">
          -${city.hazardPenaltyPct.toFixed(1)}%
          <small style="display:block; color:var(--text-muted); font-weight: normal;">(factor ${city.hazardPenaltyFactor.toFixed(3)})</small>
        </td>
        <td style="color: var(--accent-emerald); font-weight: 700; font-family: var(--font-mono); font-size: 1.05rem;">
          ${city.ndrs.toFixed(3)}
        </td>
        <td>${shiftHtml}</td>
        <td style="font-family: var(--font-mono); color: #38bdf8; font-weight: 600;">
          ${city.Ri.toFixed(3)}
        </td>
        <td>
          <button class="btn btn-glass btn-sm btn-focus-city" data-city-id="${city.id}">
            Inspect
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Attach inspect listeners
    tbody.querySelectorAll(".btn-focus-city").forEach(btn => {
      btn.addEventListener("click", () => {
        const cId = btn.getAttribute("data-city-id");
        setActiveCity(cId);
        // Switch to model calculator tab
        const calcTabBtn = document.querySelector('[data-tab="tab-model-calculator"]');
        if (calcTabBtn) calcTabBtn.click();
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function renderCityMiniCards() {
    const container = document.getElementById("city-mini-cards-container");
    if (!container) return;
    container.innerHTML = "";

    const results = model.evaluateAllCities();
    results.forEach(city => {
      const card = document.createElement("div");
      card.className = `city-mini-card ${city.id === activeCityId ? "selected" : ""}`;
      card.style.setProperty("--card-color", city.color);
      card.setAttribute("data-city-id", city.id);

      card.innerHTML = `
        <div class="city-mini-header">
          <div>
            <div class="city-archetype">${city.archetype}</div>
            <div class="city-mini-name">${city.name}</div>
          </div>
          <span class="city-hazard-badge">H: ${city.hazardIndex.toFixed(2)}</span>
        </div>
        <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">
          ${city.tagline}
        </p>
        <div class="city-metrics-row">
          <span style="color: var(--text-muted);">Baseline Capacity C<sub>i</sub>:</span>
          <strong>${city.Ci.toFixed(3)} (#${city.baselineRank})</strong>
        </div>
        <div class="city-metrics-row">
          <span style="color: var(--text-muted);">Hazard Score NDRS<sub>i</sub>:</span>
          <strong style="color: var(--accent-emerald); font-size: 0.95rem;">${city.ndrs.toFixed(3)} (#${city.ndrsRank})</strong>
        </div>
        <div class="city-metrics-row">
          <span style="color: var(--text-muted);">Avg Recovery R(T):</span>
          <strong style="color: #38bdf8;">${city.Ri.toFixed(3)}</strong>
        </div>
      `;

      card.addEventListener("click", () => {
        setActiveCity(city.id);
      });

      container.appendChild(card);
    });
  }

  function setActiveCity(cityId) {
    activeCityId = cityId;
    // Update mini cards selection
    document.querySelectorAll(".city-mini-card").forEach(c => {
      if (c.getAttribute("data-city-id") === cityId) c.classList.add("selected");
      else c.classList.remove("selected");
    });

    // Sync dropdowns
    const calcSelect = document.getElementById("select-calc-city");
    if (calcSelect) calcSelect.value = cityId;

    const recoverySelect = document.getElementById("select-recovery-city");
    if (recoverySelect) recoverySelect.value = cityId;

    const sensSelect = document.getElementById("select-sensitivity-city");
    if (sensSelect) sensSelect.value = cityId;

    updateCalculatorView();
    updateRecoveryView();
    updateSensitivityView();
  }

  function updateDashboardCharts() {
    const results = model.evaluateAllCities();
    charts.renderComparisonChart("chart-comparison", results);
    charts.renderRadarChart("chart-radar", results, radarFilterCityIds);
  }

  /* =========================================================================
     3. Model Calculator & Equation Evaluator
     ========================================================================= */
  function populateCityDropdowns() {
    const dropdowns = [
      document.getElementById("select-calc-city"),
      document.getElementById("select-recovery-city"),
      document.getElementById("select-sensitivity-city")
    ];

    dropdowns.forEach(dd => {
      if (!dd) return;
      dd.innerHTML = "";
      model.data.cities.forEach(city => {
        const opt = document.createElement("option");
        opt.value = city.id;
        opt.textContent = `${city.name} (${city.archetype})`;
        if (city.id === activeCityId) opt.selected = true;
        dd.appendChild(opt);
      });
    });
  }

  function updateCalculatorView() {
    const city = model.data.cities.find(c => c.id === activeCityId) || model.data.cities[0];
    const pillars = model.computeCityPillars(city);
    const ndrsRes = model.computeNDRS(city);
    const derivs = model.computeDerivatives(city);

    // Update KaTeX Equation 1: Baseline Capacity
    const w = model.weights;
    const p1 = pillars.infrastructure || 0;
    const p2 = pillars.governance || 0;
    const p3 = pillars.economic || 0;
    const p4 = pillars.ecological || 0;

    const mathCi = `\\begin{aligned}
      C_i &= w_1 P_1 + w_2 P_2 + w_3 P_3 + w_4 P_4 \\\\[4pt]
      &= (${w.infrastructure.toFixed(2)})(${p1.toFixed(3)}) + (${w.governance.toFixed(2)})(${p2.toFixed(3)}) + (${w.economic.toFixed(2)})(${p3.toFixed(3)}) + (${w.ecological.toFixed(2)})(${p4.toFixed(3)}) \\\\[4pt]
      &= \\mathbf{${ndrsRes.Ci.toFixed(4)}}
    \\end{aligned}`;

    if (window.katex) {
      window.katex.render(mathCi, document.getElementById("math-box-ci"), { displayMode: true, throwOnError: false });
    }

    // Update KaTeX Equation 2: NDRS
    const gamma = model.gamma;
    const Hi = city.hazardIndex;
    const penaltyFactor = ndrsRes.hazardPenaltyFactor;

    const mathNDRS = `\\begin{aligned}
      NDRS_i &= C_i \\cdot e^{-\\gamma H_i} \\\\[4pt]
      &= (${ndrsRes.Ci.toFixed(4)}) \\cdot e^{-(${gamma.toFixed(2)})(${Hi.toFixed(2)})} \\\\[4pt]
      &= (${ndrsRes.Ci.toFixed(4)}) \\cdot (${penaltyFactor.toFixed(4)}) = \\mathbf{${ndrsRes.ndrs.toFixed(4)}}
    \\end{aligned}`;

    if (window.katex) {
      window.katex.render(mathNDRS, document.getElementById("math-box-ndrs"), { displayMode: true, throwOnError: false });
    }

    // Update Derivatives Readouts
    const devH = document.getElementById("deriv-hazard");
    const devC = document.getElementById("deriv-capacity");
    const devG = document.getElementById("deriv-gamma");

    if (devH) devH.textContent = derivs.dNDRS_dH.toFixed(4);
    if (devC) devC.textContent = "+" + derivs.dNDRS_dC.toFixed(4);
    if (devG) devG.textContent = derivs.dNDRS_dGamma.toFixed(4);
  }

  // Weight Slider listeners
  const weightSliders = {
    infrastructure: document.getElementById("slider-weight-p1"),
    governance: document.getElementById("slider-weight-p2"),
    economic: document.getElementById("slider-weight-p3"),
    ecological: document.getElementById("slider-weight-p4")
  };

  const weightLabels = {
    infrastructure: document.getElementById("val-weight-p1"),
    governance: document.getElementById("val-weight-p2"),
    economic: document.getElementById("val-weight-p3"),
    ecological: document.getElementById("val-weight-p4")
  };

  Object.entries(weightSliders).forEach(([key, slider]) => {
    if (!slider) return;
    slider.addEventListener("input", () => {
      const newWeights = {
        infrastructure: parseFloat(weightSliders.infrastructure.value),
        governance: parseFloat(weightSliders.governance.value),
        economic: parseFloat(weightSliders.economic.value),
        ecological: parseFloat(weightSliders.ecological.value)
      };
      model.setWeights(newWeights);
      syncWeightDisplays();
      refreshAll();
    });
  });

  function syncWeightDisplays() {
    for (const [key, val] of Object.entries(model.weights)) {
      if (weightLabels[key]) weightLabels[key].textContent = val.toFixed(2);
      if (weightSliders[key]) weightSliders[key].value = val.toFixed(2);
    }
  }

  // Gamma Slider listener
  const gammaSlider = document.getElementById("slider-gamma");
  const gammaLabel = document.getElementById("val-gamma");
  if (gammaSlider) {
    gammaSlider.addEventListener("input", () => {
      const g = parseFloat(gammaSlider.value);
      model.setGamma(g);
      if (gammaLabel) gammaLabel.textContent = g.toFixed(2);
      refreshAll();
    });
  }

  // Weight Presets Buttons
  document.querySelectorAll(".preset-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".preset-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const presetKey = chip.getAttribute("data-preset");
      const preset = model.data.weightPresets[presetKey];
      if (preset) {
        model.setWeights(preset.weights);
        syncWeightDisplays();
        refreshAll();
      }
    });
  });

  // Normalize weights button
  const normBtn = document.getElementById("btn-normalize-weights");
  if (normBtn) {
    normBtn.addEventListener("click", () => {
      model.setWeights(model.weights);
      syncWeightDisplays();
      refreshAll();
    });
  }

  /* =========================================================================
     4. Dynamic Recovery Dynamics
     ========================================================================= */
  const recoveryL0Slider = document.getElementById("slider-recovery-l0");
  const recoveryKrSlider = document.getElementById("slider-recovery-kr");
  const recoveryTSlider = document.getElementById("slider-recovery-t");

  const recoveryL0Val = document.getElementById("val-recovery-l0");
  const recoveryKrVal = document.getElementById("val-recovery-kr");
  const recoveryTVal = document.getElementById("val-recovery-t");

  if (recoveryL0Slider) {
    recoveryL0Slider.addEventListener("input", () => {
      const val = parseFloat(recoveryL0Slider.value);
      if (recoveryL0Val) recoveryL0Val.textContent = val.toFixed(2);
      const city = model.data.cities.find(c => c.id === activeCityId);
      if (city) city.recoveryLoss0 = val;
      updateRecoveryView();
      updateKPICards();
      renderRankingsTable();
    });
  }

  if (recoveryKrSlider) {
    recoveryKrSlider.addEventListener("input", () => {
      const val = parseFloat(recoveryKrSlider.value);
      if (recoveryKrVal) recoveryKrVal.textContent = val.toFixed(2);
      const city = model.data.cities.find(c => c.id === activeCityId);
      if (city) city.recoveryRate = val;
      updateRecoveryView();
      updateKPICards();
      renderRankingsTable();
    });
  }

  if (recoveryTSlider) {
    recoveryTSlider.addEventListener("input", () => {
      const val = parseInt(recoveryTSlider.value);
      model.setRecoveryTimeSpan(val);
      if (recoveryTVal) recoveryTVal.textContent = `${val} Days`;
      updateRecoveryView();
      updateKPICards();
      renderRankingsTable();
    });
  }

  const toggleMultiBtn = document.getElementById("btn-toggle-recovery-multi");
  if (toggleMultiBtn) {
    toggleMultiBtn.addEventListener("click", () => {
      showAllRecovery = !showAllRecovery;
      toggleMultiBtn.textContent = showAllRecovery ? "Show Single City" : "Compare All Cities";
      updateRecoveryView();
    });
  }

  function updateRecoveryView() {
    const activeCity = model.data.cities.find(c => c.id === activeCityId) || model.data.cities[0];
    
    // Sync slider inputs to active city
    if (recoveryL0Slider) recoveryL0Slider.value = activeCity.recoveryLoss0;
    if (recoveryL0Val) recoveryL0Val.textContent = activeCity.recoveryLoss0.toFixed(2);
    if (recoveryKrSlider) recoveryKrSlider.value = activeCity.recoveryRate;
    if (recoveryKrVal) recoveryKrVal.textContent = activeCity.recoveryRate.toFixed(2);
    
    const labelActive = document.getElementById("label-active-city-recovery");
    if (labelActive) labelActive.textContent = `Active City: ${activeCity.name}`;

    // Compute recovery trajectories
    const recoveryResults = model.data.cities.map(c => {
      const res = model.generateRecoveryCurve(c, 60, model.recoveryTimeSpan);
      res.color = c.color;
      return res;
    });

    charts.renderRecoveryChart("chart-recovery", recoveryResults, activeCityId, showAllRecovery);

    // Update milestone stats for active city
    const activeRes = recoveryResults.find(r => r.cityId === activeCityId) || recoveryResults[0];
    const initialPt = model.computeRecoveryPoint(activeCity, 0);

    const statRi = document.getElementById("stat-ri-t");
    const statT90 = document.getElementById("stat-t90");
    const statDq = document.getElementById("stat-dq-dt");

    if (statRi) statRi.textContent = activeRes.Ri_T.toFixed(3);
    if (statT90) statT90.textContent = isFinite(activeRes.t90) ? `${activeRes.t90.toFixed(1)} d` : "> Horizon";
    if (statDq) statDq.textContent = initialPt.dQ_dt.toFixed(3);

    // KaTeX Integral Formula rendering
    const L0 = activeCity.recoveryLoss0;
    const kr = activeCity.recoveryRate;
    const T = model.recoveryTimeSpan;
    const integralDiscount = (L0 / (kr * T)) * (1 - Math.exp(-kr * T));

    const mathIntegral = `\\begin{aligned}
      R_i(${T}) &= 1 - \\frac{${L0.toFixed(2)}}{(${kr.toFixed(2)})(${T})} \\left(1 - e^{-(${kr.toFixed(2)})(${T})}\\right) \\\\[4pt]
      &= 1 - (${integralDiscount.toFixed(4)}) = \\mathbf{${activeRes.Ri_T.toFixed(4)}}
    \\end{aligned}`;

    if (window.katex) {
      window.katex.render(mathIntegral, document.getElementById("math-box-integral"), { displayMode: true, throwOnError: false });
    }
  }

  /* =========================================================================
     5. Indicator Matrix & Min-Max Normalizer
     ========================================================================= */
  function renderIndicatorMatrix() {
    const tbody = document.getElementById("table-indicator-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    model.data.indicators.forEach(ind => {
      const pillar = model.data.pillars.find(p => p.id === ind.pillarId);
      const tr = document.createElement("tr");

      let rowHtml = `
        <td style="font-weight: 700; color: ${pillar ? pillar.color : '#fff'};">
          ${pillar ? pillar.code : ''}
        </td>
        <td>
          <div style="font-weight: 600;">${ind.name}</div>
          <small style="color: var(--text-muted); font-size: 0.72rem;">${ind.description}</small>
        </td>
        <td>
          <span class="badge" style="background: ${ind.isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}; color: ${ind.isPositive ? '#34d399' : '#fb7185'}; font-size: 0.72rem;">
            ${ind.isPositive ? 'Higher Better (+)' : 'Lower Better (-)'}
          </span>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${ind.unit}</div>
        </td>
        <td style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-secondary);">
          [${ind.min}, ${ind.max}]
        </td>
      `;

      // City raw inputs
      model.data.cities.forEach(city => {
        const val = city.rawValues[ind.id] !== undefined ? city.rawValues[ind.id] : ind.min;
        const normZ = model.normalizeIndicator(val, ind);

        rowHtml += `
          <td>
            <input type="number" step="0.1" class="form-input raw-ind-input" 
              data-city-id="${city.id}" data-ind-id="${ind.id}" 
              value="${val}" style="width: 82px; padding: 4px 8px; font-family: var(--font-mono); font-size: 0.85rem;">
            <div style="font-size: 0.72rem; color: #38bdf8; font-family: var(--font-mono); margin-top: 3px;">
              z = ${normZ.toFixed(2)}
            </div>
          </td>
        `;
      });

      tr.innerHTML = rowHtml;
      tbody.appendChild(tr);
    });

    // In-place editing listeners
    tbody.querySelectorAll(".raw-ind-input").forEach(input => {
      input.addEventListener("change", (e) => {
        const cId = input.getAttribute("data-city-id");
        const indId = input.getAttribute("data-ind-id");
        const newVal = parseFloat(input.value);

        const targetCity = model.data.cities.find(c => c.id === cId);
        if (targetCity) {
          targetCity.rawValues[indId] = newVal;
          refreshAll();
          renderIndicatorMatrix(); // Refresh normalized z display
        }
      });
    });
  }

  /* =========================================================================
     6. Sensitivity Analysis & Investment Studio
     ========================================================================= */
  function updateSensitivityView() {
    const activeCity = model.data.cities.find(c => c.id === activeCityId) || model.data.cities[0];
    const sensData = model.computePillarSensitivity(activeCity);
    charts.renderSensitivityChart("chart-sensitivity", sensData);

    computeWhatIfInvestment();
  }

  // Investment Studio sliders
  const investSliders = [
    document.getElementById("slider-invest-p1"),
    document.getElementById("slider-invest-p2"),
    document.getElementById("slider-invest-p3"),
    document.getElementById("slider-invest-p4")
  ];

  investSliders.forEach(slider => {
    if (!slider) return;
    slider.addEventListener("input", computeWhatIfInvestment);
  });

  function computeWhatIfInvestment() {
    const activeCity = model.data.cities.find(c => c.id === activeCityId) || model.data.cities[0];
    const originalNDRS = model.computeNDRS(activeCity).ndrs;

    const b1 = parseFloat(document.getElementById("slider-invest-p1")?.value || 25);
    const b2 = parseFloat(document.getElementById("slider-invest-p2")?.value || 25);
    const b3 = parseFloat(document.getElementById("slider-invest-p3")?.value || 25);
    const b4 = parseFloat(document.getElementById("slider-invest-p4")?.value || 25);

    document.getElementById("val-invest-p1").textContent = `$${b1}M`;
    document.getElementById("val-invest-p2").textContent = `$${b2}M`;
    document.getElementById("val-invest-p3").textContent = `$${b3}M`;
    document.getElementById("val-invest-p4").textContent = `$${b4}M`;

    // Each $10M yields +0.03 pillar increase
    const currPillars = model.computeCityPillars(activeCity);
    const p1New = Math.min(1.0, currPillars.infrastructure + (b1 / 10) * 0.03);
    const p2New = Math.min(1.0, currPillars.governance + (b2 / 10) * 0.03);
    const p3New = Math.min(1.0, currPillars.economic + (b3 / 10) * 0.03);
    const p4New = Math.min(1.0, currPillars.ecological + (b4 / 10) * 0.03);

    const w = model.weights;
    const newCi = w.infrastructure * p1New + w.governance * p2New + w.economic * p3New + w.ecological * p4New;
    const newNDRS = newCi * Math.exp(-model.gamma * activeCity.hazardIndex);
    const delta = newNDRS - originalNDRS;
    const pct = originalNDRS > 0 ? (delta / originalNDRS) * 100 : 0;

    const projEl = document.getElementById("val-projected-ndrs");
    const deltaEl = document.getElementById("val-projected-delta");

    if (projEl) projEl.textContent = newNDRS.toFixed(4);
    if (deltaEl) deltaEl.textContent = `+${delta.toFixed(4)} (+${pct.toFixed(1)}%)`;
  }

  const applyInvestBtn = document.getElementById("btn-apply-investment");
  if (applyInvestBtn) {
    applyInvestBtn.addEventListener("click", () => {
      if (window.confetti) {
        window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
      alert(`Strategic Investment Strategy committed for ${activeCityId}! Projected resilience score updated.`);
    });
  }

  /* =========================================================================
     7. Central Limit Theorem Simulator (Page 2 of Report)
     ========================================================================= */
  const cltNSlider = document.getElementById("slider-clt-n");
  const cltNVal = document.getElementById("val-clt-n");
  const cltPopSelect = document.getElementById("select-clt-pop");
  const cltTrialsSlider = document.getElementById("slider-clt-trials");
  const cltTrialsVal = document.getElementById("val-clt-trials");
  const runCLTBtn = document.getElementById("btn-run-clt");

  if (cltNSlider) {
    cltNSlider.addEventListener("input", () => {
      if (cltNVal) cltNVal.textContent = cltNSlider.value;
      runCLTSimulation();
    });
  }

  if (cltTrialsSlider) {
    cltTrialsSlider.addEventListener("input", () => {
      if (cltTrialsVal) cltTrialsVal.textContent = parseInt(cltTrialsSlider.value).toLocaleString();
      runCLTSimulation();
    });
  }

  if (cltPopSelect) {
    cltPopSelect.addEventListener("change", runCLTSimulation);
  }

  if (runCLTBtn) {
    runCLTBtn.addEventListener("click", runCLTSimulation);
  }

  function runCLTSimulation() {
    const n = parseInt(cltNSlider?.value || 30);
    const trials = parseInt(cltTrialsSlider?.value || 1000);
    const popType = cltPopSelect?.value || "skewed";

    cltSimulationData = model.runCLTSimulation(n, trials, popType);
    updateCLTView();
  }

  function updateCLTView() {
    if (!cltSimulationData) return;
    charts.renderCLTChart("chart-clt", cltSimulationData);

    const tSe = document.getElementById("stat-clt-theor-se");
    const eSe = document.getElementById("stat-clt-emp-se");
    const mMean = document.getElementById("stat-clt-mean");

    if (tSe) tSe.textContent = cltSimulationData.theoreticalSE.toFixed(3);
    if (eSe) eSe.textContent = cltSimulationData.empiricalSE.toFixed(3);
    if (mMean) mMean.textContent = `${cltSimulationData.meanOfMeans.toFixed(2)} (μ=${cltSimulationData.popMean.toFixed(2)})`;
  }

  /* =========================================================================
     8. Custom City Creation Modal
     ========================================================================= */
  const customModal = document.getElementById("modal-custom-city");
  const openModalBtn = document.getElementById("btn-open-custom-city");
  const closeModalBtn = document.getElementById("btn-close-modal");
  const cancelModalBtn = document.getElementById("btn-cancel-custom-city");
  const customForm = document.getElementById("form-custom-city");

  if (openModalBtn) {
    openModalBtn.addEventListener("click", () => {
      populateCustomModalIndicators();
      customModal.classList.add("active");
    });
  }

  [closeModalBtn, cancelModalBtn].forEach(b => {
    if (b) b.addEventListener("click", () => customModal.classList.remove("active"));
  });

  function populateCustomModalIndicators() {
    const container = document.getElementById("custom-indicators-inputs");
    if (!container) return;
    container.innerHTML = "";

    model.data.indicators.forEach(ind => {
      const div = document.createElement("div");
      div.className = "form-group";
      const midVal = ((ind.min + ind.max) / 2).toFixed(1);

      div.innerHTML = `
        <label for="cust-ind-${ind.id}">
          ${ind.name} (${ind.unit}) [${ind.min} - ${ind.max}]
        </label>
        <input type="number" step="0.1" min="${ind.min}" max="${ind.max}" class="form-input" 
          id="cust-ind-${ind.id}" value="${midVal}" required>
      `;
      container.appendChild(div);
    });
  }

  if (customForm) {
    customForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("custom-name").value.trim();
      const archetype = document.getElementById("custom-archetype").value.trim();
      const hazardIndex = parseFloat(document.getElementById("custom-hazard").value);
      const recoveryLoss0 = parseFloat(document.getElementById("custom-loss").value);
      const recoveryRate = parseFloat(document.getElementById("custom-rate").value);
      const color = document.getElementById("custom-color").value;

      const rawValues = {};
      model.data.indicators.forEach(ind => {
        const el = document.getElementById(`cust-ind-${ind.id}`);
        rawValues[ind.id] = el ? parseFloat(el.value) : ind.min;
      });

      const newCity = {
        id: "city_" + Date.now(),
        name,
        tagline: `User-defined Profile: ${archetype}`,
        archetype,
        hazardType: "User-configured Multi-Hazard Profile",
        hazardIndex,
        recoveryLoss0,
        recoveryRate,
        color,
        description: `Custom city generated to stress-test the resilience model under user specifications.`,
        rawValues
      };

      model.data.cities.push(newCity);
      populateCityDropdowns();
      setActiveCity(newCity.id);
      customModal.classList.remove("active");

      refreshAll();
      if (window.confetti) {
        window.confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      }
    });
  }

  /* =========================================================================
     9. Export Analytical Report (JSON / CSV / Print)
     ========================================================================= */
  const exportBtn = document.getElementById("btn-export-report");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const results = model.evaluateAllCities();
      const exportData = {
        meta: model.data.projectInfo,
        modelParameters: {
          gamma: model.gamma,
          weights: model.weights,
          recoveryHorizonT: model.recoveryTimeSpan
        },
        citiesEvaluated: results.map(r => ({
          name: r.name,
          archetype: r.archetype,
          hazardExposure: r.Hi,
          baselineCapacity_Ci: r.Ci,
          baselineRank: r.baselineRank,
          hazardPenaltyFactor: r.hazardPenaltyFactor,
          hazardPenaltyPercentage: r.hazardPenaltyPct,
          naturalDisasterResilienceScore_NDRS: r.ndrs,
          ndrsRank: r.ndrsRank,
          rankDelta: r.rankDelta,
          averageRestoredCapacity_RT: r.Ri,
          derivatives: r.derivatives
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `RRU_Resilience_Analysis_Report_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Reset Model button
  const resetBtn = document.getElementById("btn-reset-defaults");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Reset all weights, hazard parameters, and city metrics to official report defaults?")) {
        location.reload();
      }
    });
  }

  // City dropdown change listeners
  const calcSelect = document.getElementById("select-calc-city");
  if (calcSelect) {
    calcSelect.addEventListener("change", (e) => setActiveCity(e.target.value));
  }
  const recoverySelect = document.getElementById("select-recovery-city");
  if (recoverySelect) {
    recoverySelect.addEventListener("change", (e) => setActiveCity(e.target.value));
  }
  const sensSelect = document.getElementById("select-sensitivity-city");
  if (sensSelect) {
    sensSelect.addEventListener("change", (e) => setActiveCity(e.target.value));
  }

  // Radar chart toggle all
  const radarToggleBtn = document.getElementById("btn-toggle-all-radar");
  if (radarToggleBtn) {
    radarToggleBtn.addEventListener("click", () => {
      if (radarFilterCityIds === null) {
        radarFilterCityIds = [activeCityId];
        radarToggleBtn.textContent = "Show All Cities";
      } else {
        radarFilterCityIds = null;
        radarToggleBtn.textContent = "Focus Active City";
      }
      charts.renderRadarChart("chart-radar", model.evaluateAllCities(), radarFilterCityIds);
    });
  }

  /* =========================================================================
     10. Global Refresh Helper
     ========================================================================= */
  function refreshAll() {
    updateKPICards();
    renderRankingsTable();
    renderCityMiniCards();
    updateDashboardCharts();
    updateCalculatorView();
    updateRecoveryView();
    updateSensitivityView();
    triggerMathRender();
  }

  // Initial Boot
  populateCityDropdowns();
  syncWeightDisplays();
  refreshAll();
  renderIndicatorMatrix();
});
