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
import { fetchCitiesAPI, fetchCountriesAPI } from "../../../../services/CountriesCitiesService";
import LocationModel from "../../../../models/LocationModel";

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

interface UpdateLocationsProps {
  locations: LocationModel[];
  setLocations: (locations: LocationModel[]) => void;
} 


const UpdateLocations: React.FC <UpdateLocationsProps> = ({locations, setLocations}) => {
  const [countries, setCountries] = useState<{ name: string; code: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleFetchCities = debounce(async (countryCode: string, query: string) => {
    if (!query) return;
    try {
      setIsLoadingCities(true);
      const cityNames = await fetchCitiesAPI(countryCode, query);
      setCities(cityNames);
    } catch (error) {
      console.error("Error fetching cities: ", error);
    } finally {
      setIsLoadingCities(false);
    }
  }, 300);

  const handleLocationChange = <K extends keyof LocationModel>(
    index: number,
    field: K,
    value: LocationModel[K]
  ) => {
    const updatedLocations = [...locations];
    updatedLocations[index][field] = value;
    setLocations(updatedLocations);
  };

  const handleDeleteLocation = (index: number) => {
    const updatedLocations = locations.filter((_, i) => i !== index);
    setLocations(updatedLocations);
  };

  const addLocationForm = () => {
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
        photos: [],
      },
    ]);
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

            {/* Delete Button */}
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
                  handleLocationChange(index, "country", newInputValue);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Country" fullWidth size="small" />
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
                  handleFetchCities(countries[index]?.code || "", newInputValue);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="City" fullWidth size="small" />
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
                onChange={(e) => handleLocationChange(index, "story", e.target.value)}
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
                  handleLocationChange(index, "cost", parseFloat(e.target.value))
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
                size="small"
                value={location.currency}
                onChange={(e) => handleLocationChange(index, "currency", e.target.value)}
              >
                {currencies.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </Box>
        ))}

        <div className="addSaveLocationButtons">
          <Button variant="contained" color="primary" onClick={addLocationForm} size="medium">
            Add Another Location
          </Button>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default UpdateLocations;
