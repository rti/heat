import React from 'react';

function OpenWeatherMap(props) {
  return (
    <div className="made-with">
      <a target="_blank" href="https://openweathermap.org/" rel="noreferrer">
        <img src="openweathermap.png" alt="openweathermap.org logo" style={{
          width: '15vw',
        }}/>
      </a>
    </div>
  );
}

export default OpenWeatherMap;
