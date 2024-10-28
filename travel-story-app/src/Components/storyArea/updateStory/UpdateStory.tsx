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
import LocationModel from "../../../Models/LocationModel";
import StoryModel from "../../../Models/StoryModel";
import RouteModel from "../../../Models/RouteModel";
import { getDateRangeFromLocations } from "../../../Services/DateService";
import { extractCountriesFromLocations } from "../../../Services/CountriesCitiesService";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { calculateTotalBudget } from "../../../Services/CurrencyCostService";
import toast from 'react-hot-toast';
import './UpdateStory.css';
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
  
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { storyId } = useParams<{ storyId: string }>();
  const [story, setStory] = useState<StoryModel | undefined>();
  const [locations, setLocations] = useState<LocationModel[]>([]);
  const [routes, setRoutes] = useState<RouteModel[]>([]); 

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await axios.get(config.getStoryByStoryIdUrl + storyId);
        const fetchedStory = convertStory(response.data);
        setStory(fetchedStory);
        setLocations(fetchedStory.locations); 
        setRoutes(fetchedStory.routes || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStory();
  }, []);

  useEffect(() => {
    if (story) {
      setStory({
        ...story,
        locations: [...locations], 
      });
    }
  }, []);

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

      console.log(response.data)
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

  const handleUpload = async (locationId: string, locationPhotos: Array<string | File>, locationVideos: Array<string | File>) => {
    try {
      const newPhotos = locationPhotos.filter((item): item is File => item instanceof File);
      const newVideos = locationVideos.filter((item): item is File => item instanceof File);
    
      const photoUploadPromises = [];
      const videoUploadPromises = [];
  
      if (newPhotos.length !== 0) {
        photoUploadPromises.push(
          ...newPhotos.map(async (photo) => {
            const { presignedUrl, key: fileKey } = await getPresignedUrl(photo.name, photo.type, 'photos', locationId);
            await uploadToS3(presignedUrl, photo);  
            await updateLocationMedia(locationId, fileKey, 'photo');
          })
        );
      }
      if (newVideos.length !== 0) {
        videoUploadPromises.push(
          ...newVideos.map(async (video) => {
            const { presignedUrl, key: fileKey } = await getPresignedUrl(video.name, video.type, 'videos', locationId);
            await uploadToS3(presignedUrl, video);
            await updateLocationMedia(locationId, fileKey, 'video');
          })
        );
      }
  
      await Promise.all([...photoUploadPromises, ...videoUploadPromises]);
  
    } catch (error) {
      console.error("Error during media upload:", error);
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

      await axios.put(config.updateStoryUrl + storyId, storyToUpdate);

      for (const location of locations) {
        if (location._id) {
          if (location.photos.length > 0 || location.videos.length > 0) {
            await handleUpload(location._id, location.photos, location.videos);
          }
        }
      }
      
      toast.success("Story Updated successfully")
      navigate(`/story/${story._id}`);
      
    } catch (error) {
      console.error(error);
    }
  };
  
  if (!story) {
    return <p>Loading...</p>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Link className='backLink' to={`/story/${storyId}`}>Back</Link>
      <Box sx={{ p: 3 }}>
        {step === 1 && (
          <Box>
            <UpdateLocations  locations={locations} setLocations={setLocations} />
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
              <Button variant="outlined" onClick={handleSkipRoutes} color="secondary">
                skip
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
