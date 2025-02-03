import React from "react";
import logo from "./logo.svg";
import "./styles/App.css";
import AutocompleteEditor from "./Autocomplete-editor";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {/* <p>
          Edit <code>src/App.js</code> and save to reload. Please write the
          autocomplete here.
        </p> */}
      <div>
      <h2>Draft.js Autocomplete Editor</h2>
      <AutocompleteEditor/>
    </div>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
