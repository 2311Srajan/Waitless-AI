import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
const API = 'http://localhost:8080/api/v1';

function App() {
  const [locations, setLocations] = useState([]);
  const [selected, setSelected] = useState('aiims-bhopal');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadLocations() {
      try {
        const response = await fetch(`${API}/locations`);

        if (!response.ok) {
          throw new Error(`Locations request failed: ${response.status}`);
        }

        const data = await response.json();

        if (active) {
          setLocations(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            'Unable to load locations. Check that the backend is running.'
          );
        }
        console.error('Locations error:', error);
      }
    }

    loadLocations();

    return () => {
      active = false;
    };
  }, []);
  const [queueUpdate, setQueueUpdate] = useState(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () =>
        new SockJS('http://localhost:8080/ws-waitless'),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/topic/queue-updates', (message) => {
          setQueueUpdate(JSON.parse(message.body));
        });
      },
    });
  
    client.activate();
  
    return () => {
      client.deactivate();
    };
  }, []);
  const selectedLocation = locations.find(
    (location) =>
      String(location.id) === String(selected) ||
      location.name?.toLowerCase() === selected.toLowerCase()
  );

  async function predict() {
    try {
      setLoading(true);
      setErrorMessage(null);
      const loc = selectedLocation;

      if (!loc) {
        throw new Error('Select a location from the suggestions.');
      }
      const serviceMinutes = loc.avgServiceMinutes || 15;

      const defaultPeopleMap = {
        "1": 8,
        "2": 22,
        "3": 14
      };
      
      const body = {
        locationId: String(loc.id ?? "1"),
        peopleAhead: Number(loc.currentPeople ?? 0),
        serviceRatePerHour: Math.max(
          1,
          60 / Math.max(1, Number(serviceMinutes) || 15)
        ),
        minutesOpen: 0,
        dayOfWeek: new Date().getDay(),
        hour: new Date().getHours(),
        appointments: 0
      };

      const response = await fetch(`${API}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }
  const crowd = String(result?.crowdLevel ?? 'Unknown');
  const trend = String(result?.trend ?? 'Stable');

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
            Predict waiting times for hospitals, government offices,
            labs and everyday services.
          </p>

          <div className="search-card">
            <label htmlFor="location-search">WHERE ARE YOU GOING?</label>

            <div className="search-row">
              <input
                id="location-search"
                type="text"
                placeholder="Search hospital, office, or lab..."
                value={
                  selectedLocation
                    ? `${selectedLocation.name}`
                    : selected
                }
                onChange={(event) => {
                  setSelected(event.target.value);
                  setResult(null);
                  setErrorMessage(null);
                }}
                list="locations-list"
                className="search-input"
              />

              <datalist id="locations-list">
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.city}
                  </option>
                ))}
              </datalist>

              <button
                onClick={predict}
                disabled={loading || !selectedLocation}
              >
                {loading ? 'Predicting...' : 'Check live wait →'}
              </button>
            </div>

            {selectedLocation && (
              <div className="location-meta">
                <span>📍 {selectedLocation.city}</span>
                <span>•</span>
                <span>{selectedLocation.category}</span>
              </div>
            )}

            {errorMessage && (
              <div className="error-message" role="alert">
                {errorMessage}
              </div>
            )}
          </div>
        </section>

        {result && (
          <section id="dashboard">
            <div className="main-result">
              <div className="wait-section">
                <span className="eyebrow">ESTIMATED WAIT</span>

                <div className="wait-time">
                  {Math.round(Number(result.waitMinutes))}
                  <small> min</small>
                </div>

                <div className="confidence">
                  {Math.round(Number(result.confidence ?? 0) * 100)}%
                  {' '}model confidence
                </div>
              </div>

              <div className="crowd-section">
                <span className="eyebrow">CROWD LEVEL</span>

                <div
                  className={`crowd ${crowd.toLowerCase()}`}
                >
                  {crowd}
                </div>

                <div className="trend">
                  {trend === 'Increasing'
                    ? '↗️'
                    : trend === 'Decreasing'
                      ? '↘️'
                      : '→'}
                  {' '}
                  {trend}
                </div>
              </div>

              <div className="recommendation">
                <span className="eyebrow">AI RECOMMENDATION</span>

                <h3>
                  {crowd === 'Low'
                    ? '✦ Good time to go'
                    : crowd === 'High'
                      ? '⚠ Consider waiting'
                      : '◈ Plan your visit'}
                </h3>

                <p>
                  {result.recommendation ||
                    'Use this estimate to plan your visit.'}
                </p>
              </div>
            </div>

            <div className="insight-grid">
              <div className="insight-card">
                <div className="card-number">01</div>
                <div className="card-icon">◷</div>
                <h3>Estimated wait</h3>
                <p>
                  Plan ahead with your predicted waiting time.
                </p>
              </div>

              <div className="insight-card featured">
                <div className="card-number">02</div>
                <div className="card-icon">✦</div>
                <h3>AI prediction</h3>
                <p>
                  Turn queue data into an estimated waiting time.
                </p>
              </div>

              <div className="insight-card">
                <div className="card-number">03</div>
                <div className="card-icon">↗️</div>
                <h3>Best-time advice</h3>
                <p>
                  Get a recommendation you can act on.
                </p>
              </div>
            </div>
          </section>
        )}

        {!result && !loading && (
          <section className="empty-state">
            <div className="empty-icon">◷</div>
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

createRoot(document.getElementById('root')).render(<App />);