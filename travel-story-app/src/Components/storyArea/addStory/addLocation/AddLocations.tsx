import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  Button,
  MenuItem,
  Typography,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Cancel";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import debounce from "lodash.debounce";
import "./AddLocations.css";
import {
  fetchCitiesAPI,
  fetchCountriesAPI,
} from "../../../../services/CountriesCitiesService";
import CloseIcon from '@mui/icons-material/Close';
import LocationModel from "../../../../models/LocationModel";

//const rapidApiKey = process.env.RAPIDAPI_KEY;

const theme = createTheme({
  palette: {
    primary: {
      main: "#B25E39",
    },
    secondary: {
      main: "#473D3A",
    },
    background: {
      default: "#f3f3f3",
    },
  },
  typography: {
    h3: {
      fontFamily: 'Georgia, "Times New Roman", Times, serif',
      marginTop: "30px",
      fontSize: "32px",
    },
    h6: {
      marginBottom: "20px",
    },
  },
});

const currencies = [
  {
    value: "USD",
    label: "$",
  },
  {
    value: "EUR",
    label: "€",
  },
  {
    value: "BTC",
    label: "฿",
  },
  {
    value: "JPY",
    label: "¥",
  },
];

interface AddLocationsProps {
  locations: LocationModel[];
  setLocations: (locations: LocationModel[]) => void;
}

