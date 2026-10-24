# ApexAI — Go-Kart Telemetry & Performance Analysis

A responsive, static educational website built with HTML, CSS, and vanilla JavaScript.

## Run locally

1. Extract the complete ZIP folder.
2. Keep `index.html`, `styles.css`, `app.js`, and the `assets/` and `data/` folders together.
3. Open `index.html` in a modern browser. No build step or framework is required.

The remote Google Fonts and OpenF1 links require an internet connection; the core layout and local CSV downloads work offline.

## What's in this version

- New photographic go-kart hero with a subtle camera-pan animation and the caption “Helping racers to improve.”
- Removed the inaccurate schematic circuit and fake reference-lap chart from the hero. Reference/current lap concepts remain only in the explicitly labelled illustrative analysis graphs below.
- Streamlined the standalone ML, roadmap and long-reference sections into a focused evidence-and-validation section. The first ML target, feature timing, baseline comparison, held-out-session testing, and MAE are still explained compactly.
- CSV kit includes a blank phone-GPS template, a synthetic demo file, and a link to public real F1 telemetry through OpenF1.
- Responsive layouts and reduced-motion support.

## Data honesty

No real go-kart session was supplied for this update. `data/synthetic_kart_demo.csv` is clearly labelled synthetic and uses invented coordinates for a schematic loop. It is suitable for testing CSV handling but must not be presented as real collected evidence. The OpenF1 CSV link returns real Formula 1 telemetry, not go-kart data. Replace demos with the team’s smartphone GPS recording before making performance or ML accuracy claims.

## CSV schema

The template uses `timestamp, latitude, longitude, speed_kmh, accuracy_m, altitude_m`. Different logger exports may use different names and units; normalize column names and speed units before analysing. Lap and segment labels are normally derived later by the processing pipeline.

## Safety and limitations

Secure the phone/logger before driving. Do not operate the phone while moving. Standard smartphone GPS is noisy, especially on short corners; report the quality limits and compare repeated, like-for-like sessions. GPS alone cannot reveal throttle, brake pressure, steering angle, or tyre temperatures.
