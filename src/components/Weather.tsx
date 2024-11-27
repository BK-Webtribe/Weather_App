import React, { useEffect, useRef, useState } from 'react'
import '../styles/app.css'
import search_icon from '../images/search.png'
import humidity_icon from '../images/humidity.png'
import wind_icon from '../images/wind.png'
import location_icon from '../images/location.png'
import { error } from 'console'

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
    const inputRef = useRef<HTMLInputElement | null> (null);
    const [weatherData, setWeatherData] = useState<WeatherData | undefined>(undefined);

    const search = async (city: string) => {

        if (city === ""){
            alert("Enter city Name");
            return;
        }
        try{
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
            const response = await fetch(url);
            const data: WeatherData = await response.json();
            console.log(data);
            setWeatherData(data);
        }catch (error) {
            setWeatherData(undefined);
            console.error("Error in fetching data")
        }
    }

    const getCurrentLocationWeather = () =>{
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
               async (position) => {
                 const { latitude, longitude } = position.coords;

                 try{
                    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
                    const response = await fetch(url);
                    const data: WeatherData = await response.json();
                    console.log(data);
                    setWeatherData(data);

                    if (inputRef.current){
                        inputRef.current.value = data.name;
                    }
                 }catch (error){
                    console.error("Error fetching location-based weather data");
                 }
               },
               (error) => {
                alert("Geolocation error: " + error.message);
               }
            );
        } else{
            alert("Geolocation is not supported by this browser.")
        }
    }

    useEffect(()=>{
        getCurrentLocationWeather();
    },[])

  return (
    <div className='weather'>
        <div className="search-bar">
            <button className='location-button' onClick={getCurrentLocationWeather} >
                <img src={location_icon} alt=""/>
            </button>
            <input ref={inputRef} type="text" placeholder='Search..'/>
            <img src={search_icon} alt="" className='search-icon' onClick={() => {
                if (inputRef.current) {
                search(inputRef.current.value);
                }
            }}/>            
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