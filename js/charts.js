/**
 * Chart.js Visualization Engine
 * Customized for Dark Modern Aesthetics with Glassmorphic Palettes
 * Authors: Ujjawal Kumar & Kumar Vibhor
 */

class ResilienceCharts {
  constructor() {
    this.instances = {};
    this.theme = {
      text: "#94a3b8",
      grid: "rgba(148, 163, 184, 0.08)",
      tooltipBg: "rgba(15, 23, 42, 0.95)",
      tooltipBorder: "rgba(99, 102, 241, 0.3)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    };
  }

  destroyChart(id) {
    if (this.instances[id]) {
      this.instances[id].destroy();
      delete this.instances[id];
    }
  }

  /**
   * 1. Pillar Radar Chart
   */
  renderRadarChart(canvasId, citiesData, selectedCityIds = null) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const filteredCities = selectedCityIds
      ? citiesData.filter(c => selectedCityIds.includes(c.id))
      : citiesData;

    const labels = [
      "P1: Infrastructure",
      "P2: Governance",
      "P3: Economic Capacity",
      "P4: Social-Ecological"
    ];

    const datasets = filteredCities.map((city, idx) => {
      const p = city.pillars;
      const dataPoints = [
        p.infrastructure !== undefined ? +(p.infrastructure * 100).toFixed(1) : 0,
        p.governance !== undefined ? +(p.governance * 100).toFixed(1) : 0,
        p.economic !== undefined ? +(p.economic * 100).toFixed(1) : 0,
        p.ecological !== undefined ? +(p.ecological * 100).toFixed(1) : 0
      ];

      return {
        label: city.name,
        data: dataPoints,
        borderColor: city.color,
        backgroundColor: city.color + "25", // 15% opacity fill
        pointBackgroundColor: city.color,
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: city.color,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2
      };
    });

    this.instances[canvasId] = new Chart(canvas, {
      type: "radar",
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: this.theme.text, font: { family: this.theme.fontFamily, size: 12 } }
          },
          tooltip: {
            backgroundColor: this.theme.tooltipBg,
            borderColor: this.theme.tooltipBorder,
            borderWidth: 1,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}% Capacity`
            }
          }
        },
        scales: {
          r: {
            angleLines: { color: this.theme.grid },
            grid: { color: this.theme.grid },
            pointLabels: {
              color: "#cbd5e1",
              font: { family: this.theme.fontFamily, size: 11, weight: "600" }
            },
            ticks: {
              color: this.theme.text,
              backdropColor: "transparent",
              min: 0,
              max: 100,
              stepSize: 20,
              callback: val => val + "%"
            }
          }
        }
      }
    });
  }

  /**
   * 2. Baseline vs Hazard-Adjusted NDRS Comparison Chart
   */
  renderComparisonChart(canvasId, citiesData) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const labels = citiesData.map(c => c.name);
    const baselineData = citiesData.map(c => +(c.Ci * 100).toFixed(1));
    const ndrsData = citiesData.map(c => +(c.ndrs * 100).toFixed(1));
    const hazardData = citiesData.map(c => +(c.Hi * 100).toFixed(1));

    this.instances[canvasId] = new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Baseline Capacity (Ci)",
            data: baselineData,
            backgroundColor: "rgba(59, 130, 246, 0.7)",
            borderColor: "#3b82f6",
            borderWidth: 1.5,
            borderRadius: 6
          },
          {
            label: "Hazard-Adjusted NDRS (Ci × e^(-γH))",
            data: ndrsData,
            backgroundColor: "rgba(16, 185, 129, 0.75)",
            borderColor: "#10b981",
            borderWidth: 1.5,
            borderRadius: 6
          },
          {
            type: "line",
            label: "Hazard Exposure Index (Hi %)",
            data: hazardData,
            borderColor: "#f43f5e",
            backgroundColor: "#f43f5e",
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 5,
            pointBackgroundColor: "#f43f5e",
            yAxisID: "y"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: { color: this.theme.text, font: { family: this.theme.fontFamily, size: 12 } }
          },
          tooltip: {
            backgroundColor: this.theme.tooltipBg,
            borderColor: this.theme.tooltipBorder,
            borderWidth: 1,
            callbacks: {
              afterBody: (items) => {
                const idx = items[0].dataIndex;
                const city = citiesData[idx];
                const penalty = (100 - (city.ndrs / city.Ci) * 100).toFixed(1);
                return `\nHazard Penalty: -${penalty}%\nHazard Factor e^(-γH): ${city.hazardPenaltyFactor.toFixed(3)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#e2e8f0", font: { family: this.theme.fontFamily, size: 12, weight: "500" } }
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: this.theme.grid },
            ticks: {
              color: this.theme.text,
              callback: val => val + "%"
            },
            title: {
              display: true,
              text: "Resilience Score (%)",
              color: this.theme.text
            }
          }
        }
      }
    });
  }

  /**
   * 3. Recovery Dynamics Time Trajectory Chart Q(t) & Integral R(T)
   */
  renderRecoveryChart(canvasId, recoveryResults, activeCityId = null, showAll = false) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const datasets = [];
    const timeLabels = recoveryResults[0].points.map(pt => `t=${pt.t.toFixed(0)}d`);

    recoveryResults.forEach(res => {
      const isSelected = activeCityId ? res.cityId === activeCityId : false;
      const cityColor = res.color || "#06b6d4";

      // If single focused city, give it gradient fill representing integral area
      if (isSelected || (!showAll && res.cityId === recoveryResults[0].cityId)) {
        datasets.push({
          label: `${res.cityName} : Q(t)`,
          data: res.points.map(p => +(p.Qt * 100).toFixed(1)),
          borderColor: cityColor,
          backgroundColor: cityColor + "20",
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 6
        });
      } else if (showAll) {
        datasets.push({
          label: `${res.cityName}`,
          data: res.points.map(p => +(p.Qt * 100).toFixed(1)),
          borderColor: cityColor,
          backgroundColor: "transparent",
          fill: false,
          tension: 0.35,
          borderWidth: isSelected ? 3.5 : 1.8,
          borderDash: isSelected ? [] : [4, 4],
          pointRadius: 0,
          pointHoverRadius: 5
        });
      }
    });

    // 90% benchmark threshold line
    const threshold90 = new Array(timeLabels.length).fill(90);
    datasets.push({
      label: "90% Functional Recovery Threshold",
      data: threshold90,
      borderColor: "rgba(245, 158, 11, 0.7)",
      borderWidth: 1.5,
      borderDash: [6, 4],
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 0
    });

    this.instances[canvasId] = new Chart(canvas, {
      type: "line",
      data: { labels: timeLabels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "top",
            labels: { color: this.theme.text, font: { family: this.theme.fontFamily, size: 12 } }
          },
          tooltip: {
            backgroundColor: this.theme.tooltipBg,
            borderColor: this.theme.tooltipBorder,
            borderWidth: 1,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}% Capacity`
            }
          }
        },
        scales: {
          x: {
            grid: { color: this.theme.grid },
            ticks: {
              color: this.theme.text,
              maxTicksLimit: 12
            },
            title: { display: true, text: "Time Elapsed (Days post-impact)", color: this.theme.text }
          },
          y: {
            min: 0,
            max: 105,
            grid: { color: this.theme.grid },
            ticks: {
              color: this.theme.text,
              callback: val => val + "%"
            },
            title: { display: true, text: "Restored Functional Capacity Q(t)", color: this.theme.text }
          }
        }
      }
    });
  }

  /**
   * 4. Sensitivity Investment Tornado Chart (Delta NDRS gain)
   */
  renderSensitivityChart(canvasId, sensitivityData) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const labels = sensitivityData.map(d => `${d.code}: ${d.pillarName}`);
    const gains = sensitivityData.map(d => +(d.deltaNDRS * 100).toFixed(2));
    const colors = sensitivityData.map(d => d.color);

    this.instances[canvasId] = new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Δ NDRS Resilience Gain (+15% Pillar Boost)",
          data: gains,
          backgroundColor: colors.map(c => c + "cc"),
          borderColor: colors,
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: this.theme.tooltipBg,
            borderColor: this.theme.tooltipBorder,
            borderWidth: 1,
            callbacks: {
              label: ctx => ` +${ctx.raw} points gain (NDRS boost)`
            }
          }
        },
        scales: {
          x: {
            grid: { color: this.theme.grid },
            ticks: { color: this.theme.text, callback: val => "+" + val },
            title: { display: true, text: "Absolute NDRS Score Increase (points)", color: this.theme.text }
          },
          y: {
            grid: { display: false },
            ticks: { color: "#e2e8f0", font: { family: this.theme.fontFamily, size: 12, weight: "500" } }
          }
        }
      }
    });
  }

  /**
   * 5. Central Limit Theorem Gaussian Bell Curve & Standardized Histogram
   */
  renderCLTChart(canvasId, cltData) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    this.instances[canvasId] = new Chart(canvas, {
      type: "bar",
      data: {
        labels: cltData.binLabels,
        datasets: [
          {
            type: "bar",
            label: `Empirical Z-score Density (n=${cltData.sampleSize}, N_trials=${cltData.numTrials})`,
            data: cltData.histogramDensity,
            backgroundColor: "rgba(99, 102, 241, 0.45)",
            borderColor: "#6366f1",
            borderWidth: 1,
            borderRadius: 3,
            barPercentage: 1.0,
            categoryPercentage: 1.0
          },
          {
            type: "line",
            label: "Theoretical Normal Curve N(0, 1)",
            data: cltData.theoreticalNormal,
            borderColor: "#10b981",
            borderWidth: 2.5,
            fill: false,
            tension: 0.4,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: { color: this.theme.text, font: { family: this.theme.fontFamily, size: 12 } }
          },
          tooltip: {
            backgroundColor: this.theme.tooltipBg,
            borderColor: this.theme.tooltipBorder,
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: { color: this.theme.grid },
            ticks: { color: this.theme.text, maxTicksLimit: 14 },
            title: { display: true, text: "Standardized Sample Mean Z = (X̄ - μ) / (σ / √n)", color: this.theme.text }
          },
          y: {
            grid: { color: this.theme.grid },
            ticks: { color: this.theme.text },
            title: { display: true, text: "Probability Density f(Z)", color: this.theme.text }
          }
        }
      }
    });
  }
}

window.ResilienceCharts = ResilienceCharts;
