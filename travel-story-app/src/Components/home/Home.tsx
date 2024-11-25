import React, { useEffect, useState } from "react";
import Slideshow from "./Slideshow";
import StoriesList from "../storyArea/storyList/StoriesList";
import "./Home.css";
import StoryModel from "../../Models/StoryModel";
import axios from "axios";
import toast from 'react-hot-toast';
import config from '../../Utils/Config'
import useStories from "../../Store/useStories";

const Home: React.FC = () => {
  const {getStories} = useStories(state => state)

  useEffect(() => {
    try { 
      getStories();
    } catch (error) {
      toast.error("error fetching stories");
    }
  }, []); 

  return (
    <>
      <div className="homeContainer">
        <Slideshow />
        <div>
          <h3 className="ourCommunity">Our Community</h3>
          <hr className="underlineOurCommunity"></hr>
          <p className="ourCommunityParagraph">
            Whether you’re exploring local gems or venturing across the globe,
            Travelog makes it easy to document and share your travel
            experiences with a community of fellow explorers. Start sharing your
            adventures today, and inspire others to discover new destinations!
          </p>
        </div>
        <div className="HomeStories">
          <h3 className="peopleTell">People Tell</h3>
          <hr className="underlinePeopleTell"></hr>
          <div>
            <StoriesList />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
