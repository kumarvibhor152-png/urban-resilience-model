/**
 * Mathematical Framework for Urban Natural Disaster Resilience Score Analysis
 * Pure Mathematical Computation Engine
 * Equations derived from RRU Project Report (Oct 2026)
 * Authors: Ujjawal Kumar & Kumar Vibhor
 */

class ResilienceModel {
  constructor(data) {
    this.data = JSON.parse(JSON.stringify(data));
    this.gamma = data.defaults.gamma;
    this.weights = { ...data.weightPresets.balanced.weights };
    this.recoveryTimeSpan = data.defaults.recoveryTimeSpan;
    this.t0 = data.defaults.t0;
  }

  /**
   * Set pillar weights and ensure sum = 1
   */
  setWeights(newWeights) {
    let sum = Object.values(newWeights).reduce((a, b) => a + b, 0);
    if (sum === 0) sum = 1;
    this.weights = {};
    for (const [k, v] of Object.entries(newWeights)) {
      this.weights[k] = v / sum;
    }
  }

  /**
   * Set hazard sensitivity parameter gamma
   */
  setGamma(gammaVal) {
    this.gamma = Math.max(0, parseFloat(gammaVal) || 0.85);
  }

  /**
   * Set evaluation time horizon T
   */
  setRecoveryTimeSpan(tSpan) {
    this.recoveryTimeSpan = Math.max(1, parseFloat(tSpan) || 30);
  }

  /**
   * Step 1: Min-Max Normalization (Report Eq. Page 3)
   * Positive: z_ij = (x_ij - x_min) / (x_max - x_min)
   * Negative: z_ij = (x_max - x_ij) / (x_max - x_min)
   */
  normalizeIndicator(rawVal, indicator) {
    const min = indicator.min;
    const max = indicator.max;
    if (max === min) return 1.0;

    let z;
    if (indicator.isPositive) {
      z = (rawVal - min) / (max - min);
    } else {
      z = (max - rawVal) / (max - min);
    }
    // Clamp between 0 and 1
    return Math.max(0, Math.min(1, z));
  }

  /**
   * Compute normalized values for all indicators of a city
   */
  computeCityNormalizedIndicators(city) {
    const normalized = {};
    for (const ind of this.data.indicators) {
      const raw = city.rawValues[ind.id] !== undefined ? city.rawValues[ind.id] : ind.min;
      normalized[ind.id] = this.normalizeIndicator(raw, ind);
    }
    return normalized;
  }

  /**
   * Step 2: Pillar Scores P_k (average of normalized indicators in pillar)
   */
  computeCityPillars(city) {
    const normalized = this.computeCityNormalizedIndicators(city);
    const pillarScores = {};

    for (const pillar of this.data.pillars) {
      const pillarIndicators = this.data.indicators.filter(ind => ind.pillarId === pillar.id);
      if (pillarIndicators.length === 0) {
        pillarScores[pillar.id] = 0;
        continue;
      }
      const sum = pillarIndicators.reduce((acc, ind) => acc + normalized[ind.id], 0);
      pillarScores[pillar.id] = sum / pillarIndicators.length;
    }

    return pillarScores;
  }

  /**
   * Step 2: Baseline Resilience Capacity C_i (Report Eq. Page 4)
   * C_i = sum(w_j * z_ij) = sum(w_k * P_k)
   */
  computeBaselineCapacity(city) {
    const pillars = this.computeCityPillars(city);
    let Ci = 0;
    for (const pillar of this.data.pillars) {
      const w = this.weights[pillar.id] || 0.25;
      Ci += w * pillars[pillar.id];
    }
    return Math.max(0, Math.min(1, Ci));
  }

