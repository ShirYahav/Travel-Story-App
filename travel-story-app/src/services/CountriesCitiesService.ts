import axios from "axios";

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
        "X-RapidAPI-Key": "cd2f1c50f7msh3684719070c89f5p1862a9jsnd05c79a916a5", // Use your actual API key here
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
  