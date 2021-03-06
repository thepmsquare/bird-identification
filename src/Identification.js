import React, { Component } from "react";
import * as tmImage from "@teachablemachine/image";
import allBirdsWithCommonNames from "./allBirdsWithCommonNames.json";
import placeholder from "./placeholder.jpg";
import { VariableSizeList } from "react-window";
import PropTypes from "prop-types";
import axios from "axios";
import APItoken from "./IUCNToken";
import imageModelNames from "./imageModelNames.json";
import AudioPlayer from "material-ui-audio-player";
import fetchJsonp from "fetch-jsonp";
import ReactCrop from "react-image-crop";
import { Link } from "react-router-dom";
// material
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import Slide from "@material-ui/core/Slide";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import ListSubheader from "@material-ui/core/ListSubheader";
import Timeline from "@material-ui/lab/Timeline";
import TimelineItem from "@material-ui/lab/TimelineItem";
import TimelineSeparator from "@material-ui/lab/TimelineSeparator";
import TimelineContent from "@material-ui/lab/TimelineContent";
import Avatar from "@material-ui/core/Avatar";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
// material icons
import SearchIcon from "@material-ui/icons/Search";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
// map
import { WorldMap } from "react-svg-worldmap";
// css
import "./stylesheets/Identification.css";
import "react-image-crop/dist/ReactCrop.css";

//copy pasted from mui website to virtualize dropdown
const LISTBOX_PADDING = 8; // px
function renderRow(props) {
  const { data, index, style } = props;
  return React.cloneElement(data[index], {
    style: {
      ...style,
      top: style.top + LISTBOX_PADDING,
    },
  });
}
const OuterElementContext = React.createContext({});
const OuterElementType = React.forwardRef((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});
function useResetCache(data) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}
const ListboxComponent = React.forwardRef(function ListboxComponent(
  props,
  ref
) {
  const { children, ...other } = props;
  const itemData = React.Children.toArray(children);
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up("sm"), { noSsr: true });
  const itemCount = itemData.length;
  const itemSize = smUp ? 36 : 48;

  const getChildSize = (child) => {
    if (React.isValidElement(child) && child.type === ListSubheader) {
      return 48;
    }

    return itemSize;
  };
  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };
  const gridRef = useResetCache(itemCount);
  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});
ListboxComponent.propTypes = {
  children: PropTypes.node,
};
const renderGroup = (params) => [
  <ListSubheader key={params.key} component="div">
    {params.group}
  </ListSubheader>,
  params.children,
];

