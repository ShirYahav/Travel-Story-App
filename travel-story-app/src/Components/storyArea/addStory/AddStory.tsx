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
      country: "",
      city: "",
      startDate: null,
      endDate: null,
      story: "",
      cost: 0,
      currency: "",
      photos: [],
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
    user: "",
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
    console.log(locations);
    console.log(routes);
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

  const handleCreateStory = () => {
    console.log(story);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3 }}>
        {step === 1 && (
          <Box>
            <AddLocations locations={locations} setLocations={setLocations} />
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
            <Typography variant="h3" color="secondary">
              {" "}
              Story Summery{" "}
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
                size="small"
                sx={{ mt: 2, mb: 2 }}
              />
              <TextField
                label="Summery"
                fullWidth
                multiline
                rows={2}
                value={story.description}
                sx={{ mb: 2 }}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={story.startDate}
                  defaultValue={story.startDate}
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
