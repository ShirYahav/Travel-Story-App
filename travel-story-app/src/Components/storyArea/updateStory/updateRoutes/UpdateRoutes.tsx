import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Autocomplete,
  MenuItem,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Cancel";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from '@mui/icons-material/Close';
import RouteModel from "../../../../Models-temp/RouteModel";
import debounce from "lodash.debounce";
import { fetchCitiesAPIWithoutCountry } from "../../../../Services-temp/CountriesCitiesService";

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
}

const UpdateRoutes: React.FC<AddRoutesProps>=({routes, setRoutes}) => {

  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  useEffect(() => {
    setRoutes(routes);
  }, []);

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
      console.error("Error fetching cities: ", error);
    } finally {
      setIsLoadingCities(false);
    }
  }, 300);

  const handleCityInputChange = (index: number, cityQuery: string) => {
    handleFetchCities(cityQuery); 
  };

  const handleDurationChange = (index: number, days: number, hours: number, minutes: number) => {
    const updatedRoutes = [...routes];
    const totalMinutes = days * 24 * 60 + hours * 60 + minutes;
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

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Typography variant="h3" gutterBottom color="secondary">
          Update Routes
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
             onClick={() => deleteRoute(index)}
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
                freeSolo
                options={cities}
                getOptionLabel={(option) => option}
                loading={isLoadingCities}
                value={route.origin || ""}
                onChange={(event, newValue) => {
                  handleRouteChange(index, "origin", newValue || "");
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
                  />
                )}
              />
            </div>

            <div className="inputFieldAddForm">
              <TextField
                id="outlined-select-currency"
                select
                label="Select"
                fullWidth
                size="small"
                helperText="Please select your transport types"
                value={route.transportType}
                onChange={(e) =>
                  handleRouteChange(index, "transportType", e.target.value)
                }
              >
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
                  onChange={(e) =>
                    handleRouteChange(index, "note", e.target.value)
                  }
                />
              </div>

            <div className="inputFieldAddForm">
              <TextField
                label="Cost"
                type="number"
                value={route.cost}
                fullWidth
                size="small"
                onChange={(e) =>
                  handleRouteChange(index,"cost",parseFloat(e.target.value))
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
                  defaultValue="EUR"
                  size="small"
                  helperText="Please select your currency"
                  value={route.currency}
                  onChange={(e) =>
                    handleRouteChange(index, "currency", e.target.value)
                  }
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

export default UpdateRoutes;
