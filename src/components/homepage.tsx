import React, { useEffect, useRef, useState } from "react";
import { List, arrayMove } from "react-movable";
import { BiTargetLock } from "react-icons/bi";
import { IoSearch } from "react-icons/io5";
import { RiDraggable } from "react-icons/ri";
import { CiTempHigh } from "react-icons/ci";
import { WiHumidity } from "react-icons/wi";
import { FaWind, FaBookmark } from "react-icons/fa6";
import { IoMdLogOut, IoMdCloseCircle } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdSunny, MdSunnySnowing } from "react-icons/md";
import { FaTemperatureHigh, FaTemperatureLow } from "react-icons/fa";
import "../styles/homepage.css";
import axios from "axios";
import { addDoc, collection, deleteDoc, doc, getDocs, query, setDoc, where, } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import rain from "../images/rain.jpg";
import clear from "../images/clear.jpg";
import clouds from "../images/cloudy.jpg";
import mist from "../images/mist.jpg";
import sunny from "../images/sunny.jpg";
import { HomePageProps, SavedLocation, WeatherData } from "../api/interfaces";


const HomePage: React.FC<HomePageProps> = ({ user, handleLogout }) => {

  const API_KEY = "9dc0a62c1054587859fc7804f2fca695";
  const API_URL = "https://api.openweathermap.org/data/2.5/";

  const [weatherData, setWeatherData] = useState<WeatherData | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);


  const handleCurrentLocationClick = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const currentWeather = await fetchWeatherfuction(latitude, longitude);
          setWeatherData(currentWeather);
          setIsLoading(true);
        } catch (error) {
          console.error("Error fetching weather data for current location:", error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
      }
    );
  };

  const fetchWeatherfuction = async (lat: number, lon: number) => {
    const url = `${API_URL}forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`; // Corrected `&units=metric`
    const response = await axios.get(url);
    return response.data;
  };

  const fetchWeatherData = async (city: string): Promise<WeatherData> => {
    try {
      const url = `${API_URL}forecast?q=${city}&appid=${API_KEY}&units=metric`;
      const searchResponse = await axios.get(url);
      return searchResponse.data;

    } catch (error) {
      console.error("Error fetching weather data:", error);
      throw error;
    }
  };

  const handleSearch = async (searchCity: string) => {
    if (searchCity.trim() === "") return;
    try {
      const currentSearchResults = await fetchWeatherData(searchCity);
      setWeatherData(currentSearchResults);
      setSearchCity("");
      setCitySuggestions([]);
      console.log(currentSearchResults);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  const sunriseTimestamp = weatherData?.city?.sunrise;
  const sunsetTimestamp = weatherData?.city?.sunset;

  const sunriseTime = sunriseTimestamp
    ? new Date(sunriseTimestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    : 'Sunrise data unavailable';

  const sunsetTime = sunsetTimestamp
    ? new Date(sunsetTimestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    : 'Sunset data unavailable';


  const backgroundImage = (weather: string): string => {
    switch (weather) {
      case "Rain": return rain;
      case "Clear": return clear;
      case "Clouds": return clouds;
      case "Mist": return mist;
      default: return sunny; // Fallback image
    }
  };

  const getDailyForecast = () => {
    const daysTemps: { day: string; temp: number; icon: string; condition: string; }[] = [];
    weatherData?.list.forEach((data) => {
      const forecastDate = new Date(data.dt * 1000);
      const forecastDay = forecastDate.toLocaleDateString(undefined, { weekday: 'long' });

      if (
        daysTemps.length < 7 &&
        forecastDate > new Date() &&
        !daysTemps.some((entry) => entry.day === forecastDay)
      ) {
        daysTemps.push({
          day: forecastDay,
          temp: data.main.temp,
          icon: data.weather[0].icon,
          condition: data.weather[0].description,
        });
      }
    });
    return daysTemps;
  };

  const getHourlyForecast = () => {
    const currentTime = new Date().getTime() / 1000;
    const hourlyData = weatherData?.list.filter((data) => {
      const forecastTime = data.dt;
      return forecastTime >= currentTime && forecastTime <= currentTime + 86400;
    });
    return hourlyData?.map((data) => ({
      time: new Date(data.dt * 1000).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      temp: data.main.temp,
      icon: data.weather[0].icon,
    }));
  };

  const fetchSavedLocations = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const savedLocationsRef = collection(userDocRef, "savedLocations");
      const querySnapshot = await getDocs(savedLocationsRef);
  
      const locations: SavedLocation[] = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const location = doc.data() as SavedLocation;
          const liveWeatherData = await fetchWeatherData(location.name); 
          return {
            ...location,
            temp: liveWeatherData.list[0].main.temp,
            weatherIcon: liveWeatherData.list[0].weather[0].icon,
          };
        })
      );
  
      setSavedLocations(locations);
    } catch (error) {
      console.error("Error fetching saved locations:", error);
    }
  };
  


  const saveLocation = async () => {
    if (!weatherData) {
      console.error("No weather data available for saving.");
      return;
    }
  
    const locationName = `${weatherData.city.name}, ${weatherData.city.country}`;
  
    try {
      const userDocRef = doc(db, "users", user.uid);
      const savedLocationsRef = collection(userDocRef, "savedLocations");
      const existingLocations = await getDocs(
        query(savedLocationsRef, where("name", "==", locationName))
      );
  
      if (!existingLocations.empty) {
        await deleteDoc(existingLocations.docs[0].ref);
        console.log(`Location removed: ${locationName}`);
        fetchSavedLocations(); 
        return;
      }
  
      const newLocation: SavedLocation = {
        id: "", 
        name: locationName,
        temp: weatherData?.list[0].main.temp,
        weatherIcon: weatherData?.list[0].weather[0].icon,
        uid: user.uid,
      };
  
      const docRef = await addDoc(savedLocationsRef, newLocation);
      // console.log("Document written with ID:", docRef.id);

      const updatedLocation: SavedLocation = {
        ...newLocation,
        id: docRef.id,
      };
      await setDoc(docRef, updatedLocation);

      fetchSavedLocations(); 
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };
  

  const deleteLocation = async (id: string) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const locationDocRef = doc(userDocRef, "savedLocations", id);
  
      await deleteDoc(locationDocRef);
      console.log("Location deleted successfully.");
      fetchSavedLocations(); 
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  const isLocationSaved = (locationName: string): boolean => {
    return savedLocations.some((location) => location.name === locationName);
  };

  const handleSavedLocationClick = async (locationName: string) => {
    try {
      const currentSearchResults = await fetchWeatherData(locationName);
      setWeatherData(currentSearchResults);
      console.log(`Clicked on location: ${locationName}`);
    } catch (error) {
      console.error("Error fetching weather data for saved location:", error);
    }
  };

  const fetchCitySuggestions = async (input: string) => {
    if (!input.trim()) {
      setCitySuggestions([]);
      return;
    }
  
    try {
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${API_KEY}`;
      const response = await axios.get(url);
      const suggestions = response.data.map((city: any) => {
        if (city.name && city.country) {
          return `${city.name}, ${city.country}`;
        }
        return null; // Exclude invalid results
      }).filter(Boolean);
  
      setCitySuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error("Error fetching city suggestions:", error);
      setCitySuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const formattedCity = suggestion.split(",")[0].trim();
    setSearchCity("");
    setShowSuggestions(false);
    handleSearch(formattedCity);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setSearchCity(value);
  
    if (value) {
      fetchCitySuggestions(value);
    } else {
      setCitySuggestions([]);
      setShowSuggestions(false); // Ensure dropdown is hidden for empty input
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchCity.trim()) {
      handleSearch(searchCity.trim()); // Ensure no extra spaces are passed
      setShowSuggestions(false); // Close suggestions on search
    }
  };

  React.useEffect(() => {
    const fetchInitialData = async () => {
      try {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const currentWeather = await fetchWeatherfuction(latitude, longitude);
          setWeatherData(currentWeather);
          console.log("Fetched current weather:", currentWeather);
        });
        await fetchSavedLocations();
      } catch (error) {
        console.error("Error during initial data fetch:", error);
      } finally {
        setIsLoading(true);
      }
      if (user) {
        try {
          await fetchSavedLocations();
        } catch (error) {
          console.error("Error fetching saved locations:", error);
        }
      }
    };
    fetchInitialData();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
  });
   unsubscribe();


    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);


  }, [user]);



  return (
    <div className="box">
      <div className="background">
        <img src={backgroundImage(weatherData?.list[0]?.weather[0]?.main || "Clear")} alt="" />
      </div>
      <header>
        <div className="logo">
          <h2>Weather</h2>
        </div>
        <div className="user-details">
          <h1>Hi, {user.displayName}</h1>
          <button onClick={handleLogout}><IoMdLogOut /></button>
        </div>
      </header>
      <section className='main-content'>
        <div className="search-section">
        <div className="search-box">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search location..."
                        value={searchCity}
                        onChange={handleInputChange}
                        onFocus={() => setShowSuggestions(true)} 
                        onKeyDown={handleKeyDown} // Handle Enter key press
                    />
                    {showSuggestions && citySuggestions.length > 0 && (
                        <div className="dropdown-suggestions">
                            {citySuggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="dropdown-item"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
          <button className="current-location" onClick={handleCurrentLocationClick}>
            <BiTargetLock />
            <span>My Location</span>
          </button>
          <div className="saved-items">
            <List
              values={savedLocations}
              onChange={({ oldIndex, newIndex }) =>
                setSavedLocations(arrayMove(savedLocations, oldIndex, newIndex))
              }
              renderList={({ children, props }) => <div {...props}>{children}</div>}
              renderItem={({ value, props }) => (
                <div className="saved-location" {...props} key={value.id} onClick={() => handleSavedLocationClick(value.name)}>
                  <RiDraggable />
                  <button
                    className="location-info" onClick={() => handleSavedLocationClick(value.name)}

                  >
                    <div className="temp">
                      <div className="temp-icon">
                        <img
                          src={`https://openweathermap.org/img/wn/${value.weatherIcon}@2x.png`}
                          alt="Weather Icon"
                        />
                      </div>
                      <span>{value.temp}°</span>
                    </div>
                    <p className="location-name">{value.name}</p>
                  </button>
                  <button
                    className="close-button"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering onClick for the parent
                      deleteLocation(value.id);
                    }}
                  >
                    <IoMdCloseCircle />
                  </button>
                </div>
              )}
            />

          </div>
        </div>
        {weatherData && isLoading ? (
          <div className="weather-details">
            <div className="main-weather-details">
              <div className="weather-header">
                <div className="location-details">
                  <h2 className="location-name">{weatherData?.city.name}, {weatherData?.city.country}</h2>
                  <h5 className="weather-condition">{weatherData?.list[0].weather[0].description}</h5>
                </div>
                <button
                  onClick={saveLocation}
                  className={`save-location ${isLocationSaved(`${weatherData?.city.name}, ${weatherData?.city.country}`) ? 'saved' : ''}`}
                >
                  <FaBookmark className="save-icon" />
                  {isLocationSaved(`${weatherData?.city.name}, ${weatherData?.city.country}`) ? 'Saved' : 'Save'}
                </button>
              </div>
              <div className="temprature-weather">
                <div className="location-temprature">
                  <img src={weatherData?.list[0].weather[0].icon ? `http://openweathermap.org/img/wn/${weatherData.list[0].weather[0].icon}@2x.png` : ''} alt="" />
                  <span>{weatherData?.list[0].main.temp}°</span>
                </div>
                <div className="location-quick-details">
                  <div className="quick-details">
                    <CiTempHigh />
                    <span>Real feel: <strong>{weatherData?.list[0].main.feels_like}°</strong></span>
                  </div>
                  <div className="quick-details">
                    <WiHumidity />
                    <span>Humidity: <strong>{weatherData?.list[0].main.humidity}%</strong></span>
                  </div>
                  <div className="quick-details">
                    <FaWind />
                    <span>Wind: <strong>{weatherData?.list[0].wind.speed} km/h</strong></span>
                  </div>
                </div>
              </div>
              <div className="location-quick-details-2">
                <div className="quick-details">
                  <MdSunny />
                  <span>Sunrise: <strong>{sunriseTime}</strong></span>
                </div>
                <div className="quick-details">
                  <MdSunnySnowing />
                  <span>Sunset: <strong>{sunsetTime}</strong></span>
                </div>
                <div className="quick-details">
                  <FaTemperatureHigh />
                  <span>High Temprature: <strong>{weatherData?.list[0].main.temp_max}°</strong></span>
                </div>
                <div className="quick-details">
                  <FaTemperatureLow />
                  <span>Low Temprature: <strong>{weatherData?.list[0].main.temp_min}°</strong></span>
                </div>
              </div>
              <hr />
              <div className="hourly-forecast">
                <h2 className="heading">Today</h2>
                <div className="time-temp-cards">
                  {getHourlyForecast()?.map((hourData, index) => (
                    <div className="tt-card" key={index}>
                      <img src={`https://openweathermap.org/img/wn/${hourData.icon}@2x.png`} alt="" />
                      <div className='time-temp'>
                        <p className='time'>{hourData.time}</p>
                        <p className='temp'>{hourData.temp}°</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="daily-forecast">
                <h2 className="heading">Daily Forecast</h2>
                <div className="day-temp-cards">
                  {getDailyForecast().map((dayData, index) => (
                    <div key={index} className="tt-card">
                      <div className="ttc-temp">
                        <p>{dayData.temp}°</p>
                        <img
                          src={`https://openweathermap.org/img/wn/${dayData.icon}@2x.png`}
                          alt="Weather Icon"
                        />
                      </div>
                      <p className='condition'>{dayData.condition}</p>
                      <p className='day'>{dayData.day}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="loading">
            <AiOutlineLoading3Quarters className='loadingIcon' />
            <p>Loading...</p>
          </div>

        )}
      </section>
    </div>
  )
}

export default HomePage;
function setUser(user: User) {
  throw new Error('Function not implemented.');
}

