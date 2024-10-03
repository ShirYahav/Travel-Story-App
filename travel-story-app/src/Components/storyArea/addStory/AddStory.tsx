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
import LocationModel from "../../../models/LocationModel";
import StoryModel from "../../../models/StoryModel";
import RouteModel from "../../../models/RouteModel";
import "./AddStory.css";
import { formatDate, getDateRangeFromLocations } from "../../../services/DateService";
import { extractCountriesFromLocations } from "../../../services/CountriesCitiesService";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { calculateTotalBudget } from "../../../services/CurrencyCostService";
import axios from "axios";

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

  const [step, setStep] = useState(1);
  const [locations, setLocations] = useState<LocationModel[]>([
    {
      _id:'',
      country: "",
      city: "",
      startDate: null,
      endDate: null,
      story: "",
      cost: 0,
      currency: "",
      photos: [],
      videos:[],
    },
  ]);
  const [routes, setRoutes] = useState<RouteModel[]>([
    {
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
  });

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);

    if (routes.length === 0) {
      setRoutes([{
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

  const handleSkipRoutes = () => {
    setStep(step + 1);
    setRoutes([]);
  };

  const handleUpload = async (locationId: string, locationPhotos: File[], locationVideos: File[]) => {
    const formData = new FormData();
  
    locationPhotos.forEach((photo) => formData.append("photos", photo));
  
    locationVideos.forEach((video) => formData.append("videos", video));
  
    try {
      const uploadResponse = await axios.post(`http://localhost:3001/api/upload/${locationId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
    } catch (error) {
      console.error(`Error uploading files for location ${locationId}:`, error);
    }
  };
  
  
  const handleCreateStory = async () => {
    try {
      const storyToAdd = {
        ...story,
        user: "66fa6ffc84ca4d30b8864a7c",  // Assuming user ID is hardcoded for now
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
        routes: routes.map((route) => ({
          ...route,
          duration: route.duration,
        })),
      };
  
  
      const storyResponse = await axios.post("http://localhost:3001/api/add-story", storyToAdd);
      const savedStory = storyResponse.data;
  
      if (savedStory.locations && savedStory.locations.length > 0) {

        for (let i = 0; i < savedStory.locations.length; i++) {
          const locationId = savedStory.locations[i];
  
          if (locationId) {
  
            const locationPhotos = locations[i].photos || [];
            const locationVideos = locations[i].videos || []; 
            await handleUpload(locationId, locationPhotos, locationVideos);

          } else {
            console.error("Location ID is undefined");
          }
        }
      } else {
        throw new Error("No locations found in saved story");
      }

    } catch (error) {
      console.error("Error adding story or uploading files:", error);
    }
  };
  

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3 }}>
        {step === 1 && (
          <Box>
            <AddLocations locations={locations} setLocations={setLocations}/>
            <Button
              variant="contained"
              onClick={() => {
                handleNext();
                const dateRange = getDateRangeFromLocations(locations);
                setStory({
                  ...story,
                  countries: extractCountriesFromLocations(locations),
                  startDate: dateRange.earliestDate,
                  endDate: dateRange.latestDate,
                });
              }}
              color="secondary"
            >
              Save locations and continue
            </Button>
          </Box>
        )}

        {step === 2 && (
          <Box>
            <AddRoutes routes={routes} setRoutes={setRoutes} />
            <div className="step2Buttons">
              <Button variant="outlined" onClick={handleBack} color="secondary">
                Back
              </Button>
              <Button
                variant="outlined"
                onClick={handleSkipRoutes}
                color="secondary"
              >
                Skip
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  handleNext();
                  const budgetDetails = calculateTotalBudget(locations, routes);
                  setStory({
                    ...story,
                    budget: budgetDetails.totalBudget,
                    currency: budgetDetails.currency,
                  });
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
                onChange={(e) => setStory({ ...story, title: e.target.value })}
              />
              <TextField
                label="Summery"
                fullWidth
                multiline
                rows={2}
                value={story.description}
                sx={{ mb: 2 }}
                onChange={(e) => setStory({ ...story, description: e.target.value })}
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
