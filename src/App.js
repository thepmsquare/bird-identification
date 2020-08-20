import React, { Component } from "react";
import Identification from "./Identification";
import "./stylesheets/App.css";

class App extends Component {
  render = () => {
    return (
      <div className="App">
        <Identification />
      </div>
    );
  };
}

export default App;
