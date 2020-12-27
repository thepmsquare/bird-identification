import React, { Component } from "react";
import { Link } from "react-router-dom";
// material
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
// css
import "./stylesheets/Credits.css";

class Credits extends Component {
  render = () => {
    return (
      <div className="Credits">
        <Typography component="h1" variant="h2" className="Credits-Heading">
          Credits
        </Typography>
        <Typography>
          Bird Identification Model of 225 birds is Trained with the help of{" "}
          <a href="https://teachablemachine.withgoogle.com/">
            Teachable Machine
          </a>
          .
        </Typography>
        <Typography>
          <a href="https://www.kaggle.com/gpiosenka/100-bird-species">
            Image Dataset from Kaggle
          </a>{" "}
          is used for Training the model.
        </Typography>
        <Typography>
          <a href="https://apiv3.iucnredlist.org/">IUCN Red List API</a> is used
          to fetch information about birds.
        </Typography>
        <Typography>
          <a href="https://www.xeno-canto.org/explore/api">Xeno-canto API</a> is
          used on backend to fetch audio recordings of birds.
        </Typography>
        <Typography>
          <a href="https://www.mediawiki.org/wiki/API:Main_page">
            English Wikipedia API
          </a>{" "}
          is used to fetch images of birds.
        </Typography>
        <Typography>
          Contributions to{" "}
          <a href="https://www.xeno-canto.org/upload">Xeno-canto</a> by
          uploading audio recordings of birds and to{" "}
          <a href="https://en.wikipedia.org/wiki/Help:Editing">Wikipedia</a> by
          correcting information and uploading missing photos of birds are
          greatly encouraged.
        </Typography>
        <Typography>
          Made by <a href="mailto:kajolachhra123@gmail.com">Kajol Achhra</a>,{" "}
          <a href="mailto:2017.priyanka.ahuja@ves.ac.in">Priyanka Ahuja</a>,{" "}
          <a href="mailto:2017.pooja.kamrani@ves.ac.in">Pooja Kamrani</a> and{" "}
          <a href="https://thepmsquare.me/">Parth Mangtani</a>.
        </Typography>
        <Link to="/bird-identification">
          <Button>Back</Button>
        </Link>
      </div>
    );
  };
}

export default Credits;
