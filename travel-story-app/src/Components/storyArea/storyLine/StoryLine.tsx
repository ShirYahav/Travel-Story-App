import React from 'react';
import './StoryLine.css';
import plane from '../../../assets/SVGs/flight-date.png';

interface StoryLineProps {
    title: string;
    description: string;
    username: string;
    photo: string;
}

const StoryLine: React.FC<StoryLineProps> = ({title, description, username, photo }) => {
    return (
      <>
        <div className="storyLine">
          <div className="storyImgLine">
            <img src={photo} />
          </div>
          <div className="textContainerLine">
            <h3 className="storyTitleLine">{title}</h3>
            <hr className='hrStoryTitleLine'></hr>
            <p className="storyDescriptionLine">{description}</p>
            <p className='duration'> <img src={plane}/> Duration: 40 days</p>
          </div>
          <p className="byUserLine">By: {username}</p>
        </div>
      </>
    );
}

export default StoryLine;