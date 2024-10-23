
class Config {

}

class DevelopmentConfig extends Config {
    public appUrl = "http://localhost:3001/"
    public userLoginUrl = "http://localhost:3001/api/auth/login/";
    public userRegisterUrl = "http://localhost:3001/api/auth/register/";
    public userValidationUrl = "http://localhost:3001/api/auth/me/";
    public uploadDataByLocationIdUrl = "http://localhost:3001/api/upload/";
    public getPhotoByImgNameUrl = "http://localhost:3001/api/story/photo/";
    public getPhotosByLocationIdUrl = "http://localhost:3001/api/story/photos/";
    public getVideosByLocationIdUrl = "http://localhost:3001/api/story/videos/";
    public getAllStoriesUrl = "http://localhost:3001/api/all-stories/";
    public getStoriesByCountryUrl = "http://localhost:3001/api/stories-by-country/";
    public addStoryUrl = "http://localhost:3001/api/add-story/";
    public updateStoryUrl = "http://localhost:3001/api/update-story/";
    public deleteStoryUrl = "http://localhost:3001/api/delete-story/";
    public getStoriesByUserUrl = "http://localhost:3001/api/stories-by-user/";
    public getStoryByStoryIdUrl = "http://localhost:3001/api/story/";
    public getTopStories = "http://localhost:3001/api/top-stories/";
    public likeStoryUrl = "http://localhost:3001/api/story/like/";
    public dislikeStoryUrl = "http://localhost:3001/api/story/dislike/";
    public getLikedStoriesByUserUrl = "http://localhost:3001/api/get-liked-stories/";
}

class ProductionConfig extends Config {
    public appUrl = "https://travelog-app-server.vercel.app/";
    public userLoginUrl = "https://travelog-app-server.vercel.app/api/auth/login/";
    public userRegisterUrl = "https://travelog-app-server.vercel.app/api/auth/register/";
    public userValidationUrl = "https://travelog-app-server.vercel.app/api/auth/me/";
    public uploadDataByLocationIdUrl = "https://travelog-app-server.vercel.app/api/upload/";
    public getPhotoByImgNameUrl = "https://travelog-app-server.vercel.app/api/story/photo/";
    public getPhotosByLocationIdUrl = "https://travelog-app-server.vercel.app/api/story/photos/";
    public getVideosByLocationIdUrl = "https://travelog-app-server.vercel.app/api/story/videos/";
    public getAllStoriesUrl = "https://travelog-app-server.vercel.app/api/all-stories/";
    public getStoriesByCountryUrl = "https://travelog-app-server.vercel.app/api/stories-by-country/";
    public addStoryUrl = "https://travelog-app-server.vercel.app/api/add-story/";
    public updateStoryUrl = "https://travelog-app-server.vercel.app/api/update-story/";
    public deleteStoryUrl = "https://travelog-app-server.vercel.app/api/delete-story/";
    public getStoriesByUserUrl = "https://travelog-app-server.vercel.app/api/stories-by-user/";
    public getStoryByStoryIdUrl = "https://travelog-app-server.vercel.app/api/story/";
    public getTopStories = "https://travelog-app-server.vercel.app/api/top-stories/";
    public likeStoryUrl = "https://travelog-app-server.vercel.app/api/story/like/";
    public dislikeStoryUrl = "https://travelog-app-server.vercel.app/api/story/dislike/";
    public getLikedStoriesByUserUrl = "https://travelog-app-server.vercel.app/api/get-liked-stories/";
}


const config = process.env.NODE_ENV === "development" ? new DevelopmentConfig() : new ProductionConfig();

export default config;