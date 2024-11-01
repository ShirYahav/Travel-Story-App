import React, { useEffect, useState } from 'react';
import StoryModel from '../../Models/StoryModel';
import LocationModel from '../../Models/LocationModel';
import RouteModel from '../../Models/RouteModel';
import { generateFacebookPost } from '../../Services/AIService';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { TextField, CircularProgress, Box, Typography, createTheme, ThemeProvider, Button } from '@mui/material';
import axios from 'axios';
import config from '../../Utils/Config';
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

interface MediaItem {
    url: string;
    type: 'image' | 'video';
}

const GeneratePost: React.FC = () => {

    const location = useLocation();
    const { story } = location.state as { story: StoryModel } || {};

    const [postContent, setPostContent] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [redirect, setRedirect] = useState<boolean>(false);
    const [mediaData, setMediaData] = useState<MediaItem[]>([]);
    const [mediaLoading, setMediaLoading] = useState(true);

    useEffect(() => {
        if (!story) {
            setRedirect(true);
            return;
        }

        const fetchPostContent = async () => {
            setLoading(true);
            try {
                const prompt = createPromptForStory(story);
               //setPostContent(localStorage.getItem("postContent"))
                const generatedContent = await generateFacebookPost(prompt);
                setPostContent(generatedContent);
                //localStorage.setItem("postContent", generatedContent);
            } catch (error) {
                console.error("Failed to generate post:", error);
                setPostContent("Could not generate post content.");
            } finally {
                setLoading(false);
            }
        };

        const fetchLocationsMedia = async () => {
            try {
                setMediaLoading(true);
                const allMedia: MediaItem[] = [];

                for (const location of story.locations) {
                    let photos: string[] = [];
                    let videos: string[] = [];

                    try {
                        const photosResponse = await axios.get(config.getPhotosByLocationIdUrl + location._id);
                        photos = photosResponse.data.photos;
                    } catch (error) {
                        if (axios.isAxiosError(error) && error.response?.status !== 404) {
                            console.error("Error fetching photos:", error);
                        }
                    }

                    try {
                        const videosResponse = await axios.get(config.getVideosByLocationIdUrl + location._id);
                        videos = videosResponse.data.videos;
                    } catch (error) {
                        if (axios.isAxiosError(error) && error.response?.status !== 404) {
                            console.error("Error fetching videos:", error);
                        }
                    }

                    photos.forEach((photoUrl) => {
                        allMedia.push({ url: photoUrl, type: 'image' });
                    });

                    videos.forEach((videoUrl) => {
                        allMedia.push({ url: videoUrl, type: 'video' });
                    });
                }

                setMediaData(allMedia);
            } catch (error) {
                console.error("Error fetching location media:", error);
            } finally {
                setMediaLoading(false);
            }
        };
        fetchPostContent();
        fetchLocationsMedia();
    }, []);

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

                {mediaLoading ? (
                    <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <QuiltedMediaList mediaData={mediaData} />
                )}

                <Button variant="contained" color="secondary" style={{ marginTop: "20px" }}>
                    Publish on Facebook
                </Button>
            </Box>
        </ThemeProvider>
    );
}

export default GeneratePost;
