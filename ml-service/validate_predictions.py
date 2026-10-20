import csv
import math
import sys
from pathlib import Path

from app import PredictRequest, predict_wait


def main():
    if len(sys.argv) != 2:
        print(
            "Usage: python validate_predictions.py "
            "data/wait_observations.csv"
        )
        raise SystemExit(1)

    csv_path = Path(sys.argv[1])

    if not csv_path.is_file():
        print(f"Dataset not found: {csv_path}")
        raise SystemExit(1)

    errors = []
    absolute_percentage_errors = []
    within_15_minutes = 0
    count = 0

    required = {
        "locationId",
        "peopleAhead",
        "serviceRatePerHour",
        "minutesOpen",
        "dayOfWeek",
        "hour",
        "appointments",
        "actualWaitMinutes",
    }

    with csv_path.open(newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)

        if not required.issubset(set(reader.fieldnames or [])):
            missing = sorted(required - set(reader.fieldnames or []))
            print("Missing CSV columns:", ", ".join(missing))
            raise SystemExit(1)

        for row_number, row in enumerate(reader, start=2):
            try:
                actual = float(row["actualWaitMinutes"])

                if not math.isfinite(actual) or actual < 0:
                    raise ValueError("Actual wait must be finite and nonnegative")

                request = PredictRequest(
                    locationId=row["locationId"],
                    peopleAhead=int(row["peopleAhead"]),
                    serviceRatePerHour=float(row["serviceRatePerHour"]),
                    minutesOpen=int(row["minutesOpen"]),
                    dayOfWeek=int(row["dayOfWeek"]),
                    hour=int(row["hour"]),
                    appointments=int(row["appointments"]),
                )

                predicted = float(predict_wait(request).waitMinutes)
                error = predicted - actual

                if not math.isfinite(predicted):
                    raise ValueError("Prediction is not finite")

                errors.append(error)
                count += 1

                if abs(error) <= 15:
                    within_15_minutes += 1

                if actual > 0:
                    absolute_percentage_errors.append(
                        abs(error) / actual * 100
                    )

            except (ValueError, TypeError, KeyError) as exc:
                print(f"Invalid row {row_number}: {exc}")
                raise SystemExit(1)

    if count == 0:
        print("No observations found.")
        raise SystemExit(1)

    mae = sum(abs(error) for error in errors) / count
    rmse = math.sqrt(sum(error ** 2 for error in errors) / count)
    tolerance_rate = within_15_minutes / count * 100

    print("\nWaitless AI validation results")
    print("------------------------------")
    print(f"Observations: {count}")
    print(f"MAE: {mae:.2f} minutes")
    print(f"RMSE: {rmse:.2f} minutes")
    print(f"Within 15 minutes: {tolerance_rate:.2f}%")

    if absolute_percentage_errors:
        mape = sum(absolute_percentage_errors) / len(
            absolute_percentage_errors
        )
        print(f"MAPE: {mape:.2f}%")
        print(
            "MAPE excludes observations where actual wait is zero."
        )
    else:
        print("MAPE: unavailable (all actual waits are zero).")

    print(
        "\nThese metrics measure this dataset only; "
        "they do not guarantee future accuracy."
    )


if __name__ == "__main__":
    main()