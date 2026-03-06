/**
 * main.jsx — React Application Entry Point
 *
 * React 18's createRoot API enables concurrent features.
 * StrictMode renders components twice in development to surface side effects.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
