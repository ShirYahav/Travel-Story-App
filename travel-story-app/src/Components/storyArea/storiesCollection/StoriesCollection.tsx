import React from 'react';
import StoryLine from '../storyLine/StoryLine';
import './storiesCollection.css';
import StoryModel from '../../../Models/StoryModel';

interface StoriesCollectionProps {
  stories: StoryModel[];
}

const StoriesCollection: React.FC<StoriesCollectionProps> = ({ stories }) => {
  return (
    <div className="storyLinesContainer">
      {stories.map((story, index) => {
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
