import React, { Component } from "react";
import Identification from "./Identification";
import IdentificationByLocation from "./IdentificationByLocation";
import Credits from "./Credits";
import { Switch, Route, withRouter } from "react-router-dom";
import fetchJsonp from "fetch-jsonp";
import allBirdsWithCommonNames from "./allBirdsWithCommonNames.json";
import "./stylesheets/App.css";

class App extends Component {
  constructor(props) {
    super(props);
    let featuredBird = this.setFeaturedBird();
    this.state = {
      name: null,
      featuredBird,
    };
    this.setBackground();
  }

  changeName = (newName) => {
    this.setState(
      () => {
        return { name: newName };
      },
      () => this.props.history.push("/bird-identification")
    );
  };
  setFeaturedBird = () => {
    let today = new Date();
    let month = today.getMonth() + 1;
    let year = today.getFullYear();
    let totalMonths = 0;
    for (let i = 1920; i < year; i++) {
      totalMonths += 12;
    }
    totalMonths += month;
    let featuredBird = Math.floor((totalMonths * 6969 - 1) / 8);
    return featuredBird;
  };

  setBackground = async () => {
    let wikiJsonpResponse = await fetchJsonp(
      "https://en.wikipedia.org/w/api.php?format=json&action=query&titles=" +
        allBirdsWithCommonNames[
          this.state.featuredBird % allBirdsWithCommonNames.length
        ].name +
        "&prop=pageimages&piprop=original&redirects=true"
    );
    let parsedJson = await wikiJsonpResponse.json();

    if (Object.values(parsedJson.query.pages)[0].original) {
      document.querySelector(".App").style.backgroundImage = `url(${
        Object.values(parsedJson.query.pages)[0].original.source
      } )`;
      document.querySelector(".App").style.backgroundPosition = "center";
      document.querySelector(".App").style.backgroundRepeat = "no-repeat";
      document.querySelector(".App").style.backgroundSize = "cover";
    }
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
                featuredBird={this.state.featuredBird}
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
                featuredBird={this.state.featuredBird}
              />
            )}
          ></Route>
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

export default withRouter(App);
