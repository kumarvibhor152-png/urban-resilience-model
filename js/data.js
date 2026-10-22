/**
 * Mathematical Framework for Urban Natural Disaster Resilience Score Analysis
 * Data definitions, Pillar definitions, Raw Indicators, and Illustrative City Profiles
 * Rashtriya Raksha University - School of Applied Science, Engineering and Technology
 * Authors: Ujjawal Kumar & Kumar Vibhor
 */

const RESILIENCE_DATA = {
  projectInfo: {
    title: "Mathematical Framework for Urban Natural Disaster Resilience Score Analysis",
    institution: "Rashtriya Raksha University",
    department: "School of Applied Science, Engineering and Technology",
    course: "Mathematics Project Report",
    date: "October 2026",
    authors: [
      {
        name: "Ujjawal Kumar",
        enrollment: "25014111058031040",
        program: "B.Tech Electronics Engineering",
        role: "Developing disaster recovery model, sensitivity analysis, comparing city profiles, and organizing the references and report."
      },
      {
        name: "Kumar Vibhor",
        enrollment: "25014111058031018",
        program: "B.Tech Electronics Engineering",
        role: "Developing the mathematical models, deriving the resilience score equations, and calculating and interpreting the results for different cities."
      }
    ]
  },

  // 4 Core Pillars as detailed in the report
  pillars: [
    {
      id: "infrastructure",
      code: "P1",
      name: "Infrastructure Robustness",
      description: "Physical asset durability, backup redundancies, flood protection, and transport network connectivity.",
      color: "#3b82f6", // Blue
      defaultWeight: 0.30
    },
    {
      id: "governance",
      code: "P2",
      name: "Governance & Institutional Readiness",
      description: "Early warning reach, disaster protocol compliance, response speed, and emergency budget reserves.",
      color: "#10b981", // Emerald
      defaultWeight: 0.25
    },
    {
      id: "economic",
      code: "P3",
      name: "Economic Capacity",
      description: "Municipal financial cushion, per capita resource availability, and commercial insurance penetration.",
      color: "#f59e0b", // Amber
      defaultWeight: 0.25
    },
    {
      id: "ecological",
      code: "P4",
      name: "Social-Ecological Buffers",
      description: "Wetland/mangrove retention, sponge capacity, community drill participation, and vulnerable population protection.",
      color: "#8b5cf6", // Purple
      defaultWeight: 0.20
    }
  ],

  // 12 Concrete Indicators across the 4 Pillars
  indicators: [
    // P1: Infrastructure
    {
      id: "p1_transport",
      pillarId: "infrastructure",
      name: "Transport Network Redundancy",
      unit: "% arterial alternative paths",
      isPositive: true,
      min: 30,
      max: 95,
      description: "Percentage of main transit routes with viable alternative bypasses during flooding or debris blockage."
    },
    {
      id: "p1_drainage",
      pillarId: "infrastructure",
      name: "Stormwater Drainage Capacity",
      unit: "mm/hr peak rain handling",
      isPositive: true,
      min: 20,
      max: 120,
      description: "Design capacity of primary urban stormwater culverts to evacuate peak precipitation."
    },
    {
      id: "p1_hospital_beds",
      pillarId: "infrastructure",
      name: "Critical Care Bed Density",
      unit: "beds per 1,000 residents",
      isPositive: true,
      min: 1.0,
      max: 6.5,
      description: "Number of ICU and emergency-equipped hospital beds per thousand population."
    },

    // P2: Governance
    {
      id: "p2_warning",
      pillarId: "governance",
      name: "Early Warning System Coverage",
      unit: "% population alert reach",
      isPositive: true,
      min: 40,
      max: 100,
      description: "Multi-channel broadcast alert reach within 15 minutes of hazard confirmation."
    },
    {
      id: "p2_response_time",
      pillarId: "governance",
      name: "Emergency First Response Time",
      unit: "minutes (Lower is better)",
      isPositive: false, // Negative indicator: lower time is better!
      min: 8,
      max: 45,
      description: "Average dispatch-to-arrival time of first responder search & rescue units."
    },
    {
      id: "p2_code_enforce",
      pillarId: "governance",
      name: "Building Code Compliance Rate",
      unit: "% audited structures",
      isPositive: true,
      min: 35,
      max: 98,
      description: "Audited structural adherence to modern seismic and wind load zoning bylaws."
    },

    // P3: Economic Capacity
    {
      id: "p3_reserve_fund",
      pillarId: "economic",
      name: "Contingency Disaster Reserve",
      unit: "% annual municipal budget",
      isPositive: true,
      min: 1.5,
      max: 12.0,
      description: "Dedicated liquid municipal funds immediately disbursable for disaster response."
    },
    {
      id: "p3_insurance",
      pillarId: "economic",
      name: "Catastrophe Insurance Penetration",
      unit: "% residential/commercial assets",
      isPositive: true,
      min: 10,
      max: 85,
      description: "Underwritten asset protection reducing long-term public reconstruction liability."
    },
    {
      id: "p3_econ_loss_ratio",
      pillarId: "economic",
      name: "Historical Annualized Loss Ratio",
      unit: "% gross municipal output (Lower is better)",
      isPositive: false, // Negative indicator: lower is better!
      min: 0.2,
      max: 5.0,
      description: "Average historical economic loss from disasters relative to gross city product."
    },

    // P4: Social-Ecological Buffers
    {
      id: "p4_sponge_cover",
      pillarId: "ecological",
      name: "Sponge Surface / Wetland Ratio",
      unit: "% total urban surface",
      isPositive: true,
      min: 5,
      max: 45,
      description: "Permeable pavements, urban forests, and retention waterbodies that naturally absorb floodwaters."
    },
    {
      id: "p4_drill_participation",
      pillarId: "ecological",
      name: "Community Drill Participation",
      unit: "% active households",
      isPositive: true,
      min: 10,
      max: 75,
      description: "Citizens trained in community first-aid, evacuation routes, and survival kits."
    },
    {
      id: "p4_vulnerability",
      pillarId: "ecological",
      name: "Vulnerable Settlement Index",
      unit: "% living in high-risk zones (Lower is better)",
      isPositive: false, // Negative indicator: lower is better!
      min: 4,
      max: 48,
      description: "Proportion of population inhabiting riverbanks, landslide-prone slopes, or low-lying flood channels."
    }
  ],

  // 5 Distinct Illustrative Cities
  cities: [
    {
      id: "metro_coastalia",
      name: "Metro Coastalia",
      tagline: "High-density Coastal Economic Engine",
      archetype: "Coastal Megacity",
      hazardType: "Tropical Cyclones, Tidal Storm Surges, Sea Level Rise",
      hazardIndex: 0.84, // High hazard exposure
      recoveryLoss0: 0.62, // L_0: 62% initial capacity loss during severe event
      recoveryRate: 0.12,  // k_r: moderate recovery rate
      color: "#06b6d4",
      description: "A prosperous maritime hub with world-class transit and strong tax base, but facing intense coastal hazard exposure and degraded mangrove buffer zones.",
      rawValues: {
        p1_transport: 88,
        p1_drainage: 65,
        p1_hospital_beds: 5.2,
        p2_warning: 92,
        p2_response_time: 14,
        p2_code_enforce: 75,
        p3_reserve_fund: 8.5,
        p3_insurance: 68,
        p3_econ_loss_ratio: 2.8,
        p4_sponge_cover: 12,
        p4_drill_participation: 38,
        p4_vulnerability: 32
      }
    },
    {
      id: "riverside_haven",
      name: "Riverside Haven",
      tagline: "Riverine Valley Regional Trade Center",
      archetype: "River Basin Metropolis",
      hazardType: "Monsoon River Floods, Siltation",
      hazardIndex: 0.45, // Moderate hazard
      recoveryLoss0: 0.40, // L_0: 40% initial capacity loss
      recoveryRate: 0.18,  // k_r: faster recovery
      color: "#3b82f6",
      description: "A well-governed river basin hub with expansive flood retention wetlands and active neighborhood rescue corps.",
      rawValues: {
        p1_transport: 68,
        p1_drainage: 78,
        p1_hospital_beds: 3.8,
        p2_warning: 86,
        p2_response_time: 12,
        p2_code_enforce: 82,
        p3_reserve_fund: 5.8,
        p3_insurance: 42,
        p3_econ_loss_ratio: 1.4,
        p4_sponge_cover: 34,
        p4_drill_participation: 62,
        p4_vulnerability: 16
      }
    },
    {
      id: "seismic_foothills",
      name: "Seismic Foothills",
      tagline: "Hilly Mountain Transit & Tourism Corridor",
      archetype: "Montane Valley Town",
      hazardType: "Major Earthquakes, Slope Landslides, Flash Mudflows",
      hazardIndex: 0.78, // High seismic hazard
      recoveryLoss0: 0.75, // L_0: 75% initial disruption
      recoveryRate: 0.07,  // k_r: slow recovery due to isolated terrain
      color: "#f43f5e",
      description: "Rugged terrain with single-access roads and older masonry buildings. High seismic exposure creates acute vulnerability despite dedicated local leadership.",
      rawValues: {
        p1_transport: 38,
        p1_drainage: 32,
        p1_hospital_beds: 2.1,
        p2_warning: 64,
        p2_response_time: 28,
        p2_code_enforce: 48,
        p3_reserve_fund: 3.2,
        p3_insurance: 18,
        p3_econ_loss_ratio: 4.2,
        p4_sponge_cover: 22,
        p4_drill_participation: 30,
        p4_vulnerability: 42
      }
    },
    {
      id: "indus_apex",
      name: "Indus Apex",
      tagline: "Inland High-Tech & Industrial Powerhouse",
      archetype: "Inland Plateau Hub",
      hazardType: "Moderate Heatwaves, Sporadic Urban Flash Storms",
      hazardIndex: 0.18, // Very low hazard exposure!
      recoveryLoss0: 0.28, // L_0: only 28% disruption
      recoveryRate: 0.24,  // k_r: very rapid recovery
      color: "#10b981",
      description: "Located on a stable geological plateau far from fault lines and coastal storms. High financial capital and robust infrastructure yield maximum resilience retention.",
      rawValues: {
        p1_transport: 84,
        p1_drainage: 92,
        p1_hospital_beds: 5.8,
        p2_warning: 88,
        p2_response_time: 11,
        p2_code_enforce: 89,
        p3_reserve_fund: 9.8,
        p3_insurance: 76,
        p3_econ_loss_ratio: 0.6,
        p4_sponge_cover: 26,
        p4_drill_participation: 52,
        p4_vulnerability: 9
      }
    },
    {
      id: "verdant_valley",
      name: "Verdant Valley",
      tagline: "Eco-Planned Sponge City & Green Pioneer",
      archetype: "Ecological Model City",
      hazardType: "Localized Cloudbursts, Forest Fire Proximity",
      hazardIndex: 0.35, // Low-moderate hazard
      recoveryLoss0: 0.32, // L_0: 32% initial loss
      recoveryRate: 0.28,  // k_r: extremely quick recovery due to natural drainage
      color: "#8b5cf6",
      description: "Pioneering sponge-city with master-planned wetland parks, 94% seismic code compliance, and integrated community disaster volunteers.",
      rawValues: {
        p1_transport: 76,
        p1_drainage: 108,
        p1_hospital_beds: 4.6,
        p2_warning: 96,
        p2_response_time: 9,
        p2_code_enforce: 95,
        p3_reserve_fund: 7.2,
        p3_insurance: 62,
        p3_econ_loss_ratio: 0.8,
        p4_sponge_cover: 42,
        p4_drill_participation: 71,
        p4_vulnerability: 6
      }
    }
  ],

  // Model parameters and default presets
  defaults: {
    gamma: 0.85,          // Hazard sensitivity parameter γ
    recoveryTimeSpan: 30,  // Recovery evaluation period T (e.g. days/weeks)
    t0: 0                 // Initial disaster impact time
  },

  // Strategic weight presets
  weightPresets: {
    balanced: {
      name: "Balanced Pillars",
      description: "Equalized weighting across all 4 urban dimensions.",
      weights: { infrastructure: 0.25, governance: 0.25, economic: 0.25, ecological: 0.25 }
    },
    engineering: {
      name: "Infrastructure-First",
      description: "Heavy focus on hard structural defenses, drainage, and transport assets.",
      weights: { infrastructure: 0.45, governance: 0.20, economic: 0.20, ecological: 0.15 }
    },
    governance: {
      name: "Institutional & Preparedness",
      description: "Emphasizes early warnings, rapid dispatch, and strict building compliance.",
      weights: { infrastructure: 0.20, governance: 0.45, economic: 0.15, ecological: 0.20 }
    },
    ecological: {
      name: "Nature-Based & Sponge Cities",
      description: "Prioritizes wetlands, community training, and vulnerable zone reduction.",
      weights: { infrastructure: 0.20, governance: 0.20, economic: 0.15, ecological: 0.45 }
    }
  }
};
