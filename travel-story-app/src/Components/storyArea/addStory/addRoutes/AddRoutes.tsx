import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Autocomplete,
  MenuItem,
  IconButton,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from '@mui/icons-material/Close';
import RouteModel from "../../../../Models/RouteModel";
import debounce from "lodash.debounce";
import { fetchCitiesAPIWithoutCountry } from "../../../../Services/CountriesCitiesService";
import './AddRoutes.css';

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

const transportTypes = [
  { value: "car", label: "Car" },
  { value: "bus", label: "Bus" },
  { value: "train", label: "Train" },
  { value: "plane", label: "Plane" },
  { value: "bike", label: "Bike" },
];

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

const days = Array.from({ length: 31 }, (_, i) => i);
const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 60 }, (_, i) => i);

interface AddRoutesProps {
  routes: RouteModel[];
  setRoutes: (routes: RouteModel[]) => void;
  validationErrors: { [key: number]: { [key: string]: string } };
  setValidationErrors: React.Dispatch<React.SetStateAction<{ [key: number]: { [key: string]: string } }>>;
}

const AddRoutes: React.FC <AddRoutesProps> = ({routes, setRoutes, validationErrors, setValidationErrors}) => {
  
  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const deleteRoute = (index: number) => {
    const updatedRoutes = routes.filter((_, i) => i !== index);
    setRoutes(updatedRoutes);
  };

  const handleRouteChange = <K extends keyof RouteModel>(
    index: number,
    field: K,
    value: RouteModel[K]
  ) => {
    const updatedRoutes = [...routes];
    updatedRoutes[index][field] = value;
    setRoutes(updatedRoutes);
  };

  const handleFetchCities = debounce(async (query: string) => {
    if (!query) return;

    try {
      setIsLoadingCities(true);
      const cityNames = await fetchCitiesAPIWithoutCountry(query);
      setCities(cityNames);
    } catch (error) {
      
    } finally {
      setIsLoadingCities(false);
    }
  }, 300);

  const handleCityInputChange = (index: number, cityQuery: string) => {
    handleFetchCities(cityQuery); 
  };

  const handleDurationChange = (index: number, days: number, hours: number, minutes: number) => {
    const updatedRoutes = [...routes];
    const totalMinutes = days * 24 * 60 + hours * 60 + minutes; // Calculate total duration in minutes
    updatedRoutes[index].duration = totalMinutes;
    setRoutes(updatedRoutes);
  };

  const addNewRoute = () => {
    setRoutes([
      ...routes,
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
  };

  const validateField = (index: number, field: keyof RouteModel, value: any) => {
    const newErrors = { ...validationErrors };
    const fieldErrors: { [key: string]: string } = {};
  
    switch (field) {
      case "origin":
        if (!value) {
          fieldErrors.origin = "Origin is required";
        }
        break;
      case "destination":
        if (!value) {
          fieldErrors.destination = "Destination is required";
        }
        break;
      case "transportType":
        if (!value) {
          fieldErrors.transportType = "Transport Type is required";
        }
        break;
      case "note":
        if (value && (value.length < 1 || value.length > 100)) {
          fieldErrors.note = "Note must be between 1 and 100 characters";
        }
        break;
      case "cost":
        if (value < 0) {
          fieldErrors.cost = "Cost must be positive (leave 0 if not interested)";
        }
        break;
      case "currency":
        if (routes[index].cost > 0 && !value) {
          fieldErrors.currency = "Currency is required when cost is provided";
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
          Add Routes
        </Typography>

        {routes.map((route, index) => (
          <Box
            key={index}
            sx={{
              mb: 4,
              p: 2,
              border: "1px solid #ddd",
              borderRadius: "8px",
              position: 'relative',
              width: {
                xs: "90%",
                sm: "75%",
                md: "50%",
              },
              margin: "0 auto",
              marginTop: "30px",
            }}
          >
            <Typography variant="h6" color="secondary">
              Route {index + 1}
            </Typography>

            {index > 0 && (
            <IconButton
              aria-label="delete"
              onClick={() => deleteRoute(index)}
              sx={{ position: 'absolute', top: 5, right: 5 , color:'#473D3A'}}
            >
              <CloseIcon />
            </IconButton>
          )}

            <div className="inputFieldAddForm">
              <Autocomplete
                freeSolo
                options={cities}
                getOptionLabel={(option) => option}
                loading={isLoadingCities}
                value={route.origin || ""}
                onChange={(event, newValue) => {
                  handleRouteChange(index, "origin", newValue || "");
                  validateField(index, "origin", newValue);
                }}
                onInputChange={(event, newInputValue) => {
                  handleCityInputChange(index, newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="From (Origin)"
                    fullWidth
                    size="small"
                    required
                    error={!!validationErrors[index]?.origin}
                    helperText={validationErrors[index]?.origin || ""}
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
                value={route.destination || ""}
                onChange={(event, newValue) => {
                  handleRouteChange(index, "destination", newValue || "");
                  validateField(index, "destination", newValue)
                }}
                onInputChange={(event, newInputValue) => {
                  handleCityInputChange(index, newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="To (Destination)"
                    fullWidth
                    size="small"
                    required
                    error={!!validationErrors[index]?.destination}
                    helperText={validationErrors[index]?.destination || ""}
                  />
                )}
              />
            </div>

            <div className="inputFieldAddForm">
              <TextField
                id="outlined-select-currency"
                select
                label="Select Transport Type"
                fullWidth
                size="small"
                value={route.transportType}
                required
                error={!!validationErrors[index]?.transportType}
                helperText={validationErrors[index]?.transportType || ""}
                onChange={(e) => {
                  handleRouteChange(index, "transportType", e.target.value);
                  validateField(index, "transportType", e.target.value);
                }}
              >
                <MenuItem value="">
                  <em>Clear</em>
                </MenuItem>

                {transportTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </div>

          <div className="inputFieldAddForm">
            <Box display="flex" justifyContent="space-between">
              <TextField
                select
                label="Days"
                value={Math.floor(routes[index].duration / (24 * 60))} 
                defaultValue={0}
                size="small"
                onChange={(e) =>
                  handleDurationChange(index, parseInt(e.target.value), Math.floor((routes[index].duration % (24 * 60)) / 60), routes[index].duration % 60)
                }
                style={{ width: '30%' }} 
              >
                {days.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day} days
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Hours"
                value={Math.floor((routes[index].duration % (24 * 60)) / 60)} 
                size="small"
                onChange={(e) =>
                  handleDurationChange(index, Math.floor(routes[index].duration / (24 * 60)), parseInt(e.target.value), routes[index].duration % 60)
                }
                style={{ width: '30%' }} 
              >
                {hours.map((hour) => (
                  <MenuItem key={hour} value={hour}>
                    {hour} hours
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Minutes"
                value={routes[index].duration % 60} 
                size="small"
                onChange={(e) =>
                  handleDurationChange(index, Math.floor(routes[index].duration / (24 * 60)), Math.floor((routes[index].duration % (24 * 60)) / 60), parseInt(e.target.value))
                }
                style={{ width: '30%' }} 
              >
                {minutes.map((minute) => (
                  <MenuItem key={minute} value={minute}>
                    {minute} minutes
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </div>

            <div className="inputFieldAddForm">
                <TextField
                  label="Note"
                  value={route.note}
                  fullWidth
                  size="small"
                  onChange={(e) => {
                    handleRouteChange(index, "note", e.target.value)
                    validateField(index, "note", e.target.value);
                  }}
                  error={!!validationErrors[index]?.note}
                  helperText={validationErrors[index]?.note || ""}
                />
            </div>

            <div className="inputFieldAddForm">
              <TextField
                label="Cost"
                type="number"
                value={route.cost ?? ""}
                fullWidth
                size="small"
                onChange={(e) => {
                  const costValue = parseFloat(e.target.value) || 0;
                  handleRouteChange(index, "cost", costValue); 
                  validateField(index, "cost", costValue);
                }}
                error={!!validationErrors[index]?.cost}
                helperText={validationErrors[index]?.cost || "Leave empty or 0 if not interested"}
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
                  value={route.currency || ""}
                  onChange={(e) => {
                    handleRouteChange(index, "currency", e.target.value);
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
          </Box>
        ))}

        <div className="addRoutesButtons">
          <Button variant="contained" onClick={addNewRoute} color="primary">
            Add Another Route
          </Button>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default AddRoutes;
