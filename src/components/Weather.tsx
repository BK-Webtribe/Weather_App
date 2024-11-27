import React, { useEffect, useState } from 'react'
import '../styles/app.css'
import search_icon from '../images/search.png'
import clear_icon from '../images/clear.png'
import cloud_icon from '../images/cloud.png'
import drizzle_icon from '../images/drizzle.png'
import humidity_icon from '../images/humidity.png'
import rain_icon from '../images/rain.png'
import snow_icon from '../images/snow.png'
import wind_icon from '../images/wind.png'

const API_KEY = '9dc0a62c1054587859fc7804f2fca695';

interface WeatherData {
    coord: {
      lon: number;
      lat: number;
    };
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    base: string;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
      sea_level?: number; // Optional, since not all responses include sea level
      grnd_level?: number; // Optional, for ground-level pressure
    };
    visibility: number;
    wind: {
      speed: number;
      deg: number;
      gust?: number; // Optional
    };
    rain?: {
      "1h"?: number; // Optional for rainfall in the last hour
      "3h"?: number; // Optional for rainfall in the last 3 hours
    };
    clouds: {
      all: number;
    };
    dt: number; // Unix timestamp
    sys: {
      type: number;
      id: number;
      country: string;
      sunrise: number; // Unix timestamp
      sunset: number; // Unix timestamp
    };
    timezone: number; // Seconds offset from UTC
    id: number;
    name: string;
    cod: number; // HTTP status code-like field
  }
  


const Weather = () => {

    const [weatherData, setWeatherData] = useState<WeatherData | undefined>(undefined);

    const search = async (city: string) => {
        try{
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
            const response = await fetch(url);
            const data: WeatherData = await response.json();
            console.log(data);
            setWeatherData(data)
        }catch (error) {

        }
    }

    useEffect(()=>{
        search("Bengaluru");
    },[])

  return (
    <div className='weather'>
        <div className="search-bar">
            <input type="text" placeholder='Search..'/>
            <img src={search_icon} alt="" />
        </div>
        <div className='weather-details'>
            <img src={weatherData?.weather[0]?.icon ? `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png` : ''} alt="" className='weather-icon'/>
            <p className="desciption">{weatherData?.weather[0]?.description}</p>
        </div>
        <p className='temperature'>{weatherData?.main.temp}°C</p>
        <p className='location'>{weatherData?.name}</p>
        <div className="weather-data">
            <div className="col">
                <img src={humidity_icon} alt="" />
                <div>
                    <p>{weatherData?.main.humidity} %</p>
                    <span>Humidity</span>
                </div>
            </div>
            <div className="col">
                <img src={wind_icon} alt="" />
                <div>
                    <p>{weatherData?.wind.speed} Km/h</p>
                    <span>Wind Speed</span>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Weather