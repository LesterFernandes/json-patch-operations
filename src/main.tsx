import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import JsonProvider from "./context/JsonContext";
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <JsonProvider>
      <App />
    </JsonProvider>
  </React.StrictMode>,
)
