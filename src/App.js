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
      name: null,
    };
  }
  changeName = (newName) => {
    this.setState(() => {
      return { name: newName };
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
                changeName={this.changeName}
                name={this.state.name}
              />
            )}
          ></Route>
          <Route
            exact
            path="/bird-identification/locations"
            render={(routeProps) => (
              <IdentificationByLocation
                {...routeProps}
                changeName={this.changeName}
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
