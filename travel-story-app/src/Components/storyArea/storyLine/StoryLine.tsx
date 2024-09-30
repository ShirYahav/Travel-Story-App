import React from 'react';
import './StoryLine.css';
import plane from '../../../assets/SVGs/flight-date.png';
import StoryModel from '../../../models/StoryModel';

interface StoryLineProps {
  story: StoryModel;
}

const StoryLine: React.FC<StoryLineProps> = ({story}) => {
    return (
      <>
        <div className="storyLine">
          <div className="storyImgLine">
            {/* <img src={story.locations[0].photos[0]} /> */}
          </div>
          <div className="textContainerLine">
            <h3 className="storyTitleLine">{story.title}</h3>
            <hr className='hrStoryTitleLine'></hr>
            <p className="storyDescriptionLine">{story.description}</p>
            <p className='duration'> <img src={plane}/> Duration: 40 days</p>
          </div>
          <p className="byUserLine">By: {story.user}</p>
        </div>
      </>
    );
}

export default StoryLine;