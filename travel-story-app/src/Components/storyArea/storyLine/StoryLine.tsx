import React, { useEffect, useState } from 'react';
import './StoryLine.css';
import plane from '../../../Assets/SVGs/flight-date.png';
import budgetIcon from '../../../Assets/SVGs/money-bag.png';
import StoryModel from '../../../Models/StoryModel';
import { calculateDaysDifference } from '../../../Services/DateService';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../Context/UserContext';
import brownTrash from '../../../Assets/SVGs/trash-bin-trash-brown.png';
import defaultStoryImg from '../../../Assets/defaults/default-story-img.jpg';
import toast from 'react-hot-toast';
import config from '../../../Utils/Config';
import { fetchFirstPhoto } from '../../../Services/MediaService';

interface StoryLineProps {
  story: StoryModel;
  onDeleteStory: (storyId: string) => void;
}

const StoryLine: React.FC<StoryLineProps> = ({ story, onDeleteStory }) => {

  const { user } = useUser();
  const navigate = useNavigate();
  const duration = calculateDaysDifference(story.startDate, story.endDate);
  const [imageUrl, setImageUrl] = useState<any>(defaultStoryImg);

  useEffect(() => {
    const loadImage = async () => {
      const firstPhoto = story?.locations?.[0]?.photos?.[0];
      if (firstPhoto) {
        const fileName = firstPhoto.toString().replace("photos/", "");
        const image = await fetchFirstPhoto(fileName, defaultStoryImg);
        setImageUrl(image);
      } else {
        setImageUrl(defaultStoryImg);
      }
    };

    loadImage();
  }, []);

  const storyClicked = () => {
    navigate(`/story/${story._id}`);
  }

  const deleteStoryLine = async (event: React.MouseEvent) => {

    event.stopPropagation();
    
    const confirmation = window.confirm("Are you sure you want to delete this story?");

    if (confirmation) {
      try {
        await axios.delete(config.deleteStoryUrl + story._id);
        onDeleteStory(story._id);
        toast.success("story deleted successfully")
      } catch (error) {
        console.error(error)
      }
    }
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
        <div className='lineBottomRight'>
          <p className="byUserLine">By: {story.user.firstName} {story.user.lastName}</p>
          {story?.user?._id === user?._id &&
            <button className="deleteStoryLineButton" onClick={deleteStoryLine}>
              <img className="deleteStoryLineIcon" src={brownTrash} />
            </button>}
        </div>
      </div>
    </>
  );
}

export default StoryLine;