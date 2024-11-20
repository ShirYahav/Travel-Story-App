import { Modal, Box, Typography, useMediaQuery } from "@mui/material";
import animationTravel from '../../../Assets/animations/Animation-travel.gif';

const LoadingOverlayAddStory = ({
    isLoading,
    loadingText,
}: {
    isLoading: boolean;
    loadingText: string;
}) => {

    const isSmallScreen = useMediaQuery("(max-width:600px)"); 

    return (
        <Modal open={isLoading} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box
                sx={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: isSmallScreen ? "20px" : "30px",
                    textAlign: "center",
                    boxShadow: 24,
                    width: isSmallScreen ? "50%" : "auto",
                }}
            >
                <Typography
                    variant={isSmallScreen ? "h6" : "h3"} 
                    sx={{ mt: 2 }}
                    color="secondary"
                >
                    {loadingText}
                </Typography>
                <img
                    src={animationTravel}
                    style={{
                        height: isSmallScreen ? "120px" : "200px",
                        width: isSmallScreen ? "120px" : "200px",
                    }}
                    alt="Travel Animation"
                />
            </Box>
        </Modal>
    );
};

export default LoadingOverlayAddStory;
