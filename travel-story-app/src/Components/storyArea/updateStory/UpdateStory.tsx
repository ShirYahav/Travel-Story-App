import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  createTheme,
  MenuItem,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import UpdateLocations from "./updateLocations/UpdateLocations";
import UpdateRoutes from "./updateRoutes/UpdateRoutes";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import LocationModel from "../../../models/LocationModel";
import StoryModel from "../../../models/StoryModel";
import RouteModel from "../../../models/RouteModel";
import { getDateRangeFromLocations } from "../../../services/DateService";
import { extractCountriesFromLocations } from "../../../services/CountriesCitiesService";
import { useParams } from "react-router-dom";
import axios from "axios";
import { calculateTotalBudget } from "../../../services/CurrencyCostService";


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
  { value: "USD", label: "$" },
  { value: "EUR", label: "€" },
  { value: "BTC", label: "฿" },
  { value: "JPY", label: "¥" },
];

const parseDate = (date: string | Date | null): Date | null => {
  if (typeof date === "string") {
    return new Date(date); 
  }
  return date;
};

const convertLocations = (locations: any[]): LocationModel[] => {
  return locations.map((location) => ({
    ...location,
    startDate: parseDate(location.startDate),
    endDate: parseDate(location.endDate),
  }));
};

const convertStory = (story: any): StoryModel => {
  return {
    ...story,
    startDate: parseDate(story.startDate),
    endDate: parseDate(story.endDate),
    locations: convertLocations(story.locations),
  };
};

const UpdateStory: React.FC = () => {
  
  const [step, setStep] = useState(1);
  const { storyId } = useParams<{ storyId: string }>();
  const [story, setStory] = useState<StoryModel | undefined>();
  const [locations, setLocations] = useState<LocationModel[]>([]);
  const [routes, setRoutes] = useState<RouteModel[]>([]); 

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/story/${storyId}`);
        const fetchedStory = convertStory(response.data); // Convert fetched story
        setStory(fetchedStory);
        setLocations(fetchedStory.locations); // Set the locations based on the story
        setRoutes(fetchedStory.routes || []); // Set routes if available
      } catch (error) {
        console.error(error);
      }
    };
    fetchStory();
  }, [storyId]);

  useEffect(() => {
    if (story) {
      setStory({
        ...story,
        locations: [...locations], // Update the story with the new locations
      });
    }
  }, [locations]);

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
  
  const handleUpdateStory = async () => {
    try {
      const { user, _id, ...storyWithoutIdAndUser } = story;
  
      const storyToUpdate = {
        ...storyWithoutIdAndUser,
        startDate: story.startDate ? new Date(story.startDate).toISOString() : null,
        endDate: story.endDate ? new Date(story.endDate).toISOString() : null,
        
        locations: locations.map((location) => {
          const { _id, photos, videos, ...locationWithoutId } = location;
  
          return {
            ...(location._id && location._id !== '' ? { _id: location._id } : {}),
            ...locationWithoutId,
            startDate: location.startDate ? new Date(location.startDate).toISOString() : null,
            endDate: location.endDate ? new Date(location.endDate).toISOString() : null,
          };
        }),
  
        routes: routes.map((route) => {
          const { _id, ...routeWithoutId } = route;
          return {
            ...(route._id && route._id !== '' ? { _id: route._id } : {}),
            ...routeWithoutId,
          };
        })
      };
  
      const response = await axios.put(
        `http://localhost:3001/api/update-story/${storyId}`,
        storyToUpdate
      );
  
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  
  if (!story) {
    return <p>Loading...</p>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3 }}>
        {step === 1 && (
          <Box>
            <UpdateLocations  locations={locations} setLocations={setLocations}/>
            <Button
              variant="contained"
              onClick={() => {
                handleNext();
                const dateRange = getDateRangeFromLocations(locations);
                console.log(dateRange);
                setStory({
                  ...story,
                  countries: extractCountriesFromLocations(locations),
                  startDate: dateRange.earliestDate,
                  endDate: dateRange.latestDate,
                });
                console.log(story)
              }}
              color="secondary"
            >
              Save locations and continue
            </Button>
          </Box>
        )}

        {step === 2 && (
          <Box>
            <UpdateRoutes  routes={routes} setRoutes={setRoutes}/>
            <div className="step2Buttons">
              <Button variant="outlined" onClick={handleBack} color="secondary">
                Back
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
            <Typography variant="h3" color="secondary">
              Update Story Summary
            </Typography>
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
                onChange={(e) => setStory({ ...story, title: e.target.value })}
                size="small"
                sx={{ mt: 2, mb: 2 }}
              />
              <TextField
                label="Summary"
                fullWidth
                multiline
                rows={2}
                value={story.description}
                onChange={(e) => setStory({ ...story, description: e.target.value })}
                sx={{ mb: 2 }}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={story.startDate}
                  onChange={(date) => setStory({ ...story, startDate: date })}
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
                  onChange={(date) => setStory({ ...story, endDate: date })}
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
                onChange={(e) => setStory({ ...story, budget: +e.target.value })}
                size="small"
                sx={{ mt: 2, mb: 2 }}
              />

              <TextField
                id="outlined-select-currency"
                select
                label="Select"
                fullWidth
                value={story.currency}
                onChange={(e) => setStory({ ...story, currency: e.target.value })}
                size="small"
                helperText="Please select your currency"
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
                onClick={handleUpdateStory}
                color="secondary"
              >
                Update Story
              </Button>
            </div>
          </div>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default UpdateStory;
