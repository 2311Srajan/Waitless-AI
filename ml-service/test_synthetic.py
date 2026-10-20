import unittest

from app import PredictRequest, predict_wait


def make_request(**overrides):
    values = {
        "locationId": "TEST_LOCATION",
        "peopleAhead": 10,
        "serviceRatePerHour": 4,
        "minutesOpen": 60,
        "dayOfWeek": 2,
        "hour": 14,
        "appointments": 2,
    }
    values.update(overrides)
    return PredictRequest(**values)


class SyntheticPredictionTests(unittest.TestCase):

    def test_normal_prediction_is_valid(self):
        result = predict_wait(make_request())

        self.assertTrue(result.waitMinutes >= 1)
        self.assertTrue(0 <= result.confidence <= 0.80)
        self.assertIn(
            result.crowdLevel,
            ["Low", "Moderate", "High"],
        )
        self.assertTrue(result.trend)
        self.assertTrue(result.recommendation)

    def test_zero_people_and_appointments(self):
        result = predict_wait(
            make_request(peopleAhead=0, appointments=0)
        )
        self.assertEqual(result.waitMinutes, 1)

    def test_more_people_do_not_reduce_wait(self):
        small_queue = predict_wait(
            make_request(peopleAhead=5)
        )
        large_queue = predict_wait(
            make_request(peopleAhead=15)
        )

        self.assertGreaterEqual(
            large_queue.waitMinutes,
            small_queue.waitMinutes,
        )

    def test_peak_hour_does_not_reduce_estimate(self):
        normal = predict_wait(make_request(hour=14))
        peak = predict_wait(make_request(hour=11))

        self.assertGreaterEqual(
            peak.waitMinutes,
            normal.waitMinutes,
        )

    def test_sunday_factor_does_not_increase_estimate(self):
        weekday = predict_wait(
            make_request(dayOfWeek=2)
        )
        sunday = predict_wait(
            make_request(dayOfWeek=0)
        )

        self.assertLessEqual(
            sunday.waitMinutes,
            weekday.waitMinutes,
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)