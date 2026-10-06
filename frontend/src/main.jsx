import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

const API='http://localhost:8080/api/v1';
function App(){
 const [locations,setLocations]=useState([]),[selected,setSelected]=useState('aiims-bhopal'),[result,setResult]=useState(null),[loading,setLoading]=useState(false);
 useEffect(()=>{fetch(API+'/locations').then(r=>r.json()).then(setLocations)},[]);
 async function predict(){
   setLoading(true); const l=locations.find(x=>x.id===selected);
   const body={locationId:l.id,peopleAhead:l.currentPeople,serviceRatePerHour:60/l.avgServiceMinutes*60,minutesOpen:210,dayOfWeek:new Date().getDay(),hour:new Date().getHours(),appointments:65};
   const r=await fetch(API+'/predict',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); setResult(await r.json()); setLoading(false);
 }
 return <main><header><div><span className="logo">W</span><span>WAITLESS <b>AI</b></span></div><small>Queue ka Google Maps</small></header>
 <section className="hero"><p className="eyebrow">REAL-TIME QUEUE INTELLIGENCE</p><h1>Don't wait.<br/><span>Know before you go.</span></h1><p className="sub">AI-powered waiting-time prediction for hospitals, government offices, labs and everyday services.</p>
 <div className="card"><label>Where are you going?</label><select value={selected} onChange={e=>{setSelected(e.target.value);setResult(null)}}>{locations.map(l=><option key={l.id} value={l.id}>{l.name} · {l.city}</option>)}</select><button onClick={predict}>{loading?'Predicting…':'Check live wait →'}</button></div></section>
 {result && <section className="result"><div className="metric"><small>ESTIMATED WAIT</small><strong>{Math.round(result.waitMinutes)} min</strong><span>{result.confidence*100}% model confidence</span></div><div className="metric"><small>CROWD</small><strong>{result.crowdLevel}</strong><span>Trend: {result.trend}</span></div><div className="recommend"><small>AI RECOMMENDATION</small><p>{result.recommendation}</p></div></section>}
 <section className="features"><div><b>01</b><h3>Live queue</h3><p>Combine check-ins, tokens and service rate.</p></div><div><b>02</b><h3>AI prediction</h3><p>Estimate how long today's queue will take.</p></div><div><b>03</b><h3>Best-time advice</h3><p>Turn raw data into a decision people can act on.</p></div></section>
 </main>
}
createRoot(document.getElementById('root')).render(<App/>);