  /**
   * Step 3: Natural Disaster Resilience Score NDRS_i (Report Eq. Page 4)
   * NDRS_i = C_i * exp(-gamma * H_i)
   */
  computeNDRS(city, customGamma = null) {
    const gamma = customGamma !== null ? customGamma : this.gamma;
    const Ci = this.computeBaselineCapacity(city);
    const Hi = Math.max(0, city.hazardIndex);
    const hazardPenaltyFactor = Math.exp(-gamma * Hi);
    const ndrs = Ci * hazardPenaltyFactor;

    return {
      Ci,
      Hi,
      gamma,
      hazardPenaltyFactor,
      hazardPenaltyPct: (1 - hazardPenaltyFactor) * 100,
      ndrs
    };
  }

  /**
   * Step 3 & 5: Mathematical Partial Derivatives (Report Page 4 & 5)
   * d(NDRS)/dH = -gamma * C * exp(-gamma * H) < 0
   * d(NDRS)/dC = exp(-gamma * H) > 0
   * d(NDRS)/dgamma = -H * C * exp(-gamma * H) <= 0
   */
  computeDerivatives(city, customGamma = null) {
    const gamma = customGamma !== null ? customGamma : this.gamma;
    const Ci = this.computeBaselineCapacity(city);
    const Hi = city.hazardIndex;
    const expTerm = Math.exp(-gamma * Hi);

    const dNDRS_dH = -gamma * Ci * expTerm;
    const dNDRS_dC = expTerm;
    const dNDRS_dGamma = -Hi * Ci * expTerm;

    return {
      dNDRS_dH,
      dNDRS_dC,
      dNDRS_dGamma,
      interpretation: {
        hazardDerivative: "Negative: Higher hazard exposure exponentially degrades resilience.",
        capacityDerivative: "Positive: Improving baseline capacity yields linear scaled resilience boost.",
        gammaDerivative: "Non-positive: Higher model sensitivity penalizes hazardous cities more stringently."
      }
    };
  }

  /**
   * Step 4: Time-dependent Disaster Recovery (Report Page 4 & 5)
   * Q_i(t) = 1 - L_0,i * exp(-k_r,i * (t - t0))
   * dQ/dt = k_r,i * L_0,i * exp(-k_r,i * (t - t0))
   * d2Q/dt2 = - (k_r,i)^2 * L_0,i * exp(-k_r,i * (t - t0))
   * R_i(T) = 1 - (L_0,i / (k_r,i * T)) * (1 - exp(-k_r,i * T))
   */
  computeRecoveryPoint(city, t, L0Override = null, krOverride = null) {
    const L0 = L0Override !== null ? L0Override : city.recoveryLoss0;
    const kr = krOverride !== null ? krOverride : city.recoveryRate;
    const tDiff = Math.max(0, t - this.t0);

    const expTerm = Math.exp(-kr * tDiff);
    const Qt = Math.max(0, Math.min(1, 1 - L0 * expTerm));
    const dQ_dt = kr * L0 * expTerm;
    const d2Q_dt2 = -(kr * kr) * L0 * expTerm;

    return { t, Qt, dQ_dt, d2Q_dt2 };
  }

  /**
   * Average restored capacity over period T: R_i(T)
   */
  computeAverageRestoredCapacity(city, T = null, L0Override = null, krOverride = null) {
    const period = T !== null ? T : this.recoveryTimeSpan;
    const L0 = L0Override !== null ? L0Override : city.recoveryLoss0;
    const kr = krOverride !== null ? krOverride : city.recoveryRate;

    if (kr * period === 0) return 1 - L0;
    const integralDiscount = (L0 / (kr * period)) * (1 - Math.exp(-kr * period));
    const Ri = 1 - integralDiscount;
    return Math.max(0, Math.min(1, Ri));
  }

  /**
   * Time to reach target functional capacity (e.g. 90% or 95%)
   */
  computeTimeToRecovery(city, targetFraction = 0.90, L0Override = null, krOverride = null) {
    const L0 = L0Override !== null ? L0Override : city.recoveryLoss0;
    const kr = krOverride !== null ? krOverride : city.recoveryRate;

    // Initially at t0: Q = 1 - L0
    if (1 - L0 >= targetFraction) return 0; // Already exceeded
    // 1 - L0 * exp(-kr * dt) = targetFraction
    // exp(-kr * dt) = (1 - targetFraction) / L0
    const ratio = (1 - targetFraction) / L0;
    if (ratio <= 0) return Infinity;
    const dt = -Math.log(ratio) / kr;
    return Math.max(0, dt);
  }

