import React, { Component } from "react";
import Identification from "./Identification";
import IdentificationByLocation from "./IdentificationByLocation";
import IdentificationByEndangeredSpecies from "./IdentificationByEndangeredSpecies";
import Credits from "./Credits";
import { Switch, Route } from "react-router-dom";
import "./stylesheets/App.css";

class App extends Component {
  render = () => {
    return (
      <div className="App">
        <Switch>
          <Route exact path="/bird-identification">
            <Identification />
          </Route>
          <Route exact path="/bird-identification/locations">
            <IdentificationByLocation />
          </Route>
          <Route exact path="/bird-identification/endangered">
            <IdentificationByEndangeredSpecies />
          </Route>
          <Route exact path="/bird-identification/credits">
            <Credits />
          </Route>
          <Route path="/bird-identification/*">
            <Identification />
          </Route>
        </Switch>
      </div>
    );
  };
}

export default App;
