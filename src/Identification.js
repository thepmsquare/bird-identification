import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import "./stylesheets/Identification.css";

class Identification extends Component {
  render = () => {
    return (
      <div className="Identification">
        <Typography variant="h2" component="h2">
          Bird Identification
        </Typography>
        <form noValidate autoComplete="off">
          <TextField
            id="outlined-basic"
            label="Search"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <IconButton>
                    <PhotoCameraIcon />
                  </IconButton>
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>
      </div>
    );
  };
}

export default Identification;
