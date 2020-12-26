import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import APItoken from "./IUCNToken";
import countryCodes from "./countryCodes.json";
import allBirdsWithCommonNames from "./allBirdsWithCommonNames.json";

// material
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import Slide from "@material-ui/core/Slide";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
// material icons
import SearchIcon from "@material-ui/icons/Search";
import MapIcon from "@material-ui/icons/Map";
import CloseIcon from "@material-ui/icons/Close";

// map
import { WorldMap } from "react-svg-worldmap";
// css
import "./stylesheets/IdentificationByLocation.css";
class IdentificationByLocation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: null,
      searchInputValue: "",
      isMapDialogOpen: false,
      snackbarOpen: false,
      snackbarMessage: "",
      showingResults: false,
      display: {},
      isLoading: false,
    };
    this.loadAllCountries();
  }

  loadAllCountries = () => {
    this.autocompleteOptions = [];
    countryCodes.forEach((countryCode) => {
      this.autocompleteOptions.push(countryCode.Country);
    });
  };

  handleSearchValueChange = (event, newValue) => {
    this.setState({
      searchValue: newValue,
    });
  };

  handleSearchInputValueChange = (event, newValue) => {
    this.setState({
      searchInputValue: newValue,
    });
  };

  handleSearchInputsClear = () => {
    this.setState(() => {
      return { searchValue: null, searchInputValue: "" };
    });
  };

  handleClickOnMapIcon = () => {
    this.setState(() => {
      return { isMapDialogOpen: true };
    });
  };

  handleSearchSubmit = (e) => {
    e.preventDefault();
    if (this.state.searchValue) {
      this.setState(
        () => {
          return { isLoading: true, showingResults: false, display: {} };
        },
        () => {
          let countryCode = countryCodes.find((country) => {
            return country.Country === this.state.searchValue;
          }).Code;
          this.fetchDetailsFromAPI(countryCode);
        }
      );
    } else {
      this.setState(() => {
        return {
          snackbarOpen: true,
          snackbarMessage: "Empty Input",
        };
      });
    }
  };

  handleMapDialogClose = () => {
    this.setState(() => {
      return { isMapDialogOpen: false };
    });
  };
  checkCategory = (acronym) => {
    acronym = acronym.toUpperCase();
    if (acronym === "LC") return "Least-concern";
    else if (acronym === "EX") return "Extinct";
    else if (acronym === "EW") return "Extinct in the wild";
    else if (acronym === "CR") return "Critically endangered";
    else if (acronym === "EN") return "Endangered";
    else if (acronym === "VU") return "Vulnerable";
    else if (acronym === "NT") return "Near threatened";
    else if (acronym === "DD") return "Data deficient";
    else if (acronym === "NE") return "Not evaluated";
    else return acronym;
  };
  fetchDetailsFromAPI = async (country) => {
    try {
      let display = {};
      display.country = countryCodes.find(
        (ele) => ele.Code === country
      ).Country;
      display.data = [];
      const speciesByCountry = await axios.get(
        "https://apiv3.iucnredlist.org/api/v3/country/getspecies/" +
          country +
          "?token=" +
          APItoken
      );
      const birdsByCountry = speciesByCountry.data.result.filter((species) => {
        return allBirdsWithCommonNames.some(
          (ele) => ele.name === species.scientific_name
        );
      });

      let categories = birdsByCountry.map((bird) => bird.category);
      let uniqueCategories = [...new Set(categories)];

      uniqueCategories.forEach((category) => {
        display.data.push({
          category: this.checkCategory(category),
          birds: birdsByCountry
            .filter((bird) => bird.category === category)
            .map((ele) => {
              return {
                commonName: allBirdsWithCommonNames.find(
                  (bird) => bird.name === ele.scientific_name
                ).commonNames[0],
                name: ele.scientific_name,
                id: ele.taxonid,
              };
            }),
        });
      });
      this.setState(() => {
        return {
          display,
          showingResults: true,
          isLoading: false,
        };
      });
    } catch (error) {
      this.setState(() => {
        return {
          isLoading: false,
          snackbarMessage: "Error in Fetching Details",
          snackbarOpen: true,
        };
      });
    }
  };

  handleCloseResults = () => {
    this.setState(() => {
      return { showingResults: false, display: {} };
    });
  };

  handleSnackbarClose = () => {
    this.setState(() => {
      return { snackbarOpen: false, snackbarMessage: "" };
    });
  };

  handleBirdSearch = (id) => {
    this.props.changeId(id);
    this.props.history.push("/bird-identification");
  };

  render = () => {
    return (
      <div className="IdentificationByLocation">
        <Typography component="h1" variant="h2">
          Bird Identification
        </Typography>
        <form noValidate autoComplete="off" onSubmit={this.handleSearchSubmit}>
          <Autocomplete
            value={this.state.searchValue}
            onChange={this.handleSearchValueChange}
            inputValue={this.state.searchInputValue}
            onInputChange={this.handleSearchInputValueChange}
            disableClearable
            forcePopupIcon={false}
            disableListWrap
            options={this.autocompleteOptions}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <InputAdornment position="end">
                      {this.state.searchInputValue && (
                        <IconButton onClick={this.handleSearchInputsClear}>
                          <CloseIcon />
                        </IconButton>
                      )}
                      <IconButton onClick={this.handleClickOnMapIcon}>
                        <MapIcon />
                      </IconButton>
                      <IconButton onClick={this.handleSearchSubmit}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
            renderOption={(option) => <Typography noWrap>{option}</Typography>}
          />
        </form>
        <Dialog
          open={this.state.isMapDialogOpen}
          onClose={this.handleMapDialogClose}
        >
          <WorldMap
            data={countryCodes.map((country) => {
              return {
                country: country.Code,
                value: Math.random(),
              };
            })}
            color="#1976d2"
            tooltipTextFunction={(countryName) => countryName}
            strokeOpacity="100%"
            size="lg"
            onClickFunction={(event, country, code) => {
              this.setState(
                () => {
                  return {
                    isLoading: true,
                    showingResults: false,
                    display: {},
                  };
                },
                () => {
                  this.fetchDetailsFromAPI(code);
                  this.handleMapDialogClose();
                }
              );
            }}
          />
        </Dialog>
        <Backdrop open={this.state.isLoading} style={{ zIndex: 10 }}>
          {this.state.isLoading && <CircularProgress color="inherit" />}
        </Backdrop>
        {!this.state.showingResults && (
          <div className="Identification-Links">
            <Link to="/bird-identification">
              <Typography>Search by Name</Typography>
            </Link>
            <Link to="/bird-identification/endangered">
              <Typography>Endangered Birds</Typography>
            </Link>
            <Link to="/bird-identification">
              <Typography>Featured bird: White-headed Duck</Typography>
            </Link>
            <Link to="/bird-identification/credits">
              <Typography>Credits</Typography>
            </Link>
          </div>
        )}
        {this.state.showingResults && (
          <Slide
            direction="up"
            in={this.state.showingResults}
            mountOnEnter
            unmountOnExit
            className="Identification-Results"
          >
            <Card elevation={4}>
              <CardHeader title={`${this.state.display.country}`} />

              <CardContent>
                {this.state.display.data.map((category) => {
                  return (
                    <TableContainer
                      key={category.category}
                      className="IdentificationByCountry-TableContainer"
                      component={Paper}
                    >
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>{category.category}</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {category.birds.map((bird) => (
                            <TableRow key={bird.id}>
                              <TableCell>{bird.commonName}</TableCell>
                              <TableCell>
                                <IconButton
                                  onClick={() => this.handleBirdSearch(bird.id)}
                                >
                                  <SearchIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  );
                })}
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="secondary"
                  onClick={this.handleCloseResults}
                >
                  Close
                </Button>
              </CardActions>
            </Card>
          </Slide>
        )}
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          open={this.state.snackbarOpen}
          autoHideDuration={6000}
          onClose={this.handleSnackbarClose}
          message={this.state.snackbarMessage}
          action={
            <React.Fragment>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={this.handleSnackbarClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      </div>
    );
  };
}

export default IdentificationByLocation;
