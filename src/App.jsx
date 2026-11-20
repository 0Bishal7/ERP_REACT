import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="page">
      <header className="topbar">
        <a className="brand" href="/" aria-label="ERP React home">
          <span className="brand-mark">E</span>
          <span>ERP React</span>
        </a>
        <span className="status">
          <span className="status-dot" />
          App is running
        </span>
      </header>

      <section className="welcome">
        <p className="eyebrow">FRONTEND STARTER</p>
        <h1>Your ERP workspace starts here.</h1>
        <p className="intro">
          A clean React foundation is ready. Build your modules, connect your
          data, and make this workspace your own.
        </p>

        <div className="starter-card">
          <div>
            <p className="card-label">INTERACTIVE STARTER</p>
            <h2>React is working</h2>
            <p className="card-copy">
              Use the button to verify that the app responds to your changes.
            </p>
          </div>
          <button type="button" onClick={() => setCount((value) => value + 1)}>
            Clicked {count} {count === 1 ? "time" : "times"}
          </button>
        </div>
      </section>

      <footer>Built with React and Vite</footer>
    </main>
  );
}

export default App;
