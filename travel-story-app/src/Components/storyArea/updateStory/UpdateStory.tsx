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
import UpdateLocations from "./updateLocations/UpdateLocations";
import UpdateRoutes from "./updateRoutes/UpdateRoutes";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import LocationModel from "../../../models/LocationModel";
import StoryModel from "../../../models/StoryModel";
import RouteModel from "../../../models/RouteModel";
import { getDateRangeFromLocations } from "../../../services/DateService";
import { extractCountriesFromLocations } from "../../../services/CountriesCitiesService";

import fakeStory from "../story.json"; // Example JSON with date strings

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

  const [locations, setLocations] = useState<LocationModel[]>(
    convertLocations(fakeStory.locations)
  );

  const [routes, setRoutes] = useState<RouteModel[]>(fakeStory.routes);

  const [story, setStory] = useState<StoryModel>(convertStory(fakeStory));

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

  const handleUpdateStory = () => {
    console.log(story);
  };

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
            <UpdateRoutes  routes={routes} setRoutes={setRoutes}/>
            <div className="step2Buttons">
              <Button variant="outlined" onClick={handleBack} color="secondary">
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
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