  /**
   * Generate recovery time series curve data
   */
  generateRecoveryCurve(city, steps = 60, T = null, L0Override = null, krOverride = null) {
    const period = T !== null ? T : this.recoveryTimeSpan;
    const curve = [];
    const stepSize = period / steps;

    for (let i = 0; i <= steps; i++) {
      const t = this.t0 + i * stepSize;
      const pt = this.computeRecoveryPoint(city, t, L0Override, krOverride);
      curve.push(pt);
    }

    const Ri = this.computeAverageRestoredCapacity(city, period, L0Override, krOverride);
    const t50 = this.computeTimeToRecovery(city, 0.50, L0Override, krOverride);
    const t90 = this.computeTimeToRecovery(city, 0.90, L0Override, krOverride);
    const t95 = this.computeTimeToRecovery(city, 0.95, L0Override, krOverride);

    return {
      cityId: city.id,
      cityName: city.name,
      T: period,
      points: curve,
      Ri_T: Ri,
      t50,
      t90,
      t95
    };
  }

  /**
   * Step 6: Sensitivity Analysis (Report Page 5)
   * Delta NDRS_i = NDRS_new - NDRS_original
   * Testing investment in each pillar (+0.10 absolute or +15% relative improvement)
   */
  computePillarSensitivity(city) {
    const originalNDRS = this.computeNDRS(city).ndrs;
    const sensitivityResults = [];

    for (const pillar of this.data.pillars) {
      // Simulate improving this pillar score by +0.15 (clamped to 1.0)
      const currentPillars = this.computeCityPillars(city);
      const newPillars = { ...currentPillars };
      newPillars[pillar.id] = Math.min(1.0, currentPillars[pillar.id] + 0.15);

      // Recompute baseline capacity with improved pillar
      let newCi = 0;
      for (const p of this.data.pillars) {
        const w = this.weights[p.id] || 0.25;
        newCi += w * newPillars[p.id];
      }
      const newNDRS = newCi * Math.exp(-this.gamma * city.hazardIndex);
      const deltaNDRS = newNDRS - originalNDRS;
      const pctGain = originalNDRS > 0 ? (deltaNDRS / originalNDRS) * 100 : 0;

      sensitivityResults.push({
        pillarId: pillar.id,
        pillarName: pillar.name,
        code: pillar.code,
        color: pillar.color,
        originalNDRS,
        newNDRS,
        deltaNDRS,
        pctGain
      });
    }

    return sensitivityResults;
  }

  /**
   * Evaluate all cities: return rankings, baseline C_i, NDRS_i, and rank inversion
   */
  evaluateAllCities() {
    const results = this.data.cities.map(city => {
      const pillars = this.computeCityPillars(city);
      const ndrsObj = this.computeNDRS(city);
      const derivatives = this.computeDerivatives(city);
      const recovery = this.computeAverageRestoredCapacity(city);

      return {
        ...city,
        pillars,
        Ci: ndrsObj.Ci,
        Hi: ndrsObj.Hi,
        hazardPenaltyFactor: ndrsObj.hazardPenaltyFactor,
        hazardPenaltyPct: ndrsObj.hazardPenaltyPct,
        ndrs: ndrsObj.ndrs,
        derivatives,
        Ri: recovery
      };
    });

    // Determine rankings by Baseline Capacity Ci
    const sortedByBaseline = [...results].sort((a, b) => b.Ci - a.Ci);
    sortedByBaseline.forEach((item, index) => {
      const match = results.find(r => r.id === item.id);
      if (match) match.baselineRank = index + 1;
    });

    // Determine rankings by Hazard-Adjusted Score NDRS
    const sortedByNDRS = [...results].sort((a, b) => b.ndrs - a.ndrs);
    sortedByNDRS.forEach((item, index) => {
      const match = results.find(r => r.id === item.id);
      if (match) {
        match.ndrsRank = index + 1;
        match.rankDelta = match.baselineRank - match.ndrsRank; 
        // positive delta means improved in rank, negative means degraded
      }
    });

    return results;
  }

