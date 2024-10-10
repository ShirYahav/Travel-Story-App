import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Slideshow.css";

import cambodia from "../../assets/slideshowPhotos/Cambodia.jpg";
import Japan from "../../assets/slideshowPhotos/Japan.jpg";
import Galapagos from "../../assets/slideshowPhotos/Galapagos.jpg";
import Vietnam from "../../assets/slideshowPhotos/Vietnam.jpg";
import Peru from "../../assets/slideshowPhotos/Peru.jpg";
import { fetchCountriesAPI } from "../../Services/CountriesCitiesService";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import {
  Autocomplete,
  Button,
  createTheme,
  TextField,
  ThemeProvider,
} from "@mui/material";

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
});

const Slideshow: React.FC = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    arrows: false,
  };

  const images = [cambodia, Japan, Galapagos, Vietnam, Peru];
  
  const navigate = useNavigate();
  const [countries, setCountries] = useState<{ name: string; code: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chosenCountry, setChosenCountry] = useState<string>("");

  useEffect(() => {
    const getCountries = async () => {
      try {
        setIsLoading(true);
        const countryData = await fetchCountriesAPI();
        setCountries(countryData);
      } catch (error) {
        toast.error("Error fetching countries");
      } finally {
        setIsLoading(false);
      }
    };
    getCountries();
  }, []);

  const handleCountryChange = (event: any, value: string | null) => {
    if (value) {
      setChosenCountry(value);
    }
  };

  const submitCountry = () => {
    navigate(`/stories/${chosenCountry}`);
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="slideshowContainer">
        <div className="slideshowContainer">
          <form
            className="searchBarContainer"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <h2 className="getInspired">Get Inspired...</h2>
            <div className="inputAndButton">
              <Autocomplete
                options={countries.map((c) => c.name)}
                getOptionLabel={(option) => option}
                loading={isLoading}
                onChange={handleCountryChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Country"
                    size="small"
                    color="secondary"
                    sx={{
                      width: {
                        xs: "200px",
                        sm: "500px",
                      },
                      fontSize: "14px",
                      borderRadius: "8px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                    }}  
                  />
                )}
              />
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                onClick={submitCountry}
                sx={{
                  height: '40px',
                  borderRadius: "6px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                }}
              >
                Go
              </Button>
            </div>
          </form>
        </div>

        <Slider {...settings}>
          {images.map((image, index) => (
            <div key={index}>
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="slideshowImage"
              />
            </div>
          ))}
        </Slider>
      </div>
    </ThemeProvider>
  );
};

export default Slideshow;
