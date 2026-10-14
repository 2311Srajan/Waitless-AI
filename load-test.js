import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 500 },  // Ramp up to 500 users
    { duration: '1m', target: 1000 },  // Stay at 1,000 concurrent users
    { duration: '30s', target: 0 },    // Scale down
  ],
  thresholds: {
    http_req_duration: ['p(95)<45'],   // P95 latency must be under 45ms
  },
};

export default function () {
  const url = 'http://localhost:8080/api/v1/locations';
  const res = http.get(url);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  sleep(1);
}