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
import { useNavigate } from 'react-router-dom';
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
    _id:null,
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
    likes:0,
  });

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

  const handleSkipRoutes = () => {
    setStep(step + 1);
    if (routes.length === 0) {
      setRoutes([]);
    }
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
      await axios.put(config.updateLocationMedia + locationId, {
        fileKey,
        mediaType // Can be 'photo' or 'video'
      });
    } catch (error) {
      console.error("Error updating location with media:", error);
      throw error;
    }
  };

  const handleUpload = async (locationId: string, locationPhotos: File[], locationVideos: File[]) => {
    try {
      // Upload photos
      for (const photo of locationPhotos) {
        // Step 1: Get presigned URL
        const { presignedUrl, key } = await getPresignedUrl(photo.name, photo.type, "photos", locationId);

        // Step 2: Upload the file to S3
        await uploadToS3(presignedUrl, photo);

        // Step 3: Update location with the media key
        await updateLocationMedia(locationId, key, "photo");
      }

      // Upload videos
      for (const video of locationVideos) {
        // Step 1: Get presigned URL
        const { presignedUrl, key } = await getPresignedUrl(video.name, video.type, "videos", locationId);

        // Step 2: Upload the file to S3
        await uploadToS3(presignedUrl, video);

        // Step 3: Update location with the media key
        await updateLocationMedia(locationId, key, "video");
      }
    } catch (error) {
      console.error("Error uploading files for location:", error);
      toast.error("Error uploading files for location");
    }
  };

  const handleCreateStory = async () => {
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
