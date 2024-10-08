import React from "react";
import Slider from "react-slick";
import StoryCard from "../storyCard/StoryCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./StoriesList.css";
import StoryModel from "../../../models/StoryModel";

interface StoriesListProps {
  stories: StoryModel[];
}

const StoriesList: React.FC<StoriesListProps> = ({ stories }) => {

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 10000,
    slidesToShow: 5,
    slidesToScroll: 5,
    initialSlide: 0,
    arrows: false,
    responsive: [
      {
        breakpoint: 1324,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          infinite: true,
          dots: true,
          autoplay: true,
          autoplaySpeed: 10000,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
          autoplay: true,
          autoplaySpeed: 10000,
        },
      },
      {
        breakpoint: 780,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
          autoplay: true,
          autoplaySpeed: 8000,
        },
      },
      {
        breakpoint: 520,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="sliderContainer">
      <Slider {...settings} className="storyCardsContainer">
        {stories.map((story, index) => {
          return (
            <div key={index}>
              <StoryCard story={story} />
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default StoriesList;
