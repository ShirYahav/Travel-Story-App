import axios from "axios";
import LocationModel from "../Models/LocationModel";

export const fetchCountriesAPI = async () => {
    const response = await axios.get("https://restcountries.com/v3.1/all");
    return response.data.map((country: any) => ({
      name: country.name.common,
      code: country.cca2, // ISO2 code
    }));
};

export const fetchCitiesAPI = async (countryCode: string, query: string) => {
  if (!query) return [];

  const response = await axios.get(
    "https://wft-geo-db.p.rapidapi.com/v1/geo/cities",
    {
      headers: {
        "X-RapidAPI-Key": process.env.REACT_APP_RAPIDAPI_KEY, 
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
      },
      params: {
        countryIds: countryCode,
        namePrefix: query,
        limit: 10,
      },
    }
  );

  return response.data.data.map((city: any) => city.city);
};

export const fetchCitiesAPIWithoutCountry = async (query: string) => {
  if (!query) return [];
  
  const response = await axios.get(
    "https://wft-geo-db.p.rapidapi.com/v1/geo/cities",
    {
      headers: {
        "X-RapidAPI-Key": process.env.REACT_APP_RAPIDAPI_KEY, 
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
      },
      params: {
        namePrefix: query,
        limit: 10,
      },
    }
  );
  return response.data.data.map((city: any) => city.city);
};

export const extractCountriesFromLocations = (locations: LocationModel[]): string[] => {
  const countries = locations
    .map((location) => location.country) 
    .filter((country, index, self) => country && self.indexOf(country) === index); 

  return countries;
};

export async function getCityCoordinatesGoogle(city: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'Your_API_Key_Here';
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch coordinates for city: ${city}. Status: ${response.status}`);
      return null;
    }
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      console.warn(`No results found for city: ${city}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching coordinates for city: ${city}`, error);
    return null;
  }
}
  