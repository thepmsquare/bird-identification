import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import "./stylesheets/Identification.css";

import * as tmImage from "@teachablemachine/image";

class Identification extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchInput: "",
      showingResults: false,
      imageLoaded: false,
      predictedResult: {},
    };
  }

  selectedImageHTML = "";
  handleSearchInputChange = (event) => {
    this.setState({
      searchInput: event.target.value,
    });
  };
  handleSearchInputSubmit = async (event) => {
    event.preventDefault();
    const URL = "https://teachablemachine.withgoogle.com/models/2nLyyKvGE/";
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    const model = await tmImage.load(modelURL, metadataURL);

    const allPredictions = await model.predict(this.selectedImageHTML, false);
    const sortedPredictions = allPredictions.sort(
      (element1, element2) => element2.probability - element1.probability
    );
    console.log(sortedPredictions);
    this.setState(() => {
      return {
        predictedResult: {
          className: sortedPredictions[0].className,
          probability: sortedPredictions[0].probability,
        },
        showingResults: true,
      };
    });
  };
  handleClickOnCameraIcon = () => {
    const fileSelector = document.createElement("input");
    fileSelector.setAttribute("type", "file");
    fileSelector.click();
    fileSelector.onchange = this.selectedImageToHTMLElement;
  };
  selectedImageToHTMLElement = (e) => {
    const fReader = new FileReader();
    this.selectedImageHTML = document.createElement("img");
    fReader.readAsDataURL(e.target.files[0]);
    fReader.onloadend = (event) => {
      this.selectedImageHTML.src = event.target.result;
    };
    this.setState(() => {
      return { imageLoaded: true };
    });
  };
  render = () => {
    return (
      <div className="Identification">
        <Typography variant="h2" component="h2">
          Bird Identification
        </Typography>
        {this.state.imageLoaded && (
          <Typography color="primary">Image Loaded!</Typography>
        )}
        <form
          noValidate
          autoComplete="off"
          onSubmit={this.handleSearchInputSubmit}
        >
          <TextField
            id="outlined-basic"
            label="Search"
            variant="outlined"
            value={this.state.searchInput}
            onChange={this.handleSearchInputChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={this.handleClickOnCameraIcon}>
                    <PhotoCameraIcon />
                  </IconButton>
                  <IconButton onClick={this.handleSearchInputSubmit}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>
        {this.state.showingResults && (
          <div>
            <Typography>
              Predicted Species: {this.state.predictedResult.className}
            </Typography>
            <Typography>
              Probability: {this.state.predictedResult.probability}
            </Typography>
          </div>
        )}
      </div>
    );
  };
}

export default Identification;
