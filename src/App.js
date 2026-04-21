import React, { useEffect, useState } from 'react';
import { db } from './firebase'; // Import the db we configured
import { ref, onValue, query, limitToLast } from "firebase/database";
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reference the 'logs' node in Realtime Database
    const logsRef = query(ref(db, 'logs'), limitToLast(20));

    // Listen for changes
    const unsubscribe = onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert Firebase object to an array and reverse for newest first
        const formattedLogs = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        })).reverse();
        
        setLogs(formattedLogs);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Smart Waste Segregator Live Feed</h1>
        <div className="status-badge">● System Online</div>
      </header>

      {loading ? (
        <p className="loading-text">Connecting to Cloud Database...</p>
      ) : (
        <div className="table-wrapper">
          <table className="log-table">
            <thead>
              <tr>
                <th>Waste Category</th>
                <th>Time Detected</th>
                <th>Log ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? logs.map((log) => (
                <tr key={log.id} className={log.type.toLowerCase()}>
                  <td className="type-cell">{log.type}</td>
                  <td>{new Date(log.time).toLocaleString()}</td>
                  <td className="id-cell">{log.id.substring(1, 8)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3">No logs detected yet. Use the Bluetooth app to drop garbage!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;