# Urban Natural Disaster Resilience Score (NDRS) Analytical Platform

An interactive scientific demonstration web application built for the **Mathematics Project Report**:  
**"Mathematical Framework for Urban Natural Disaster Resilience Score Analysis"**  
*School of Applied Science, Engineering and Technology, Rashtriya Raksha University (October 2026)*

### Project Authors
- **Ujjawal Kumar** (Enrollment: `25014111058031040`, B.Tech Electronics Engineering)
- **Kumar Vibhor** (Enrollment: `25014111058031018`, B.Tech Electronics Engineering)

---

## 🚀 Quick Launch

The application is fully self-contained using modern vanilla web technologies (HTML5, CSS3, JavaScript ES6+) and CDN libraries for KaTeX and Chart.js.

To launch the local web server:

```powershell
# From the project directory:
python -m http.server 8080
```

Then open your browser to:
👉 **[http://localhost:8080](http://localhost:8080)**

---

## 📐 Mathematical Demonstrations Included

The web application faithfully implements and brings to life every equation from the report:

### 1. Min–Max Indicator Normalization
- **Positive Indicators** (higher is better, e.g. Drainage capacity, hospital beds, warning coverage):
  $$z_{ij} = \frac{x_{ij} - x_j^{\min}}{x_j^{\max} - x_j^{\min}}$$
- **Negative Indicators** (lower is better, e.g. Emergency response dispatch time, economic loss ratio, vulnerable settlements):
  $$z_{ij} = \frac{x_j^{\max} - x_{ij}}{x_j^{\max} - x_j^{\min}}$$
- Editable in real-time in the **"Indicator Matrix & Normalizer"** tab.

### 2. Multi-Pillar Baseline Resilience Capacity ($C_i$)
Aggregates 4 urban dimensions:
- $P_1$: Infrastructure Robustness
- $P_2$: Governance & Institutional Readiness
- $P_3$: Economic Capacity
- $P_4$: Social-Ecological Buffers
$$C_i = \sum_{j=1}^m w_j z_{ij} = \sum_{k=1}^4 w_k P_k, \quad \sum w_k = 1, \quad C_i \in [0, 1]$$
Features interactive sliders, strategic presets (Balanced, Infrastructure-First, Governance-Centric, Nature-Based), and auto-normalization.

### 3. Hazard Penalty & Disaster Resilience Score ($NDRS_i$)
$$NDRS_i = C_i \cdot e^{-\gamma H_i}$$
- **Rank Inversion Demonstration**: Shows how cities with superior baseline capacity (e.g. *Metro Coastalia*, $C_i = 0.76$) can drop in rank below cities with moderate capacity but low hazard exposure (e.g. *Riverside Haven* or *Indus Apex*).
- Live calculation of partial derivatives:
  $$\frac{\partial NDRS_i}{\partial H_i} = -\gamma C_i e^{-\gamma H_i} < 0$$
  $$\frac{\partial NDRS_i}{\partial C_i} = e^{-\gamma H_i} > 0$$
  $$\frac{\partial NDRS_i}{\partial \gamma} = -H_i C_i e^{-\gamma H_i} \le 0$$

### 4. Dynamic Disaster Recovery Trajectory & Definite Integral
- Time-dependent functional recovery curve:
  $$Q_i(t) = 1 - L_{0,i} e^{-k_{r,i}(t - t_0)}, \quad t \ge t_0$$
- Concavity and diminishing return proof:
  $$\frac{d^2 Q_i}{dt^2} = -k_{r,i}^2 L_{0,i} e^{-k_{r,i}(t - t_0)} < 0$$
- Mean restored capacity over period $T$ (Definite Integral):
  $$R_i(T) = \frac{1}{T} \int_{t_0}^{t_0+T} Q_i(t) dt = 1 - \frac{L_{0,i}}{k_{r,i} T} \left(1 - e^{-k_{r,i} T}\right)$$
- Interactive sliders for initial loss fraction $L_0$, recovery rate parameter $k_r$, and evaluation time horizon $T$.

### 5. Sensitivity Analysis & Municipal Investment Studio
$$\Delta NDRS_i = NDRS_i^{\text{new}} - NDRS_i^{\text{original}}$$
- Tornado chart comparing marginal returns of investments across the 4 pillars.
- Interactive $100M budget allocation playground to determine the highest resilience ROI.

### 6. Central Limit Theorem (CLT) Statistical Sampling Lab
- Interactive proof of Page 2 of the project report:
  $$\bar{X} = \frac{1}{n} \sum_{i=1}^n X_i, \quad Z = \frac{\bar{X} - \mu}{\sigma / \sqrt{n}} \xrightarrow{d} N(0, 1)$$
- Demonstrates how sampling across municipal wards converges to the standard Gaussian normal distribution even from heavily skewed disaster loss populations.

---

## 🎨 Technology & Architecture
- **Structure**: Semantic HTML5 with accessible tabs, tables, and modal dialogs.
- **Styling**: Vanilla CSS3 with custom design tokens, dark glassmorphism, responsive grids, and subtle luminous glowing accents.
- **Math Typesetting**: KaTeX for formula rendering.
- **Visualizations**: Chart.js for radar charts, grouped comparative bars, dynamic recovery trajectory curves, tornado sensitivity plots, and CLT probability density curves.
- **Export**: Built-in JSON export and clean print formatting for academic reporting.
