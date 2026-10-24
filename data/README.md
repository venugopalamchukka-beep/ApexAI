# ApexAI CSV data kit

- `kart_gps_template.csv`: empty starter header for smartphone GPS logs. Map your logger’s timestamp, latitude, longitude, speed (km/h), accuracy (m), and altitude (m) to these fields. Keep the raw original file too.
- `synthetic_kart_demo.csv`: synthetic three-lap demo for testing import/cleaning/plotting. Every row is labelled `SYNTHETIC_NOT_REAL_KART_DATA`; the coordinates represent an invented schematic loop, not a real circuit or recorded vehicle.
- Real F1 reference CSV: open the OpenF1 endpoint linked on the site to retrieve public historical Formula 1 car telemetry (`session_key=9159`, `driver_number=55`). It is useful for data-pipeline practice only and is not go-kart data.

No real kart CSV was supplied when this website was updated. A genuine kart dataset must be recorded from your logger on the real track. Never relabel the synthetic demo as real data.
