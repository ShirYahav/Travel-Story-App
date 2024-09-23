import React from 'react';
import StoryLine from '../storyLine/StoryLine';
import './storiesCollection.css';

interface Story {
  username: string;
  title: string;
  description: string;
  locations: {
    city: string;
    country: string;
    lat: number;
    lng: number;
    startDate: string;
    endDate: string;
    photos: string[];
  }[];
}

interface StoriesCollectionProps {
  stories: Story[];
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
            <StoryLine
              title={story.title}
              description={story.description}
              username={story.username}
              photo={firstPhoto}
            />
          </div>
        );
      })}
    </div>
  );
};

export default StoriesCollection;
