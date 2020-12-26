import React, { Component } from "react";
import Identification from "./Identification";
import IdentificationByLocation from "./IdentificationByLocation";
import IdentificationByEndangeredSpecies from "./IdentificationByEndangeredSpecies";
import Credits from "./Credits";
import { Switch, Route } from "react-router-dom";
import "./stylesheets/App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
    };
  }
  changeId = (newId) => {
    this.setState(() => {
      return { id: newId };
    });
  };
  render = () => {
    return (
      <div className="App">
        <Switch>
          <Route
            exact
            path="/bird-identification"
            render={(routeProps) => (
              <Identification
                {...routeProps}
                changeId={this.changeId}
                id={this.state.id}
              />
            )}
          ></Route>
          <Route
            exact
            path="/bird-identification/locations"
            render={(routeProps) => (
              <IdentificationByLocation
                {...routeProps}
                changeId={this.changeId}
              />
            )}
          ></Route>
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
