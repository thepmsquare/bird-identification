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
          <Route exact path="/">
            <Identification />
          </Route>
          <Route exact path="/locations">
            <IdentificationByLocation />
          </Route>
          <Route exact path="/endangered">
            <IdentificationByEndangeredSpecies />
          </Route>
          <Route exact path="/credits">
            <Credits />
          </Route>
          <Route path="*">
            <Identification />
          </Route>
        </Switch>
      </div>
    );
  };
}

export default App;
