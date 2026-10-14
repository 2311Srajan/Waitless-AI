import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const API = 'http://localhost:8080/api/v1';

function App() {
  const [locations, setLocations] = useState([]);
  const [selected, setSelected] = useState('aiims-bhopal');
  const [result, setResult] = useState(null);
const [loading, setLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState(null);
  useEffect(() => {
    fetch(`${API}/locations`)
      .then((r) => r.json())
      .then(setLocations)
      .catch((err) => console.error('Locations error:', err));
  }, []);

  async function predict() {
    setLoading(true);

    try {
      const loc = locations.find((x) => x.id === selected);

      if (!loc) {
        throw new Error('Location not found');
      }

      const serviceRatePerHour =
        60 / loc.avgServiceMinutes;

      const body = {
        locationId: loc.id,
        peopleAhead: loc.currentPeople,
        serviceRatePerHour,
        minutesOpen: 210,
        dayOfWeek: new Date().getDay(),
        hour: new Date().getHours(),
        appointments: 5,
      };

      const response = await fetch(`${API}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult(null);
      alert('Unable to get prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const selectedLocation = locations.find(
    (x) => x.id === selected
  );

  return (
    <div className="app">

      <header className="navbar">
        <div className="brand">
          <div className="brand-mark">W</div>
          <div>
            <div className="brand-name">WAITLESS</div>
            <div className="brand-tag">AI</div>
          </div>
        </div>

        <div className="live-status">
          <span className="live-dot"></span>
          LIVE INTELLIGENCE
        </div>
      </header>

      <main>

        <section className="hero">
          <div className="hero-badge">
            ✦ AI-POWERED QUEUE INTELLIGENCE
          </div>

          <h1>
            Know the wait.
            <br />
            <span>Before you go.</span>
          </h1>

          <p>
            Predict waiting times for hospitals, government
            offices, labs and everyday services.
          </p>

          <div className="search-card">

            <label>WHERE ARE YOU GOING?</label>

            <div className="search-row">
            <input
  type="text"
  placeholder="Search hospital, office, or lab..."
  value={selected}
  onChange={(e) => {
    setSelected(e.target.value);
    setResult(null);
  }}
  list="locations-list"
  className="search-input"
/>
<datalist id="locations-list">
  {locations.map((loc) => (
    <option key={loc.id} value={loc.id}>
      {loc.name} • {loc.city}
    </option>
  ))}
</datalist>

              <button
                onClick={predict}
                disabled={loading}
              >
                {loading
                  ? 'Predicting...'
                  : 'Check live wait →'}
              </button>
            </div>

            {selectedLocation && (
              <div className="location-meta">
                <span>📍 {selectedLocation.city}</span>
                <span>•</span>
                <span>{selectedLocation.category}</span>
              </div>
            )}

          </div>
        </section>

        {result && (
          <section id="dashboard">

            <div className="main-result">

              <div className="wait-section">
                <span className="eyebrow">
                  ESTIMATED WAIT
                </span>

                <div className="wait-time">
                  {Math.round(result.waitMinutes)}
                  <small> min</small>
                </div>

                <div className="confidence">
                  {Math.round(result.confidence * 100)}%
                  model confidence
                </div>
              </div>

              <div className="crowd-section">
                <span className="eyebrow">
                  CROWD LEVEL
                </span>

                <div
                  className={`crowd ${String(
                    result.crowdLevel
                  ).toLowerCase()}`}
                >
                  {result.crowdLevel}
                </div>

                <div className="trend">
                  {result.trend === 'Increasing'
                    ? '↗️'
                    : result.trend === 'Decreasing'
                    ? '↘️'
                    : '→'}

                  {' '}
                  {result.trend}
                </div>
              </div>

              <div className="recommendation">

                <span className="eyebrow">
                  AI RECOMMENDATION
                </span>

                <h3>
                  {result.crowdLevel === 'Low'
                    ? '✨ Good time to go'
                    : result.crowdLevel === 'High'
                    ? '⚠️ Consider waiting'
                    : '💡 Plan your visit'}
                </h3>

                <p>
                  {result.recommendation}
                </p>

              </div>

            </div>

            <div className="insight-grid">

              <div className="insight-card">
                <div className="card-number">01</div>
                <div className="card-icon">👥</div>
                <h3>Live queue</h3>
                <p>
                  Monitor people waiting and service
                  capacity in real time.
                </p>
              </div>

              <div className="insight-card featured">
                <div className="card-number">02</div>
                <div className="card-icon">🧠</div>
                <h3>AI prediction</h3>
                <p>
                  Turn queue data into an estimated
                  waiting time.
                </p>
              </div>

              <div className="insight-card">
                <div className="card-number">03</div>
                <div className="card-icon">⚡</div>
                <h3>Best-time advice</h3>
                <p>
                  Get a simple recommendation you can
                  act on.
                </p>
              </div>

            </div>

          </section>
        )}

        {!result && (
          <section className="empty-state">
            <div className="empty-icon">⏱</div>
            <h2>Don't wait blindly.</h2>
            <p>
              Select a location above and let AI estimate
              how long your visit could take.
            </p>
          </section>
        )}

      </main>

      <footer>
        <span>WAITLESS AI</span>
        <span>Real-time queue intelligence</span>
      </footer>

    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <App />
);