import React, { useEffect, useState } from 'react';
import StoryLine from '../storyLine/StoryLine';
import './storiesCollection.css';
import StoryModel from '../../../Models-temp/StoryModel';

interface StoriesCollectionProps {
  stories: StoryModel[];
}

const StoriesCollection: React.FC<StoriesCollectionProps> = ({ stories }) => {
  const [storyList, setStoryList] = useState<StoryModel[]>([]);

  useEffect(() => {
    if (stories) {
      setStoryList(stories); 
    }
  }, [stories]);

  const handleDeleteStory = (storyId: string) => {
    setStoryList((prevStories) => prevStories.filter((story) => story._id !== storyId));
  };

  return (
    <div className="storyLinesContainer">
      {storyList.map((story, index) => {
        return (
          <div key={story._id}>
            <StoryLine key={story._id} story={story} onDeleteStory={handleDeleteStory}/>
          </div>
        );
      })}
    </div>
  );
};

export default StoriesCollection;
