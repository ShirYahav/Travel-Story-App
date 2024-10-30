import React, { useEffect, useState } from 'react';
import './StoriesByCountry.css';
import whitePlus from '../../../Assets/SVGs/white-plus.png';
import StoriesCollection from '../storiesCollection/StoriesCollection';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import StoryModel from '../../../Models/StoryModel';
import config from '../../../Utils/Config';
import { createTheme, TextField, ThemeProvider } from '@mui/material';
import { calculateDaysDifference } from '../../../Services/DateService';

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
      marginTop: "50px",
      fontSize: "32px",
    },
    h6: {
      marginBottom: "20px",
    },
  },
});

const StoriesByCountry: React.FC = () => {
  const { country } = useParams<{ country: string }>();
  const [stories, setStories] = useState<StoryModel[]>([]);
  const [filteredStories, setFilteredStories] = useState<StoryModel[]>([]);
  const [budgetFilter, setBudgetFilter] = useState<number | null>(null);
  const [durationFilter, setDurationFilter] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get(config.getStoriesByCountryUrl + country);
        setStories(response.data);
      } catch (error) {
        console.error(error)
      }
    };
    if (country) {
      fetchStories();
    }
  }, [country]);

  useEffect(() => {
    const filtered = stories.filter(story => {
      const meetsBudget = budgetFilter ? story.budget <= budgetFilter : true;
      const meetsDuration = durationFilter 
        ? calculateDaysDifference(story.startDate, story.endDate) <= durationFilter 
        : true;
      return meetsBudget && meetsDuration;
    });
    setFilteredStories(filtered);
  }, [stories, budgetFilter, durationFilter]);

  const handleBudgetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value ? parseInt(event.target.value) : null;
    setBudgetFilter(value);
  };

  const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value ? parseInt(event.target.value) : null;
    setDurationFilter(value);
  };

  const navAddStoryButton = () =>{
    navigate('/add-story')
  }

  return (
    <ThemeProvider theme={theme}>
    <div className="storiesByCountry">
      <h1 className="countryHeadline">{country}</h1>

      <div className="filterContainer">
        <TextField
          label="Max Budget"
          type="number"
          variant="outlined"
          placeholder="Enter max budget"
          onChange={handleBudgetChange}
          size='small'
          sx={{ margin: '8px', width: "300px"}}
        />
        <TextField
          label="Max Duration (days)"
          type="number"
          variant="outlined"
          placeholder="Enter max duration"
          onChange={handleDurationChange}
          size='small'
          sx={{ margin: '8px', width: "300px"}}
        />
      </div>
      
      {filteredStories.length === 0 ? (
        <div className="noStoriesMessage">
          <h5>Be the first one to share a story in {country}!</h5>
          <button className="addStory" onClick={navAddStoryButton}>
            <img src={whitePlus} alt="whitePlus" className="whitePlusIcon" /> Add Your Story
          </button>
        </div>
      ) : (
        <>
          <StoriesCollection stories={stories} />
        </>
      )}
    </div>
    </ThemeProvider>
  );
};

export default StoriesByCountry;
