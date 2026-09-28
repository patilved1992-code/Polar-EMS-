# POLAR-EMS: AI-Driven Smart Energy Management System for Polar Research Stations

[![Smart India Hackathon 2024](https://img.shields.io/badge/SIH-2024%20Prototype-06b6d4?style=for-the-badge)](https://sih.gov.in/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React%2019-TypeScript-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20v4-Vite-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-ML%20Forecasting-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)

> **Industrial-grade AI microgrid optimization and autonomous telemetry platform for isolated Antarctic scientific outposts (Bharati & Maitri Stations).** Built for the Smart India Hackathon problem: *"AI-Driven Smart Energy Management System for Polar Research Stations"*.

---

## ❄️ 1. Executive Summary & Problem Context

Polar research stations in Antarctica operate in the most hostile environment on Earth:
- Extreme sub-zero temperatures (down to **-45°C** at Maitri and **-35°C** at Bharati).
- Katabatic winds exceeding **120 km/h** and sudden zero-visibility whiteouts.
- Complete isolation with supply windows restricted to a brief 2-month summer window via icebreakers.
- High cost and carbon footprint of Arctic-grade light diesel delivery (**$1.45/L** delivered, **2.68 kg CO2/L**).

**POLAR-EMS** eliminates reliance on continuous diesel generation by integrating:
1. **Multi-Horizon ML Forecasting**: Predicts renewable generation and thermal load demand with 95% confidence intervals.
2. **Constrained Dispatch Optimization**: Dispatches energy in strict merit order (**Solar &rarr; Wind &rarr; Battery &rarr; Diesel**) while enforcing a **$\ge$30% BESS state-of-charge safety reserve**.
3. **Autonomous Polar Survival Mode**: Instantly sheds non-critical deferrable circuits (rover chargers, auxiliary sauna, snowmelt boilers) to guarantee uncompromised life-support and emergency satellite communications during blizzard whiteouts.
4. **Explainable AI Recommendations**: Delivers human-readable, auditable guidance (WHAT, WHY, CONFIDENCE, FUEL SAVED, CO2 REDUCED, RISK LEVEL).
5. **Contextual AI Energy Copilot**: An offline domain reasoning agent equipped with live microgrid telemetry, weather feeds, and equipment anomaly vectors.

---

## ⚡ 2. The Core Closed-Loop Architecture

POLAR-EMS functions as a closed-loop cyber-physical energy operating system:

```
[SENSE] ----> Real-Time Telemetry & Weather Ingestion (Modbus/SCADA Simulation)
   |
[PREDICT] --> Multi-Horizon ML Forecaster (RandomForest / Gradient Boosting + 95% CI)
   |
[OPTIMIZE] -> Constrained Merit Dispatch Engine (Solar -> Wind -> BESS -> Diesel)
   |
[RECOMMEND] > Explainable Advisory Engine (Action + Evidence + Fuel Saved + Risk)
   |
[SIMULATE] -> What-If Parametric Engine (Renewable capacity, climate shifts, load spikes)
   |
[LEARN] ----> Isolation Forest Anomaly Detection (Injector wear, BESS degradation)
```

---

## 🚀 3. Quick Start Guide (Run in 2 Minutes)

Both the backend and frontend are pre-configured and can run locally or via Docker.

### Option A: Local Development

#### 1. Start the Backend (FastAPI + ML Engine)
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

#### 2. Start the Frontend (React 19 + Vite + Tailwind v4)
```bash
cd frontend
npm install
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Option B: Docker Compose (Turnkey Deployment)

```bash
docker-compose up --build
```
- Frontend UI: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## 🎯 4. Smart India Hackathon (SIH) 9-Phase Judge Demo Script

Follow this script during hackathon evaluations to showcase the end-to-end capabilities:

| Step | Action | What to Point Out to the Judges |
|---|---|---|
| **1. Command Center** | Navigate to `Command Center` (`/dashboard`). | Point out the **8 Primary KPIs** (Total Load, Solar, Wind, BESS SOC, Diesel Fuel Rate, Renewable %, CO2 Rate, Grid Health). Show the animated **Energy Bus Visualizer** displaying live power flows. Note the **Antarctic Surface Weather** panel with wind chill calculation. |
| **2. Live Scenarios** | Click the **Low Wind** preset pill in the top bar. | Observe the wind generation drop, generator G1 automatically compensating, fuel burn rate increasing, and the renewable fraction adjusting in real time. |
| **3. AI Forecast** | Navigate to `AI Forecast` (`/forecast`). Switch horizons (`15m`, `1h`, `6h`, `24h`, `7d`). | Explain the **95% Confidence Bands** generated by our scikit-learn regressor, accounting for polar cloud cover and katabatic wind fluctuations. |
| **4. Dispatch Optimization** | Navigate to `Energy Optimization` (`/optimization`). Click **Run MILP Dispatch Optimization**. | Highlight the 24-hour dispatch schedule. Point to the **Explainable Recommendation Cards** detailing exact actions, confidence percentage, liters of diesel saved, and CO2 reduction. |
| **5. Polar Survival Mode** | Click the **Arctic Storm** preset trigger in the top bar. | Point out the flashing **Polar Survival Mode Banner** (Alert Level 1). Explain how Tier 3 & Tier 4 circuits are automatically shed to protect the 30% BESS reserve and keep habitat life support online. |
| **6. Digital Twin** | Navigate to `Digital Twin` (`/digital-twin`). Click on **Generator G2 (Peaker)**. | Show the microgrid topology. The modal reveals injector pressure anomalies, thermal efficiency degradation, and recommended maintenance actions. |
| **7. Equipment Health** | Navigate to `Equipment Health` (`/equipment`). | Review the **Isolation Forest** health scores and active alerts. Click "Acknowledge" on an alert to show live state mutation. |
| **8. AI Energy Copilot** | Navigate to `AI Energy Copilot` (`/copilot`). Click *"Why is diesel consumption higher than normal right now?"* | Show that the Copilot cites real database evidence (`EnergyReadings DB`, `Polar Dispatch Rulebook v4.2`) and provides contextual recommendations without external API dependencies. |
| **9. What-If Simulator** | Navigate to `What-If Simulator` (`/simulator`). Drag **Wind Capacity to 150 kW** and **Battery to 750 kWh**, then click **Run Simulation**. | Showcase the side-by-side **Baseline vs Simulated** performance matrix showing annual diesel liters saved, payback period, and avoided CO2 tons. |

---

## 🏛️ 5. Station Profile Benchmark

POLAR-EMS supports multiple polar station microgrid configurations:

| Station | Location | Coordinates | Solar PV | Wind Farm | BESS Storage | Diesel Gensets | Climatic Profile |
|---|---|---|---|---|---|---|---|
| **Bharati Station** | Larsemann Hills | 69°24′S, 76°11′E | 100 kWp | 60 kW | 500 kWh | 2x 150 kW | Coastal polar; intense katabatic gusts; maritime humidity |
| **Maitri Station** | Schirmacher Oasis | 70°46′S, 11°43′E | 60 kWp | 40 kW | 350 kWh | 2x 125 kW | Continental inland oasis; extreme deep freeze down to -45°C |

---

## 📊 6. Four-Tier Load Shedding Protocol

In polar environments, an unmanaged power outage is fatal. POLAR-EMS implements an automated 4-tier load protection matrix:

1. **Tier 1 - Critical Life Support (Cannot Shed)**: Habitat HVAC (+18°C loop), Medical Bay oxygen concentrators, Satellite communications, Emergency core lighting.
2. **Tier 2 - Scientific Operations (Shed at SOC < 40%)**: Atmospheric LIDAR, Ice core drilling rig, HPC compute server cluster, Geomagnetic sensors.
3. **Tier 3 - Auxiliary Infrastructure (Shed at SOC < 50%)**: Snow meltwater processing boiler, Greywater treatment plant, Maintenance workshop CNC tools.
4. **Tier 4 - Non-Essential & Deferrable (Shed at SOC < 65%)**: Electric tracked rover superchargers, Crew wellness sauna, Snowmobile engine block heaters.

---

## 🛠️ 7. Backend API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health, version, and edge deployment status |
| `GET` | `/api/telemetry/current` | Real-time 8-KPI station telemetry with micro-fluctuations |
| `GET` | `/api/telemetry/history` | Historical telemetry series with 24h/7d/30d aggregation |
| `GET` | `/api/weather/current` | Antarctic surface meteorology (temperature, wind, solar irradiance, wind chill) |
| `GET` | `/api/battery/current` | BESS state-of-charge, health, autonomy hours, reserve compliance |
| `GET` | `/api/forecast/{metric}` | Multi-horizon forecasts (load, solar, wind, renewable) with 95% CI |
| `POST`| `/api/optimization/run` | Executes constrained dispatch optimization algorithm |
| `GET` | `/api/optimization/latest`| Fetches the latest 24h dispatch schedule and recommendations |
| `POST`| `/api/scenario/run` | Injects preset emergency and meteorological scenarios |
| `POST`| `/api/scenario/whatif` | Executes parametric what-if microgrid capacity simulation |
| `POST`| `/api/copilot/chat` | AI Energy Copilot conversational reasoning engine |
| `GET` | `/api/equipment/health` | Equipment predictive maintenance scores and anomaly probabilities |
| `GET` | `/api/alerts` | Active microgrid alert queue |
| `POST`| `/api/alerts/{id}/acknowledge` | Acknowledges an active alert |
| `GET` | `/api/reports/{type}` | Generates daily or weekly certified energy audit briefings |

---

## 🔒 8. Invariant Polar Engineering Constraints

1. **BESS Reserve Invariant**: The Battery Energy Storage System is mathematically prohibited from discharging below **30% SOC** under normal or standard-contingency operations.
2. **Cold-Soak Engine Guard**: Any diesel generator exposed to ambient temperatures below **-35°C** requires a minimum 15-minute coolant and oil heater cycle prior to mechanical cranking to prevent engine block cracking.
3. **Turbine Cut-Out Velocity**: Wind turbines automatically feather their blades and engage disk brakes when continuous wind speeds exceed **25 m/s (90 km/h)** to prevent structural mechanical failure.
4. **Albedo Radiation Amplification**: Solar PV algorithms account for 85% surface snow albedo reflection during the 24-hour polar summer day.

---

## 👥 9. Authors & Team

Developed for the **Smart India Hackathon (SIH)** — Problem Statement: *AI-Driven Smart Energy Management System for Polar Research Stations*.
National Centre for Polar and Ocean Research (NCPOR) deployment target.
