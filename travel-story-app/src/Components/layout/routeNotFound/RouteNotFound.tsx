import React from 'react';
import './RouteNotFound.css';

const RouteNotFound: React.FC = () => {
  return (
    <div>
      <h5 className='pageNotFoundMessage'>Sorry, the page you are looking for does not exist :(</h5>
    </div>
  );
}

export default RouteNotFound;
