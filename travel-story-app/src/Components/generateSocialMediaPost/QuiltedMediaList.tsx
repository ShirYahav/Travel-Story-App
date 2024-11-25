import * as React from 'react';
import { Box } from '@mui/material';
import Media from '../reusableComponents/Media';
import './QuiltedMediaList.css'

interface QuiltedMediaListProps {
  photos: string[];
  videos: string[];
}

const QuiltedMediaList: React.FC<QuiltedMediaListProps> = ({ photos, videos }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        justifyContent: 'center',
        width: '100%',
        marginTop: 2,
        gap: 1,
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)', 
          sm: 'repeat(4, 1fr)', 
          md: 'repeat(5, 1fr)', 
          lg: 'repeat(6, 1fr)', 
          xl: 'repeat(8, 1fr)', 
        },
      }}
    >

      {photos.map((photo, index) => (
        <Box key={index} sx={{ width: '100%'}}>
          <Media
            filename={photo}
            type="photo"
            id="quiltedPhoto"
            altText={`media-photo${index}`}
          />
        </Box>
      ))}
      {videos.map((video, index) => (
        <Box key={index} sx={{ width: '100%' }}>
          <Media
            filename={video}
            type="video"
            id="quiltedVideo"
            altText={`media-video${index}`}
          />
        </Box>
      ))}
    </Box>
  );
};

export default QuiltedMediaList;