class Identification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: null,
      searchInputValue: "",
      showingResults: false,
      display: {},
      isLoading: false,
      snackbarOpen: false,
      snackbarMessage: "",
      accordions: [
        { name: "Taxonomy", isOpen: true },
        { name: "Geographic Range", isOpen: true },
        { name: "Population", isOpen: true },
        { name: "Habitat and Ecology", isOpen: true },
        { name: "Threats", isOpen: true },
        { name: "Conservation Actions", isOpen: true },
      ],
      featuredBird:
        allBirdsWithCommonNames[
          this.props.featuredBird % allBirdsWithCommonNames.length
        ],
      crop: {
        unit: "%",
        width: 80,
        aspect: 1 / 1,
      },
      selectedImageHTMLSrc: null,
    };
    this.loadUniqueCommonNames();
  }

  componentDidMount = () => {
    if (this.props.name) this.searchforThisBird(this.props.name);
  };

  componentDidUpdate = () => {
    if (this.props.name) this.searchforThisBird(this.props.name);
  };

  loadUniqueCommonNames = () => {
    this.allCommonNames = [];
    allBirdsWithCommonNames.forEach((bird) => {
      this.allCommonNames.push(...bird.commonNames);
    });
    this.uniqueCommonNames = [...new Set(this.allCommonNames)];
    this.autocompleteOptions = this.uniqueCommonNames.sort((a, b) =>
      a.toUpperCase().localeCompare(b.toUpperCase())
    );
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

  handleSearchSubmit = (e) => {
    e.preventDefault();
    if (this.state.searchValue) {
      this.setState(
        () => {
          return { isLoading: true, showingResults: false, display: {} };
        },
        () => {
          let birdName = allBirdsWithCommonNames.find((ele) => {
            return ele.commonNames.includes(this.state.searchValue);
          }).name;
          this.fetchDetailsFromAPI(birdName);
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
      this.setState(() => {
        return { selectedImageHTMLSrc: this.selectedImageHTML.src };
      });
    };
  };

  handleImageSubmit = () => {
    this.setState(
      () => {
        return {
          selectedImageHTMLSrc: null,
          isLoading: true,
          showingResults: false,
          display: {},
        };
      },
      async () => {
        const URL = "https://teachablemachine.withgoogle.com/models/-7mqg1t6m/";
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        try {
          const model = await tmImage.load(modelURL, metadataURL);
          const allPredictions = await model.predict(
            this.selectedImageHTML,
            false
          );
          const sortedPredictions = allPredictions.sort(
            (element1, element2) => element2.probability - element1.probability
          );
          this.findBirdNameFromImage(sortedPredictions[0]);
          this.selectedImageHTML = null;
        } catch (error) {
          this.setState(() => {
            this.selectedImageHTML = null;
            return {
              isLoading: false,
              snackbarMessage: "Error in Identification",
              snackbarOpen: true,
            };
          });
        }
      }
    );
  };

  findBirdNameFromImage = (prediction) => {
    let birdName = imageModelNames.find((ele) => {
      return ele.bird === prediction.className;
    }).name;
    this.fetchDetailsFromAPI(birdName, prediction);
  };

  fetchDetailsFromAPI = async (birdName, prediction) => {
    try {
      let display = {};
      if (prediction) {
        display.prediction = prediction;
      }
      const individualSpeciesByName = await axios.get(
        "https://apiv3.iucnredlist.org/api/v3/species/" +
          birdName +
          "?token=" +
          APItoken
      );
      const countryOccuranceByName = await axios.get(
        "https://apiv3.iucnredlist.org/api/v3/species/countries/name/" +
          birdName +
          "?token=" +
          APItoken
      );
      const historicalAssessmentsByName = await axios.get(
        "https://apiv3.iucnredlist.org/api/v3/species/history/name/" +
          birdName +
          "?token=" +
          APItoken
      );
      const habitatsByName = await axios.get(
        "https://apiv3.iucnredlist.org/api/v3/habitats/species/name/" +
          birdName +
          "?token=" +
          APItoken
      );
      const threatsByName = await axios.get(
        "https://apiv3.iucnredlist.org/api/v3/threats/species/name/" +
          birdName +
          "?token=" +
          APItoken
      );
      const actionsByName = await axios.get(
        "https://apiv3.iucnredlist.org/api/v3/measures/species/name/" +
          birdName +
          "?token=" +
          APItoken
      );

      display.title = individualSpeciesByName.data.result[0].main_common_name;
      display.taxonomy = {
        class: individualSpeciesByName.data.result[0].class,
        family: individualSpeciesByName.data.result[0].family,
        genus: individualSpeciesByName.data.result[0].genus,
        kingdom: individualSpeciesByName.data.result[0].kingdom,
        order: individualSpeciesByName.data.result[0].order,
        phylum: individualSpeciesByName.data.result[0].phylum,
        scientific_name: individualSpeciesByName.data.result[0].scientific_name,
      };
      display.geographicRange = countryOccuranceByName.data.result.map(
        (ele) => {
          return { country: ele.code, value: Math.random() };
        }
      );
      display.population = {
        trend: individualSpeciesByName.data.result[0].population_trend,
        timeline: JSON.parse(
          JSON.stringify(historicalAssessmentsByName.data.result)
        ),
      };
      display.habitats = habitatsByName.data.result.map(
        (habitat) => habitat.habitat
      );
      display.threats = threatsByName.data.result.map((threat) => {
        return {
          title: threat.title,
          timing: threat.timing,
          score: threat.score,
        };
      });
      display.actions = actionsByName.data.result.map((action) => action.title);
      display.audioURL = allBirdsWithCommonNames.find(
        (bird) => bird.name === birdName
      ).soundUrl;
      let wikiJsonpResponse = await fetchJsonp(
        "https://en.wikipedia.org/w/api.php?format=json&action=query&titles=" +
          individualSpeciesByName.data.result[0].scientific_name +
          "&prop=pageimages&piprop=original&redirects=true"
      );

      let parsedJson = await wikiJsonpResponse.json();

      if (Object.values(parsedJson.query.pages)[0].original) {
        display.imageURL = Object.values(
          parsedJson.query.pages
        )[0].original.source;
      }
      this.setState(() => {
        return {
          display,
          showingResults: true,
          isLoading: false,
          accordions: [
            { name: "Taxonomy", isOpen: true },
            { name: "Geographic Range", isOpen: true },
            { name: "Population", isOpen: true },
            { name: "Habitat and Ecology", isOpen: true },
            { name: "Threats", isOpen: true },
            { name: "Conservation Actions", isOpen: true },
          ],
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

  handleAccordianToggle = (name) => {
    this.setState((curState) => {
      let accordionsCopy = JSON.parse(JSON.stringify(curState.accordions));
      let toggleThis = accordionsCopy.find((ele) => ele.name === name);
      toggleThis.isOpen
        ? (toggleThis.isOpen = false)
        : (toggleThis.isOpen = true);
      return {
        accordions: accordionsCopy,
      };
    });
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

  toTitleCase = (str) => {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  searchforThisBird = (name) => {
    this.setState(
      () => {
        return { isLoading: true, showingResults: false, display: {} };
      },
      () => {
        this.fetchDetailsFromAPI(name);
        this.props.changeName(null);
      }
    );
  };

  onCropComplete = async () => {
    this.selectedImageHTML.src = await this.getCroppedImg(
      this.selectedImageHTML,
      this.state.crop,
      "newFile.jpeg"
    );
    this.handleImageSubmit();
    this.setState(() => {
      return {
        snackbarOpen: true,
        snackbarMessage: "Image Loaded!",
      };
    });
  };

  getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          //reject(new Error('Canvas is empty'));
          console.error("Canvas is empty");
          return;
        }
        blob.name = fileName;
        window.URL.revokeObjectURL(this.fileUrl);
        this.fileUrl = window.URL.createObjectURL(blob);
        resolve(this.fileUrl);
      }, "image/jpeg");
    });
  };

  handleCropCancel = () => {
    this.selectedImageHTML = null;
    this.setState(() => {
      return {
        selectedImageHTMLSrc: null,
      };
    });
  };

  render = () => {
    return (
      <div className="Identification">
        <Typography
          component="h1"
          variant="h2"
          className="Identification-Heading"
        >
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
            ListboxComponent={ListboxComponent}
            renderGroup={renderGroup}
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
                      <IconButton onClick={this.handleClickOnCameraIcon}>
                        <PhotoCameraIcon />
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

        <Dialog open={this.state.selectedImageHTMLSrc ? true : false}>
          <DialogTitle>Crop image</DialogTitle>
          <DialogContent>
            <div className="Identification-CropDialogContent">
              <Typography>
                Expected output: 1 of the 225 bird species (with highest
                probability) from the trained{" "}
                <a href="https://teachablemachine.withgoogle.com/models/-7mqg1t6m/">
                  Machine Learning Model
                </a>
                , which is being used to identify birds.
              </Typography>
              <ReactCrop
                crop={this.state.crop}
                onChange={(crop) => {
                  this.setState({ crop });
                }}
                src={this.state.selectedImageHTMLSrc}
                ruleOfThirds
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.handleCropCancel}>
              Cancel
            </Button>
            <Button color="primary" onClick={this.onCropComplete}>
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        <Backdrop open={this.state.isLoading} style={{ zIndex: 10 }}>
          {this.state.isLoading && <CircularProgress color="inherit" />}
        </Backdrop>

        {!this.state.showingResults && (
          <div className="Identification-Links">
            <Link to="/bird-identification/locations">
              <Button>Location-Wise Search</Button>
            </Link>
            <Button
              onClick={() => {
                this.props.changeName(this.state.featuredBird.name);
              }}
            >
              Featured bird: {this.state.featuredBird.commonNames[0]}
            </Button>

            <Link to="/bird-identification/credits">
              <Button>Credits</Button>
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
              <CardHeader
                title={`${this.state.display.title}`}
                subheader={
                  this.state.display.prediction
                    ? `Prediction: ${
                        this.state.display.prediction.className
                      }, ${this.state.display.prediction.probability * 100}%`
                    : ""
                }
              />
              <CardMedia
                image={
                  this.state.display.imageURL
                    ? this.state.display.imageURL
                    : placeholder
                }
                style={{ paddingTop: "56.25%", backgroundSize: "contain" }}
              />
              {this.state.display.audioURL && (
                <CardContent>
                  <AudioPlayer
                    src={`https:${this.state.display.audioURL}`}
                    volume={false}
                    width="inital"
                    variation="primary"
                    type="audio/mpeg"
                  />
                </CardContent>
              )}
              <CardContent>
                <Accordion
                  expanded={
                    this.state.accordions.find((ele) => ele.name === "Taxonomy")
                      .isOpen
                  }
                >
                  <AccordionSummary
                    onClick={() => this.handleAccordianToggle("Taxonomy")}
                    expandIcon={<ExpandMoreIcon />}
                  >
                    <Typography>Taxonomy</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>Scientific Name</TableCell>
                            <TableCell>
                              {this.toTitleCase(
                                this.state.display.taxonomy.scientific_name
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Kingdom</TableCell>
                            <TableCell>
                              {this.toTitleCase(
                                this.state.display.taxonomy.kingdom
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Phylum</TableCell>
                            <TableCell>
                              {this.toTitleCase(
                                this.state.display.taxonomy.phylum
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Class</TableCell>
                            <TableCell>
                              {this.toTitleCase(
                                this.state.display.taxonomy.class
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Order</TableCell>
                            <TableCell>
                              {this.toTitleCase(
                                this.state.display.taxonomy.order
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Family</TableCell>
                            <TableCell>
                              {this.toTitleCase(
                                this.state.display.taxonomy.family
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Genus</TableCell>
                            <TableCell>
                              {this.toTitleCase(
                                this.state.display.taxonomy.genus
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  expanded={
                    this.state.accordions.find(
                      (ele) => ele.name === "Geographic Range"
                    ).isOpen
                  }
                >
                  <AccordionSummary
                    onClick={() =>
                      this.handleAccordianToggle("Geographic Range")
                    }
                    expandIcon={<ExpandMoreIcon />}
                  >
                    <Typography>Geographic Range</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="Identification-GeographicRange">
                      <WorldMap
                        color="#1976d2"
                        data={this.state.display.geographicRange}
                        tooltipTextFunction={(countryName) => countryName}
                        strokeOpacity="100%"
                        size={
                          window.innerWidth >= 768
                            ? window.innerWidth >= 1920
                              ? "lg"
                              : "md"
                            : "sm"
                        }
                      />
                    </div>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  expanded={
                    this.state.accordions.find(
                      (ele) => ele.name === "Population"
                    ).isOpen
                  }
                >
                  <AccordionSummary
                    onClick={() => this.handleAccordianToggle("Population")}
                    expandIcon={<ExpandMoreIcon />}
                  >
                    <Typography>Population</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="Identification-Population">
                      <Typography>
                        Population Trend: {this.state.display.population.trend}
                      </Typography>
                      <Timeline align="alternate">
                        {this.state.display.population.timeline.map((year) => (
                          <TimelineItem key={year.year}>
                            <TimelineSeparator>
                              <Avatar variant="square">{year.year}</Avatar>
                            </TimelineSeparator>
                            <TimelineContent>
                              <Typography>{year.category}</Typography>
                            </TimelineContent>
                          </TimelineItem>
                        ))}
                      </Timeline>
                    </div>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  expanded={
                    this.state.accordions.find(
                      (ele) => ele.name === "Habitat and Ecology"
                    ).isOpen
                  }
                >
                  <AccordionSummary
                    onClick={() =>
                      this.handleAccordianToggle("Habitat and Ecology")
                    }
                    expandIcon={<ExpandMoreIcon />}
                  >
                    <Typography>Habitat and Ecology</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table>
                        <TableBody>
                          {this.state.display.habitats.map((habitat, index) => (
                            <TableRow key={index}>
                              <TableCell>{habitat}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>

                {this.state.display.threats.length !== 0 && (
                  <Accordion
                    expanded={
                      this.state.accordions.find(
                        (ele) => ele.name === "Threats"
                      ).isOpen
                    }
                  >
                    <AccordionSummary
                      onClick={() => this.handleAccordianToggle("Threats")}
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography>Threats</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer>
                        <Table>
                          <TableBody>
                            {this.state.display.threats.map((threat, index) => (
                              <TableRow key={index}>
                                <TableCell>{threat.title}</TableCell>
                                <TableCell>{threat.timing}</TableCell>
                                <TableCell>{threat.score}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                )}

                {this.state.display.actions.length !== 0 && (
                  <Accordion
                    expanded={
                      this.state.accordions.find(
                        (ele) => ele.name === "Conservation Actions"
                      ).isOpen
                    }
                  >
                    <AccordionSummary
                      onClick={() =>
                        this.handleAccordianToggle("Conservation Actions")
                      }
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography>Conservation Actions</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer>
                        <Table>
                          <TableBody>
                            {this.state.display.actions.map((action, index) => (
                              <TableRow key={index}>
                                <TableCell>{action}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                )}
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

export default Identification;