const AddLocations: React.FC<AddLocationsProps> = ({
  locations,
  setLocations,
}) => {
  const [countries, setCountries] = useState<{ name: string; code: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  useEffect(() => {
    const getCountries = async () => {
      try {
        setIsLoading(true);
        const countryData = await fetchCountriesAPI();
        setCountries(countryData);
      } catch (error) {
        console.error("Error fetching countries: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    getCountries();
  }, []);

  const handleFetchCities = debounce(
    async (countryCode: string, query: string) => {
      if (!query) return;
      try {
        setIsLoadingCities(true);
        const cityNames = await fetchCitiesAPI(countryCode, query);
        setCities(cityNames);
      } catch (error) {
        console.error("Error fetching cities in the component: ", error);
      } finally {
        setIsLoadingCities(false);
      }
    },
    300
  );

  const handleCountryChange = async (index: number, countryName: string) => {
    const selectedCountry = countries.find((c) => c.name === countryName);
    if (!selectedCountry) return;
    handleLocationChange(index, "country", countryName);
    handleLocationChange(index, "city", "");
  };

  const handleCityInputChange = (
    index: number,
    countryName: string,
    cityQuery: string
  ) => {
    const selectedCountry = countries.find((c) => c.name === countryName);
    if (!selectedCountry) return;
    handleFetchCities(selectedCountry.code, cityQuery);
  };

  const handleLocationChange = <K extends keyof LocationModel>(
    index: number,
    field: K,
    value: LocationModel[K]
  ) => {
    const updatedLocations = [...locations];
    updatedLocations[index][field] = value;
    setLocations(updatedLocations);
  };

  const addLocationForm = () => {
    setLocations([
      ...locations,
      {
        _id: "",
        country: "",
        city: "",
        startDate: null,
        endDate: null,
        story: "",
        cost: 0,
        currency: "",
        photos: [],
        videos: [],
      },
    ]);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      const newPhotos = filesArray.filter((file) =>
        file.type.startsWith("image/")
      );
      const newVideos = filesArray.filter((file) =>
        file.type.startsWith("video/")
      );

      const updatedLocations = [...locations];
      updatedLocations[index].photos = [
        ...(updatedLocations[index].photos || []),
        ...newPhotos,
      ];
      updatedLocations[index].videos = [
        ...(updatedLocations[index].videos || []),
        ...newVideos,
      ];

      setLocations(updatedLocations);
    }
  };

  const handleDeleteFile = (
    locationIndex: number,
    fileIndex: number,
    fileType: "photos" | "videos"
  ) => {
    const updatedLocations = [...locations];

    if (fileType === "photos") {
      const updatedPhotos = updatedLocations[locationIndex].photos.filter(
        (_, i) => i !== fileIndex
      );
      updatedLocations[locationIndex].photos = updatedPhotos;
    } else if (fileType === "videos") {
      const updatedVideos = updatedLocations[locationIndex].videos.filter(
        (_, i) => i !== fileIndex
      );
      updatedLocations[locationIndex].videos = updatedVideos;
    }

    setLocations(updatedLocations);
  };

  const deleteLocation = (index: number) => {
    const updatedLocations = locations.filter((_, i) => i !== index);
    setLocations(updatedLocations);
  };


  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Typography variant="h3" gutterBottom color="secondary">
          Add Locations
        </Typography>

        {locations.map((location, index) => (
          <Box
            key={index}
            sx={{
              mb: 4,
              p: 2,
              border: "1px solid #ddd",
              borderRadius: "8px",
              width: {
                xs: "90%",
                sm: "75%",
                md: "50%",
              },
              margin: "0 auto",
              marginTop: "30px",
              position: "relative",
            }}
          >
            <Typography variant="h6" color="secondary">
              Location {index + 1}
            </Typography>

            {index > 0 && (
            <IconButton
              aria-label="delete"
              onClick={() => deleteLocation(index)}
              sx={{ position: 'absolute', top: 5, right: 5 , color:'#473D3A'}}
            >
              <CloseIcon />
            </IconButton>
            )}

            <div>
              <div className="inputFieldAddForm">
                <Autocomplete
                  options={countries.map((c) => c.name)}
                  getOptionLabel={(option) => option}
                  loading={isLoading}
                  value={location.country}
                  onInputChange={(event, newInputValue) => {
                    handleCountryChange(index, newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Country"
                      fullWidth
                      size="small"
                    />
                  )}
                />
              </div>
              <div className="inputFieldAddForm">
                <Autocomplete
                  freeSolo
                  options={cities}
                  getOptionLabel={(option) => option}
                  loading={isLoadingCities}
                  openOnFocus={false}
                  value={locations[index].city}
                  onChange={(event, newValue) => {
                    handleLocationChange(index, "city", newValue || "");
                  }}
                  onInputChange={(event, newInputValue) => {
                    handleCityInputChange(
                      index,
                      locations[index].country,
                      newInputValue
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="City"
                      fullWidth
                      size="small"
                    />
                  )}
                />
              </div>

              <div className="inputFieldAddForm">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={location.startDate}
                    onChange={(date) =>
                      handleLocationChange(index, "startDate", date)
                    }
                    slotProps={{
                      textField: { fullWidth: true, size: "small" },
                    }}
                    format="dd/MM/yyyy"
                  />
                </LocalizationProvider>
              </div>

              <div className="inputFieldAddForm">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={location.endDate}
                    onChange={(date) =>
                      handleLocationChange(index, "endDate", date)
                    }
                    minDate={location.startDate || undefined}
                    slotProps={{
                      textField: { fullWidth: true, size: "small" },
                    }}
                    format="dd/MM/yyyy"
                  />
                </LocalizationProvider>
              </div>

              <div className="inputFieldAddForm">
                <TextField
                  label="Story"
                  value={location.story}
                  fullWidth
                  multiline
                  rows={4}
                  onChange={(e) =>
                    handleLocationChange(index, "story", e.target.value)
                  }
                />
              </div>

              <div className="inputFieldAddForm">
                <TextField
                  label="Cost"
                  type="number"
                  value={location.cost}
                  fullWidth
                  size="small"
                  onChange={(e) =>
                    handleLocationChange(
                      index,
                      "cost",
                      parseFloat(e.target.value)
                    )
                  }
                  inputProps={{
                    min: "1",
                  }}
                />
              </div>
              <div className="inputFieldAddForm">
                <TextField
                  id="outlined-select-currency"
                  select
                  label="Select"
                  fullWidth
                  defaultValue="EUR"
                  size="small"
                  helperText="Please select your currency"
                  value={location.currency}
                  onChange={(e) =>
                    handleLocationChange(index, "currency", e.target.value)
                  }
                >
                  {currencies.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              <Box>
                <div className="inputFieldAddForm">
                  <input
                    accept="image/*, video/*"
                    type="file"
                    multiple
                    onChange={(e) => handleFileChange(e, index)}
                    style={{ display: "none" }}
                    id={`upload-button-${index}`}
                  />
                  <label htmlFor={`upload-button-${index}`}>
                    <Button
                      variant="outlined"
                      fullWidth
                      color="primary"
                      component="span"
                      size="small"
                    >
                      Upload Images/Videos
                    </Button>
                  </label>
                </div>

                <div className="imagePreview">
                  {locations[index].photos.length > 0 &&
                    locations[index].photos.map((file, i) => (
                      <div key={i} className="formImageDiv">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${i}`}
                        />
                        <IconButton
                          onClick={() => handleDeleteFile(index, i, "photos")}
                          style={{
                            position: "absolute",
                            top: "0px",
                            right: "0px",
                            backgroundColor: "white",
                            borderRadius: "50%",
                            padding: "2px",
                          }}
                        >
                          <DeleteIcon
                            style={{ fontSize: "16px", color: "#B25E39" }}
                          />
                        </IconButton>
                      </div>
                    ))}
                </div>

                <div className="videoPreview">
                  {locations[index].videos.length > 0 &&
                    locations[index].videos.map((file, i) => (
                      <div key={i} className="formVideoDiv">
                        <video width="200" controls>
                          <source
                            src={URL.createObjectURL(file)}
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                        <IconButton
                          onClick={() => handleDeleteFile(index, i, "videos")}
                          style={{
                            position: "absolute",
                            top: "0px",
                            right: "0px",
                            backgroundColor: "white",
                            borderRadius: "50%",
                            padding: "2px",
                          }}
                        >
                          <DeleteIcon
                            style={{ fontSize: "16px", color: "#B25E39" }}
                          />
                        </IconButton>
                      </div>
                    ))}
                </div>
              </Box>
            </div>
          </Box>
        ))}

        <div className="addSaveLocationButtons">
          <Button
            variant="contained"
            color="primary"
            onClick={addLocationForm}
            size="medium"
          >
            Add Another Location
          </Button>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default AddLocations;
