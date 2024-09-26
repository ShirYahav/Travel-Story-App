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

import axios from "axios";
import debounce from "lodash.debounce";
import "./AddLocations.css";

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
    h4: {
      fontFamily: 'Georgia, "Times New Roman", Times, serif',
      marginTop: "20px",
      fontSize: "30px",
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

interface Location {
  country: string;
  city: string;
  startDate: Date | null;
  endDate: Date | null;
  story: string;
  cost: number;
  currency: string;
  photos: FileList | null;
}

const AddLocations: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([
    {
      country: "",
      city: "",
      startDate: null,
      endDate: null,
      story: "",
      cost: 0,
      currency: "",
      photos: null,
    },
  ]);

  const [countries, setCountries] = useState<{ name: string; code: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("https://restcountries.com/v3.1/all");
        const countryData = response.data.map((country: any) => ({
          name: country.name.common,
          code: country.cca2, // ISO2 code
        }));
        setCountries(countryData);
      } catch (error) {
        console.error("Error fetching countries: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const fetchCities = debounce(async (countryCode: string, query: string) => {
    if (!query) return;
    try {
      setIsLoadingCities(true);
      const response = await axios.get(
        "https://wft-geo-db.p.rapidapi.com/v1/geo/cities",
        {
          headers: {
            "X-RapidAPI-Key":
              "cd2f1c50f7msh3684719070c89f5p1862a9jsnd05c79a916a5",
            "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
          },
          params: {
            countryIds: countryCode,
            namePrefix: query,
            limit: 10,
          },
        }
      );
      const cityNames = response.data.data.map((city: any) => city.city);
      setCities(cityNames);
    } catch (error) {
      console.error("Error fetching cities: ", error);
    } finally {
      setIsLoadingCities(false);
    }
  }, 300);

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
    fetchCities(selectedCountry.code, cityQuery);
  };

  const handleLocationChange = <K extends keyof Location>(
    index: number,
    field: K,
    value: Location[K]
  ) => {
    const updatedLocations = [...locations];
    updatedLocations[index][field] = value;
    setLocations(updatedLocations);
  };

  const addLocation = () => {
    setLocations([
      ...locations,
      {
        country: "",
        city: "",
        startDate: null,
        endDate: null,
        story: "",
        cost: 0,
        currency: "",
        photos: null,
      },
    ]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);

      if (selectedFiles.length + fileArray.length > 3) {
        setErrorMessage("You can only upload up to 3 images.");
      } else {
        const newFiles = [...selectedFiles, ...fileArray].slice(0, 3);
        setSelectedFiles(newFiles);
        setErrorMessage(null);
      }
    }
  };

  const handleDeleteImg = (index: number) => {
    const newFiles = selectedFiles.filter(
      (_, fileIndex) => fileIndex !== index
    );
    setSelectedFiles(newFiles);
    setErrorMessage(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Typography variant="h4" gutterBottom color="secondary">
          Add Your Travel Story
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
                xs: "100%",
                sm: "75%",
                md: "50%",
              },
              margin: "0 auto",
              marginTop: "30px",
            }}
          >
            <Typography variant="h6" color="secondary">
              Location {index + 1}
            </Typography>
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
                  value={location.city}
                  onInputChange={(event, newInputValue) =>
                    handleCityInputChange(
                      index,
                      location.country,
                      newInputValue
                    )
                  }
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
                    accept="image/*"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    id="upload-button"
                  />
                  <label htmlFor="upload-button">
                    <Button
                      variant="outlined"
                      fullWidth
                      color="primary"
                      component="span"
                      size="small"
                    >
                      Upload Images
                    </Button>
                  </label>

                  {errorMessage && (
                    <Typography
                      variant="body2"
                      color="error"
                      sx={{ marginTop: "5px", fontSize:'12px' }}
                    >
                      {errorMessage}
                    </Typography>
                  )}
                </div>

                <div className="imagePreview">
                  {selectedFiles.length > 0 &&
                    selectedFiles.map((file, index) => (
                      <div key={index} className="formImageDiv">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index}`}
                        />

                        <IconButton
                          onClick={() => handleDeleteImg(index)}
                          style={{
                            position: "absolute",
                            top: "-10px",
                            right: "-10px",
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

        <Button variant="contained" color="secondary" onClick={addLocation} size="small" style={{margin: '20px'}}>
          Add Another Location
        </Button>
      </Box>
    </ThemeProvider>
  );
};

export default AddLocations;