  /**
   * Central Limit Theorem Simulator (Page 2 of Report)
   * Generates population of urban district resilience sensor measurements
   * Samples repeatedly with sample size n, showing convergence of standardized sample mean Z ~ N(0, 1)
   */
  runCLTSimulation(sampleSize = 30, numTrials = 1000, populationType = "skewed") {
    // 1. Create a non-normal population
    const popSize = 10000;
    const population = [];

    for (let i = 0; i < popSize; i++) {
      let val;
      if (populationType === "skewed") {
        // Skewed log-normal or exponential to simulate disaster damages
        val = -Math.log(1 - Math.random() * 0.98) * 20; 
      } else if (populationType === "bimodal") {
        // Bimodal distribution (e.g. rich coastal strip vs poor vulnerable slums)
        val = Math.random() < 0.5 ? (30 + Math.random() * 20) : (75 + Math.random() * 20);
      } else {
        // Uniform distribution
        val = Math.random() * 100;
      }
      population.push(val);
    }

    // Population parameters
    const popMean = population.reduce((a, b) => a + b, 0) / popSize;
    const popVariance = population.reduce((a, b) => a + Math.pow(b - popMean, 2), 0) / popSize;
    const popStdDev = Math.sqrt(popVariance);
    const theoreticalSE = popStdDev / Math.sqrt(sampleSize);

    // 2. Perform repeated random sampling
    const sampleMeans = [];
    const zScores = [];

    for (let t = 0; t < numTrials; t++) {
      let sampleSum = 0;
      for (let s = 0; s < sampleSize; s++) {
        const randIndex = Math.floor(Math.random() * popSize);
        sampleSum += population[randIndex];
      }
      const xBar = sampleSum / sampleSize;
      sampleMeans.push(xBar);

      const z = (xBar - popMean) / theoreticalSE;
      zScores.push(z);
    }

    // Empirical sample mean stats
    const meanOfMeans = sampleMeans.reduce((a, b) => a + b, 0) / numTrials;
    const varianceOfMeans = sampleMeans.reduce((a, b) => a + Math.pow(b - meanOfMeans, 2), 0) / numTrials;
    const empiricalSE = Math.sqrt(varianceOfMeans);

    // Binning for standardized Z-scores (-3.5 to +3.5)
    const numBins = 24;
    const minZ = -3.5;
    const maxZ = 3.5;
    const binWidth = (maxZ - minZ) / numBins;
    const bins = new Array(numBins).fill(0);
    const binLabels = [];

    for (let b = 0; b < numBins; b++) {
      const center = minZ + (b + 0.5) * binWidth;
      binLabels.push(center.toFixed(2));
    }

    zScores.forEach(z => {
      if (z >= minZ && z <= maxZ) {
        const binIdx = Math.floor((z - minZ) / binWidth);
        if (binIdx >= 0 && binIdx < numBins) bins[binIdx]++;
      }
    });

    // Normalizing histogram to probability density
    const histogramDensity = bins.map(count => (count / numTrials) / binWidth);

    // Theoretical standard normal N(0, 1) curve points
    const theoreticalNormal = binLabels.map(zStr => {
      const z = parseFloat(zStr);
      return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
    });

    return {
      sampleSize,
      numTrials,
      popMean,
      popStdDev,
      theoreticalSE,
      empiricalSE,
      meanOfMeans,
      binLabels,
      histogramDensity,
      theoreticalNormal
    };
  }
}

// Export global instance
window.ResilienceModel = ResilienceModel;
