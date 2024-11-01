import React, { useState } from "react";
import {
  Box,
  Button,
  createTheme,
  MenuItem,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import AddLocations from "./addLocation/AddLocations";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import AddRoutes from "./addRoutes/AddRoutes";
import LocationModel from "../../../Models/LocationModel";
import StoryModel from "../../../Models/StoryModel";
import RouteModel from "../../../Models/RouteModel";
import "./AddStory.css";
import { getDateRangeFromLocations } from "../../../Services/DateService";
import { extractCountriesFromLocations } from "../../../Services/CountriesCitiesService";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { calculateTotalBudget } from "../../../Services/CurrencyCostService";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../../Context/UserContext';
import toast from 'react-hot-toast';
import config from "../../../Utils/Config";

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

const AddStory: React.FC = () => {

  const navigate = useNavigate();

  const { user } = useUser();

  const [step, setStep] = useState(1);

  const [locations, setLocations] = useState<LocationModel[]>([
    {
      _id: '',
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
  const [routes, setRoutes] = useState<RouteModel[]>([
    {
      _id: "",
      origin: "",
      destination: "",
      transportType: "",
      duration: 0,
      note: "",
      cost: 0,
      currency: "",
    },
  ]);
  const [story, setStory] = useState<StoryModel>({
    _id: null,
    user: null,
    countries: [],
    title: "",
    description: "",
    startDate: null,
    endDate: null,
    budget: 0,
    currency: "",
    locations: [],
    routes: [],
    likes: 0,
  });

  const [validationLocationErrors, setValidationLocationErrors] = useState<{ [key: number]: { [key: string]: string } }>({});
  const [validationRouteErrors, setValidationRouteErrors] = useState<{ [key: number]: { [key: string]: string } }>({});
  const [validationErrors, setValidationErrors] = useState<{ title?: string; description?: string }>({});
  const [formErrorMessage, setFormErrorMessage] = useState<string>("");

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);

    if (routes.length === 0) {
      setRoutes([{
        _id: "",
        origin: "",
        destination: "",
        transportType: "",
        duration: 0,
        note: "",
        cost: 0,
        currency: "",
      }]);
    }
  };

  const isRouteEmpty = (route: RouteModel) => {
    return (
      !route._id &&
      !route.origin &&
      !route.destination &&
      !route.transportType &&
      route.duration === 0 &&
      !route.note &&
      route.cost === 0 &&
      !route.currency
    );
  };

  const shouldShowSkipButton = () => {
    return routes.length === 0 || (routes.length === 1 && isRouteEmpty(routes[0]));
  };

  const handleSkipRoutes = () => {
    setStep(step + 1);
    setRoutes([]);
    const budgetDetails = calculateTotalBudget(locations, routes);
    setStory({
      ...story,
      budget: budgetDetails.totalBudget,
      currency: budgetDetails.currency,
    });
  };

  const getPresignedUrl = async (fileName: string, fileType: string, folder: string, locationId: string) => {
    try {
      const response = await axios.post(config.getPreSignedUrl, {
        fileName,
        fileType,
        folder,
        locationId
      });

      return response.data;
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      throw error;
    }
  };

  const axiosS3Instance = axios.create({
  });

  const uploadToS3 = async (presignedUrl: string, file: File) => {
    try {

      await axiosS3Instance.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw error;
    }
  };

  const updateLocationMedia = async (locationId: string, fileKey: string, mediaType: string) => {
    try {
      await axios.put(config.addLocationMedia + locationId, {
        fileKey,
        mediaType
      });
    } catch (error) {
      console.error("Error updating location with media:", error);
      throw error;
    }
  };

  const handleUpload = async (locationId: string, locationPhotos: File[], locationVideos: File[]) => {
    try {
      for (const photo of locationPhotos) {
        const { presignedUrl, key } = await getPresignedUrl(photo.name, photo.type, "photos", locationId);
        await uploadToS3(presignedUrl, photo);
        await updateLocationMedia(locationId, key, "photo");
      }
      for (const video of locationVideos) {
        const { presignedUrl, key } = await getPresignedUrl(video.name, video.type, "videos", locationId);
        await uploadToS3(presignedUrl, video);
        await updateLocationMedia(locationId, key, "video");
      }
    } catch (error) {
      console.error("Error uploading files for location:", error);
      toast.error("Error uploading files for location");
    }
  };

  const handleCreateStory = async () => {
    if (validateForm()) {
      try {
        const storyToAdd = {
          ...story,
          user: user._id,
          startDate: story.startDate ? new Date(story.startDate).toISOString() : null,
          endDate: story.endDate ? new Date(story.endDate).toISOString() : null,
          locations: locations.map((location) => {
            const { _id, photos, videos, ...locationWithoutId } = location;
            return {
              ...locationWithoutId,
              startDate: location.startDate ? new Date(location.startDate).toISOString() : null,
              endDate: location.endDate ? new Date(location.endDate).toISOString() : null,
            };
          }),
          routes: routes.map(({ _id, ...routeWithoutId }) => ({
            ...routeWithoutId,
            duration: routeWithoutId.duration,
          })),
        };
        const storyResponse = await axios.post(config.addStoryUrl, storyToAdd);
        const savedStory = storyResponse.data.story;
        toast.success("Added Story Successfully")

        if (savedStory.locations && savedStory.locations.length > 0) {
          for (let i = 0; i < savedStory.locations.length; i++) {
            const locationId = savedStory.locations[i];

            if (locationId) {
              const locationPhotos = locations[i].photos || [];
              const locationVideos = locations[i].videos || [];

              await handleUpload(locationId, locationPhotos, locationVideos);
            }
          }
        } else {
          throw new Error("No locations found in saved story");
        }

        navigate(`/story/${savedStory._id}`);

      } catch (error) {
        console.error("Error adding story or uploading files:", error);
      }
    }
  };

  const validateLocations = () => {
    const errors: { [key: number]: { [key: string]: string } } = {};

    locations.forEach((location, index) => {
      const fieldErrors: { [key: string]: string } = {};

      if (!location.story || location.story.length < 5 || location.story.length > 4000) {
        fieldErrors.story = "Story must be between 5 and 500 characters";
      }

      if (location.cost && !location.currency) {
        fieldErrors.currency = "Currency is required when cost is provided";
      }

      if (!location.country) {
        fieldErrors.country = "Country is required";
      }

      if (!location.city) {
        fieldErrors.city = "City is required";
      }

      if (!location.startDate) {
        fieldErrors.startDate = "Start Date is required";
      }

      if (!location.endDate) {
        fieldErrors.endDate = "End Date is required";
      } else if (location.startDate && location.endDate < location.startDate) {
        fieldErrors.endDate = "End Date cannot be earlier than Start Date";
      }

      if (Object.keys(fieldErrors).length > 0) {
        errors[index] = fieldErrors;
      }
    });

    setValidationLocationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFormErrorMessage("Please fill in all required fields correctly.");
      return false;
    } else {
      setFormErrorMessage("");
      return true;
    }
  };

  const validateRoutes = () => {
    const errors: { [key: number]: { [key: string]: string } } = {};

    routes.forEach((route, index) => {
      const fieldErrors: { [key: string]: string } = {};

      if (!route.origin) {
        fieldErrors.origin = "Origin is required";
      }
      if (!route.destination) {
        fieldErrors.destination = "Destination is required";
      }
      if (!route.transportType) {
        fieldErrors.transportType = "Transport Type is required";
      }
      if (route.note && (route.note.length < 1 || route.note.length > 100)) {
        fieldErrors.note = "Note must be between 1 and 100 characters";
      }
      if (route.cost !== undefined && route.cost < 0) {
        fieldErrors.cost = "Cost must be positive (leave 0 if not interested)";
      }
      if (route.cost > 0 && !route.currency) {
        fieldErrors.currency = "Currency is required when cost is provided";
      }

      if (Object.keys(fieldErrors).length > 0) {
        errors[index] = fieldErrors;
      }
    });

    setValidationRouteErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFormErrorMessage("Please fill in all required fields correctly.");
      return false;
    } else {
      setFormErrorMessage("");
      return true;
    }
  };

  const validateField = (field: "title" | "description", value: string) => {
    const errors: { title?: string; description?: string } = { ...validationErrors };

    if (field === "title") {
      if (!value) {
        errors.title = "Title is required";
      } else if (value.length < 1 || value.length > 300) {
        errors.title = "300 characters max";
      } else {
        delete errors.title;
      }
    }

    if (field === "description") {
      if (!value) {
        errors.description = "Summary is required";
      } else if (value.length < 1 || value.length > 1000) {
        errors.description = "Summary must be between 1 and 300 characters";
      } else {
        delete errors.description;
      }
    }

    setValidationErrors(errors);
  };

  const validateForm = () => {
    const errors: { title?: string; description?: string } = {};

    if (!story.title) {
      errors.title = "Title is required";
    }
    if (story.title.length < 1 || story.title.length > 300) {
      errors.title = "300 characters max";
    }

    if (!story.description){
      errors.title = "Summary is required";
    }
    if (story.description.length < 1 || story.description.length > 1000) {
      errors.description = "1000 characters max";
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFormErrorMessage("Please fill out required fields.");
      return false;
    } else {
      setFormErrorMessage("");
      return true;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Link className='backLinkAddStory' to={`/`}>Back</Link>
      <Box sx={{ p: 3 }}>
        {step === 1 && (
          <Box>
            <AddLocations
              locations={locations}
              setLocations={setLocations}
              currencies={currencies}
              validationErrors={validationLocationErrors}
              setValidationErrors={setValidationLocationErrors}
            />
            {formErrorMessage && (
              <Typography color="error" sx={{ mt: 1, fontSize: '0.875rem', textAlign: 'center' }}>
                {formErrorMessage}
              </Typography>
            )}

            <Button
              variant="contained"
              onClick={() => {
                if (validateLocations()) {
                  handleNext();
                  const dateRange = getDateRangeFromLocations(locations);
                  setStory({
                    ...story,
                    countries: extractCountriesFromLocations(locations),
                    startDate: dateRange.earliestDate,
                    endDate: dateRange.latestDate,
                  });
                }
              }}
              color="secondary"
            >
              Save locations and continue
            </Button>
          </Box>
        )}

        {step === 2 && (
          <Box>
            <AddRoutes
              routes={routes}
              setRoutes={setRoutes}
              validationErrors={validationRouteErrors}
              setValidationErrors={setValidationRouteErrors}
            />
            {formErrorMessage && (
              <Typography color="error" sx={{ mt: 1, fontSize: '0.875rem', textAlign: 'center' }}>
                {formErrorMessage}
              </Typography>
            )}
            <div className="step2Buttons">
              <Button variant="outlined" onClick={handleBack} color="secondary">
                Back
              </Button>
              {shouldShowSkipButton() && (
                <Button
                  variant="outlined"
                  onClick={handleSkipRoutes}
                  color="secondary"
                >
                  Skip
                </Button>
              )}
              <Button
                variant="contained"
                onClick={() => {
                  if (validateRoutes()) {
                    handleNext();
                    const budgetDetails = calculateTotalBudget(locations, routes);
                    setStory({
                      ...story,
                      budget: budgetDetails.totalBudget,
                      currency: budgetDetails.currency,
                    });
                  }
                }}
                color="secondary"
              >
                Save Routes and continue
              </Button>
            </div>
          </Box>
        )}

        {step === 3 && (
          <div>
            <Typography variant="h3" color="secondary"> Story Summery </Typography>
            <Box
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
              }}
            >
              <TextField
                label="Story Title"
                fullWidth
                value={story.title}
                size="small"
                sx={{ mt: 2, mb: 2 }}
                required
                onChange={(e) => {
                  const value = e.target.value;
                  setStory({ ...story, title: value });
                  validateField("title", value);
                }}
                error={!!validationErrors.title}
                helperText={validationErrors.title}
              />
              <TextField
                label="Summery"
                fullWidth
                multiline
                rows={2}
                value={story.description}
                sx={{ mb: 2 }}
                required
                onChange={(e) => {
                  const value = e.target.value;
                  setStory({ ...story, description: value });
                  validateField("description", value);
                }}
                error={!!validationErrors.description}
                helperText={validationErrors.description}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={story.startDate}
                  defaultValue={story.startDate}
                  onChange={(newValue) => setStory({ ...story, startDate: newValue })}
                  slotProps={{
                    textField: { fullWidth: true, size: "small" },
                  }}
                  format="dd/MM/yyyy"
                />
              </LocalizationProvider>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={story.endDate}
                  defaultValue={story.endDate}
                  onChange={(newValue) => setStory({ ...story, endDate: newValue })}
                  slotProps={{
                    textField: { fullWidth: true, size: "small" },
                  }}
                  sx={{ marginTop: "15px" }}
                  format="dd/MM/yyyy"
                />
              </LocalizationProvider>

              <TextField
                label="Budget"
                fullWidth
                value={story.budget}
                defaultValue={story.budget}
                size="small"
                sx={{ mt: 2, mb: 2 }}
              />

              <TextField
                id="outlined-select-currency"
                select
                label="Select"
                fullWidth
                defaultValue={story.currency}
                size="small"
                helperText="Please select your currency"
                value={story.currency}
              >
                {currencies.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {formErrorMessage && (
              <Typography variant="body2" color="error" sx={{ mt: 2, textAlign: "center" }}>
                {formErrorMessage}
              </Typography>
            )}

            <div className="step3Buttons">
              <Button variant="outlined" onClick={handleBack} color="secondary">
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateStory}
                color="secondary"
              >
                Create Story
              </Button>
            </div>
          </div>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default AddStory;