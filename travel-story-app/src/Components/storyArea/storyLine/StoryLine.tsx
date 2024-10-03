import React, { useEffect, useState } from 'react';
import './StoryLine.css';
import plane from '../../../assets/SVGs/flight-date.png';
import budgetIcon from '../../../assets/SVGs/money-bag.png';
import StoryModel from '../../../models/StoryModel';
import { calculateDaysDifference } from '../../../services/DateService';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface StoryLineProps {
  story: StoryModel;
}

const StoryLine: React.FC<StoryLineProps> = ({story}) => {

    const navigate = useNavigate();
    const duration = calculateDaysDifference(story.startDate, story.endDate);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
      const fetchFirstPhoto = async () => {
        try {

          const firstPhotoFileName = story?.locations?.[0]?.photos?.[0];
          const response = await axios.get(`http://localhost:3001/api/story/photo/${firstPhotoFileName}`, { responseType: "blob" });
          const imageObjectUrl = URL.createObjectURL(response.data);
          setImageUrl(imageObjectUrl);
        
        } catch (error) {
          console.log(error); 
        }
      }
      fetchFirstPhoto();
    },[]);

    const storyClicked = () => {
      navigate(`/story/${story._id}`);
    }

    return (
      <>
        <div className="storyLine" onClick={storyClicked}>
          <div className="storyImgLine">
            <img src={imageUrl} alt="Story location photo" />
          </div>
          <div className="textContainerLine">
            <h3 className="storyTitleLine">{story.title}</h3>
            <hr className="hrStoryTitleLine"></hr>
            <p className="storyDescriptionLine">{story.description}</p>
            <p className="budget"><img src={budgetIcon} />Budget: {story.budget} {story.currency}</p>
            <p className="duration"> <img src={plane} />Duration: {duration} days</p>
          </div>
          <p className="byUserLine">By: {story.user.firstName} {story.user.lastName}</p>
        </div>
      </>
    );
}

export default StoryLine;