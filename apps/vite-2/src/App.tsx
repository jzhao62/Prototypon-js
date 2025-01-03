import { Button } from '@nighttrax/components/button';
import { meaningOfLife } from '@nighttrax/foo';
import React, { useState } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';

const App = () => {
  const [count, setCount] = useState(meaningOfLife);

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>VITE-2</h1>
      <div className="card">
        <Button />
        <button type="button" onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
};

export default App;
