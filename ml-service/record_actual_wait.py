import csv
import subprocess
from pathlib import Path

log_file = Path("ml-service/data/prediction_log.csv")
out_file = Path("ml-service/data/wait_observations.csv")

try:
    result = subprocess.run(
        ["docker", "compose", "exec", "-T", "ml-service",
         "cat", "/app/data/prediction_log.csv"],
        capture_output=True, text=True, check=True
    )
    rows = list(csv.DictReader(result.stdout.splitlines()))
except Exception as exc:
    print("Could not read Docker prediction log:", exc)
    raise SystemExit(1)

if not rows:
    print("No predictions logged yet.")
    raise SystemExit(1)

print("Latest prediction:")
print("Location:", rows[-1]["locationId"])
print("Predicted wait:", rows[-1]["predictedWaitMinutes"], "minutes")
print("Before continuing, confirm this is a REAL queue prediction.")
confirm = input("Do you have its stopwatch-measured actual wait? (yes/no): ").strip().lower()

if confirm != "yes":
    print("No data saved. Measure a real wait first.")
    raise SystemExit(0)

try:
    actual = float(input("Enter actual wait in minutes: "))
    if actual < 0:
        raise ValueError
except ValueError:
    print("Enter a valid non-negative number.")
    raise SystemExit(1)

row = rows[-1]
fields = [
    "locationId", "peopleAhead", "serviceRatePerHour",
    "minutesOpen", "dayOfWeek", "hour", "appointments",
    "actualWaitMinutes"
]

out_file.parent.mkdir(parents=True, exist_ok=True)
with out_file.open("a", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(file, fieldnames=fields)
    if file.tell() == 0:
        writer.writeheader()
    writer.writerow({
        **{key: row[key] for key in fields if key != "actualWaitMinutes"},
        "actualWaitMinutes": actual
    })

print("Saved one measured observation to", out_file)
