import React from 'react';

interface WeatherCardProps {
  location: string;
  temperature: number;
  description: string;
  icon: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ location, temperature, description, icon }) => {
  return (
    <div className="weather-card">
      <h2>{location}</h2>
      <img src={`http://openweathermap.org/img/wn/${icon}.png`} alt={description} />
      <p>{description}</p>
      <h3>{temperature}°C</h3>
    </div>
  );
};

export default WeatherCard;
