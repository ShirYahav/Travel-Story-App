import React from "react";
import { Modal, Box, CircularProgress, Typography, createTheme } from "@mui/material";
import animationTravel from '../../../Assets/animations/Animation-travel.gif';

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
            marginTop: "50px",
            fontSize: "32px",
        },
        h6: {
            marginBottom: "20px",
        },
    },
});

const LoadingOverlayAddStory = ({
    isLoading,
    loadingText,
}: {
    isLoading: boolean;
    loadingText: string;
}) => {
    return (
        <Modal open={isLoading} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box
                sx={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "30px",
                    textAlign: "center",
                    boxShadow: 24,
                }}
            >

                <Typography variant="h3" sx={{ mt: 2 }} color="secondary">
                    {loadingText}
                </Typography>
                <img src={animationTravel} style={{ height: "200px", width: "200px" }} alt="Travel Animation" />
            </Box>
        </Modal>
    );
};

export default LoadingOverlayAddStory;
