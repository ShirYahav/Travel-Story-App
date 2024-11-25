import React, { useEffect, useState } from 'react';
import StoryModel from '../../Models/StoryModel';
import LocationModel from '../../Models/LocationModel';
import RouteModel from '../../Models/RouteModel';
import { generateFacebookPost } from '../../Services/AIService';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { TextField, Box, Typography, createTheme, ThemeProvider, Button } from '@mui/material';
import QuiltedMediaList from './QuiltedMediaList';

const theme = createTheme({
    palette: {
        primary: {
            main: "#B25E39",
        },
        secondary: {
            main: "#473D3A",
        },
        background: {
            default: "#f3f3f3",
        },
    },
    typography: {
        h3: {
            fontFamily: 'Georgia, "Times New Roman", Times, serif',
            marginTop: "30px",
            marginBottom: "15px",
            fontSize: "32px",
        },
        h6: {
            marginBottom: "20px",
        },
    },
});

const GeneratePost: React.FC = () => {

    const location = useLocation();
    const { story } = location.state as { story: StoryModel } || {};

    const [postContent, setPostContent] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [redirect, setRedirect] = useState<boolean>(false);

    useEffect(() => {
        if (!story) {
            setRedirect(true);
            return;
        }
        const fetchPostContent = async () => {
            setLoading(true);
            try {
                const prompt = createPromptForStory(story);
                const generatedContent = await generateFacebookPost(prompt);
                setPostContent(generatedContent);
                //setPostContent("test test")
            } catch (error) {
                console.error("Failed to generate post:", error);
                setPostContent("Could not generate post content.");
            } finally {
                setLoading(false);
            }
        };
        fetchPostContent();
    }, []);

    const getStoryPhotos = (story: StoryModel): string[] => {
        const allPhotos: string[] = [];
        story.locations.forEach((location) => {
          const stringPhotos = location.photos.filter((photo): photo is string => typeof photo === "string");
          allPhotos.push(...stringPhotos);
        });
        return allPhotos;
    };

    const getStoryVideos = (story: StoryModel): string[] => {
        const allVideos: string[] = [];
        story.locations.forEach((location) => {
          const stringVideos = location.videos.filter((video): video is string => typeof video === "string");
          allVideos.push(...stringVideos);
        });
        return allVideos;
    };

    if (redirect) {
        return <Navigate to="/" />;
    }

    function summarizeLocation(location: LocationModel): string {
        return `
        Location: ${location.city}, ${location.country}
        Dates: ${location.startDate} - ${location.endDate}
        Cost: ${location.cost} ${location.currency}
        Summarize: ${location.story}...`;
    }

    function summarizeRoute(route: RouteModel): string {
        return `Route: Traveled from ${route.origin} to ${route.destination} via ${route.transportType}. Duration: ${route.duration} mins. (write the route near the relevant location)`;
    }

    function createPromptForStory(story: StoryModel): string {
        const locationSummaries: string[] = [];

        for (let i = 0; i < story.locations.length; i++) {
            locationSummaries.push(summarizeLocation(story.locations[i]));
        }

        if (story.routes.length > 0) {
            for (let i = 0; i < story.routes.length; i++) {
                locationSummaries.push(summarizeRoute(story.routes[i]));
            }
        }
        return `
        Create a social media post for this travel story:
        Title: ${story.title}
        Total Budget: ${story.budget} ${story.currency}
        Travel Dates: ${story.startDate} - ${story.endDate}
        
        Journey Highlights:
        ${locationSummaries.join('\n\n')}
    `;
    }

    const handleShareOnFacebook = () => {
        const shareURL = window.location.href; 
        const facebookShareURL = `https://www.facebook.com/dialog/share?app_id=1088953099351523&href=${encodeURIComponent(shareURL)}&quote=${encodeURIComponent(postContent)}&display=popup`;

        window.open(facebookShareURL, "Share on Facebook", "width=600,height=400");
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ p: 3 }}>
                <Link className="backLink" to={`/story/${story._id}`}>Back</Link>
                <Typography variant="h3" color="secondary">
                    Preview and Edit Your Post
                </Typography>

                {loading ? (
                    <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 4 }}>
                        <Typography variant="h6" color="textSecondary">
                            Generating a post for you...
                        </Typography>
                    </Box>
                ) : (
                    <TextField
                        label="Post Content"
                        multiline
                        rows={17}
                        variant="outlined"
                        value={postContent}
                        fullWidth
                        onChange={(e) => setPostContent(e.target.value)}
                        sx={{ mt: 3 }}
                    />
                )}

                <QuiltedMediaList photos={getStoryPhotos(story)} videos={getStoryVideos(story)} />

                {/* <Button variant="contained" color="secondary" style={{ marginTop: "20px" }} onClick={handleShareOnFacebook}>
                    Publish on Facebook
                </Button> */}
            </Box>
        </ThemeProvider>
    );
}

export default GeneratePost;