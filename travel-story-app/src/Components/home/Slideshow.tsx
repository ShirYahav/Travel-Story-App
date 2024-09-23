import React from 'react';
import Slider from 'react-slick'; 
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Slideshow.css';

import cambodia from '../../assets/slideshowPhotos/Cambodia.jpg'
import Japan from '../../assets/slideshowPhotos/Japan.jpg'
import Galapagos from '../../assets/slideshowPhotos/Galapagos.jpg'
import Vietnam from '../../assets/slideshowPhotos/Vietnam.jpg'
import Peru from '../../assets/slideshowPhotos/Peru.jpg'


const Slideshow: React.FC = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    arrows: false
  };

  const images = [cambodia, Japan, Galapagos, Vietnam, Peru];

  return (
    <div className="slideshowContainer">

      <div className="searchBarContainer">
        <h2 className='getInspired'>Get Inspired...</h2>
        <input type="text" className="searchBar" placeholder="search any country" />
      </div>

      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index}>
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="slideshowImage"
            />
          </div>
        ))}
      </Slider>

    </div>
  );
};

export default Slideshow;
