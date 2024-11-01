import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  Button,
  MenuItem,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Cancel";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import debounce from "lodash.debounce";
import {
  fetchCitiesAPI,
  fetchCountriesAPI,
} from "../../../../Services/CountriesCitiesService";
import LocationModel from "../../../../Models/LocationModel";
import axios from "axios";
import config from "../../../../Utils/Config";

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

type CurrencyOption = {
  value: string;
  label: string;
};

// const currencies = [
//   { value: "USD", label: "$" },
//   { value: "EUR", label: "€" },
//   { value: "BTC", label: "฿" },
//   { value: "JPY", label: "¥" },
// ];

interface UpdateLocationsProps {
  locations: LocationModel[];
  setLocations: (locations: LocationModel[]) => void;
  currencies: CurrencyOption[];
  validationErrors: { [key: number]: { [key: string]: string } };
  setValidationErrors: React.Dispatch<React.SetStateAction<{ [key: number]: { [key: string]: string } }>>;
}

const UpdateLocations: React.FC<UpdateLocationsProps> = ({ locations, setLocations, currencies, validationErrors, setValidationErrors }) => {

  const [countries, setCountries] = useState<{ name: string; code: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [mediaLoading, setMediaLoading] = useState<boolean[]>(Array(locations.length).fill(true));
  const [originalMediaKeys, setOriginalMediaKeys] = useState<any>([]);

  useEffect(() => {
    const updatedLocations = locations.map((location) => ({
      ...location,
      startDate: new Date(location.startDate),
      endDate: new Date(location.endDate),
    }));

    setLocations(updatedLocations);

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

  useEffect(() => {
    const fetchAllLocationMedia = () => {
      const updatedLocationsPromises = locations.map((location, index) => {
        setMediaLoading((prev) => {
          const updatedLoading = [...prev];
          updatedLoading[index] = true;
          return updatedLoading;
        });

        return axios
          .all([
            axios.get(config.getPhotosByLocationIdUrl + location._id),
            axios.get(config.getVideosByLocationIdUrl + location._id),
          ])
          .then(([photosResponse, videosResponse]) => {
            setMediaLoading((prev) => {
              const updatedLoading = [...prev];
              updatedLoading[index] = false;
              return updatedLoading;
            });

            return {
              ...location,
              photos: photosResponse.data.photos,
              videos: videosResponse.data.videos,
            };
          });
      });

      Promise.all(updatedLocationsPromises)
        .then((updatedLocations) => {
          setLocations(updatedLocations);
        })
        .catch((error) => {
          console.error("Error fetching location media:", error);
        });
    };

    fetchAllLocationMedia();
  }, []);

  useEffect(() => {
    if (locations.length > 0 && originalMediaKeys.length === 0) {
      const mediaKeys = locations.map((location) => ({
        photos: [...location.photos],
        videos: [...location.videos],
      }));
      setOriginalMediaKeys(mediaKeys);
    }
  }, []);

  const handleFetchCities = debounce(
    async (countryCode: string, query: string) => {
      if (!query) return;
      try {
        setIsLoadingCities(true);
        const cityNames = await fetchCitiesAPI(countryCode, query);
        setCities(cityNames);
      } catch (error) {

      } finally {
        setIsLoadingCities(false);
      }
    },
    300
  );

  const handleLocationChange = <K extends keyof LocationModel>(
    index: number,
    field: K,
    value: LocationModel[K]
  ) => {
    const updatedLocations = [...locations];
    updatedLocations[index][field] = value;
    setLocations(updatedLocations);
  };

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

  const handleDeleteLocation = (index: number) => {
    const updatedLocations = locations.filter((_, i) => i !== index);
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

    const fileKey =
      fileType === "photos"
        ? originalMediaKeys[locationIndex].photos[fileIndex]
        : originalMediaKeys[locationIndex].videos[fileIndex];

    if (fileType === "photos") {
      const updatedPhotos = updatedLocations[locationIndex].photos.filter(
        (photo, i) => i !== fileIndex
      );
      updatedLocations[locationIndex] = {
        ...updatedLocations[locationIndex],
        photos: updatedPhotos,
      };
    } else if (fileType === "videos") {
      const updatedVideos = updatedLocations[locationIndex].videos.filter(
        (video, i) => i !== fileIndex
      );
      updatedLocations[locationIndex] = {
        ...updatedLocations[locationIndex],
        videos: updatedVideos,
      };
    }

    setLocations(updatedLocations);
    deleteMedia(updatedLocations[locationIndex]._id, fileKey, fileType);
  };

  const deleteMedia = async (locationId: string, fileKey: string, fileType: "photos" | "videos") => {
    try {
      await axios.delete(config.deleteLocationMediaUrl + locationId, {
        data: { fileKey, fileType },
      });
    } catch (error) {
      console.error("Error deleting media:", error);
    }
  };

  function base64ToBlobUrl(base64: string) {
    if (base64.startsWith("data:video/mp4;base64,")) {
      try {
        const byteString = atob(base64.split(",")[1]);
        const mimeType = base64.split(",")[0].split(":")[1].split(";")[0];
        const byteNumbers = new Array(byteString.length);

        for (let i = 0; i < byteString.length; i++) {
          byteNumbers[i] = byteString.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        return URL.createObjectURL(blob);
      } catch (error) {
        console.error("Failed to convert base64 to blob:", error);
        return "";
      }
    }
    return base64;
  }

  const validateField = (index: number, field: keyof LocationModel, value: any) => {
    const newErrors = { ...validationErrors };
    const fieldErrors: { [key: string]: string } = {};

    switch (field) {
      case "story":
        if (!value || value.length < 5 || value.length > 500) {
          fieldErrors.story = "Story must be between 5 and 500 characters";
        }
        break;
      case "cost":
        if (value < 0) {
          fieldErrors.cost = "Cost must be positive (leave 0 if not interested)";
        }
        break;
      case "currency":
        if (locations[index].cost > 0 && !value) {
          fieldErrors.currency = "Currency is required when cost is provided";
        }
        break;
      case "country":
        if (!value) {
          fieldErrors.country = "Country is required";
        }
        break;
      case "city":
        if (!value) {
          fieldErrors.city = "City is required";
        }
        break;
      case "startDate":
        if (!value) {
          fieldErrors.startDate = "Start Date is required";
        }
        break;
      case "endDate":
        if (!value) {
          fieldErrors.endDate = "End Date is required";
        } else if (locations[index].startDate && value < locations[index].startDate) {
          fieldErrors.endDate = "End Date cannot be earlier than Start Date";
        }
        break;
      default:
        break;
    }

    if (Object.keys(fieldErrors).length > 0) {
      newErrors[index] = { ...newErrors[index], ...fieldErrors };
    } else {
      if (newErrors[index]) {
        delete newErrors[index][field];
        if (Object.keys(newErrors[index]).length === 0) {
          delete newErrors[index];
        }
      }
    }
    setValidationErrors(newErrors);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Typography variant="h3" gutterBottom color="secondary">
          Update Locations
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
                onClick={() => handleDeleteLocation(index)}
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  borderRadius: "50%",
                  padding: "2px",
                }}
              >
                <DeleteIcon style={{ fontSize: "20px", color: "#B25E39" }} />
              </IconButton>
            )}

            <div className="inputFieldAddForm">
              <Autocomplete
                options={countries.map((c) => c.name)}
                getOptionLabel={(option) => option}
                loading={isLoading}
                value={location.country}
                onInputChange={(event, newInputValue) => {
                  handleCountryChange(index, newInputValue);
                  validateField(index, "country", newInputValue)
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Country"
                    fullWidth
                    size="small"
                    required
                    error={!!validationErrors[index]?.country}
                    helperText={validationErrors[index]?.country || ""}
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
                  validateField(index, "city", newValue)
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
                    required
                    error={!!validationErrors[index]?.city}
                    helperText={validationErrors[index]?.city || ""}
                  />
                )}
              />
            </div>

            <div className="inputFieldAddForm">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={location.startDate}
                  format="dd/MM/yyyy"
                  onChange={(date) => {
                    handleLocationChange(index, "startDate", date);
                    validateField(index, "startDate", date);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      required: true,
                      error: !!validationErrors[index]?.startDate,
                      helperText: validationErrors[index]?.startDate || "",
                    },
                  }}
                />
              </LocalizationProvider>
            </div>

            <div className="inputFieldAddForm">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={location.endDate}
                  onChange={(date) => {
                    handleLocationChange(index, "endDate", date);
                    validateField(index, "endDate", date);
                  }}
                  minDate={location.startDate || undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      required: true,
                      error: !!validationErrors[index]?.endDate,
                      helperText: validationErrors[index]?.endDate || "",
                    },
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
                required
                onChange={(e) => {
                  handleLocationChange(index, "story", e.target.value);
                  validateField(index, "story", e.target.value);
                }} error={!!validationErrors[index]?.story}
                helperText={validationErrors[index]?.story || "Enter a story between 5 and 4000 characters"}
              />
            </div>

            <div className="inputFieldAddForm">
              <TextField
                label="Cost"
                type="number"
                size="small"
                value={location.cost ?? ""}
                fullWidth
                onChange={(e) => {
                  const costValue = parseFloat(e.target.value) || 0;
                  handleLocationChange(index, "cost", costValue);
                  validateField(index, "cost", costValue);
                }}
                error={!!validationErrors[index]?.cost}
                helperText={validationErrors[index]?.cost || "Leave empty or 0 if not interested"}
              />
            </div>

            <div className="inputFieldAddForm">
              <TextField
                select
                label="Currency"
                size="small"
                fullWidth
                value={location.currency || ""}
                onChange={(e) => {
                  handleLocationChange(index, "currency", e.target.value);
                  validateField(index, "currency", e.target.value);
                }}
                error={!!validationErrors[index]?.currency}
                helperText={validationErrors[index]?.currency || "Please select a currency if cost is provided"}
              >
                {currencies.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            {mediaLoading[index] ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', marginRight: '17px' }}>
                <CircularProgress />
              </div>
            ) : (
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
                          src={
                            typeof file === "string"
                              ? file
                              : URL.createObjectURL(file)
                          }
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
                    locations[index].videos.map(
                      (file: string | File, i: number) => {
                        const videoSrc =
                          typeof file === "string"
                            ? base64ToBlobUrl(file)
                            : URL.createObjectURL(file);

                        return videoSrc ? (
                          <div key={i} className="formVideoDiv">
                            <video width="200" controls>
                              <source src={videoSrc} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                            <IconButton
                              onClick={() =>
                                handleDeleteFile(index, i, "videos")
                              }
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
                        ) : (
                          <p key={i}>Error loading video</p>
                        );
                      }
                    )}
                </div>
              </Box>
            )}
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

export default UpdateLocations; 