import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { Box } from '@mui/material';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface QuiltedMediaListProps {
  mediaData: MediaItem[];
}

const QuiltedMediaList: React.FC<QuiltedMediaListProps> = ({ mediaData }) => {
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
          sm: 'repeat(3, 1fr)', 
          md: 'repeat(4, 1fr)', 
          lg: 'repeat(5, 1fr)', 
          xl: 'repeat(6, 1fr)', 
        },
      }}
    >
      {mediaData.map((item, index) => (
        <Box key={index} sx={{ width: '100%'}}>
          {item.type === 'image' ? (
            <img
              src={item.url}
              alt={`media-${index}`}
              loading="lazy"
              style={{ width: '100%', height: '230px', objectFit: 'cover', borderRadius: '8px' }}
            />
          ) : (
            <video
              src={item.url}
              controls
              style={{ width: '100%', height: '230px', objectFit: 'cover', borderRadius: '8px' }}
            />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default QuiltedMediaList;
