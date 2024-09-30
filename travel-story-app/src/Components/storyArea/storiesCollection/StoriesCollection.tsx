import React from 'react';
import StoryLine from '../storyLine/StoryLine';
import './storiesCollection.css';
import StoryModel from '../../../models/StoryModel';

interface StoriesCollectionProps {
  stories: StoryModel[];
}

const StoriesCollection: React.FC<StoriesCollectionProps> = ({ stories }) => {
  return (
    <div className="storyLinesContainer">
      {stories.map((story, index) => {
        const firstPhoto = story.locations.length > 0 && story.locations[0].photos.length > 0
          ? story.locations[0].photos[0]
          : 'https://via.placeholder.com/150'; // Fallback image

        return (
          <div key={index}>
            <StoryLine story={stories[index]}/>
          </div>
        );
      })}
    </div>
  );
};

export default StoriesCollection;
