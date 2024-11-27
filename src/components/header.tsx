import React, { useState, useEffect } from "react";
import { FaBars, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import WeatherCard from "./WeatherCard";

const HamburgerMenu = () => {
  // State to toggle menu open/close
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // State to hold the list of locations
  const [locations, setLocations] = useState<string[]>(["Current Location"]);

  // State to manage the new location input
  const [newLocation, setNewLocation] = useState<string>("");

  // State to manage the selected location
  const [selectedLocation, setSelectedLocation] = useState<string>("Current Location");

  // Function to toggle the menu state
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to handle location input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLocation(e.target.value);
  };

  // Function to add a new location
  const addLocation = () => {
    if (newLocation.trim()) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation(""); // Reset input field
    }
  };

  // Function to handle location selection
  const handleLocationClick = (location: string) => {
    setSelectedLocation(location);
    setIsMenuOpen(false); // Close the menu after selecting a location
  };

  // Function to close the menu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Function to get the current location (geolocation API)
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Get coordinates and set default location
          const { latitude, longitude } = position.coords;
          setLocations([`Current Location: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`]);
          setSelectedLocation(`Current Location: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        },
        (error) => {
          console.error("Error fetching location", error);
          setLocations(["Current Location"]);
          setSelectedLocation("Current Location");
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  };

  // Get current location when the component mounts
  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <div className="menu-container">
      {/* Hamburger Button */}
      <button className="hamburger-icon" onClick={toggleMenu}>
        <FaBars size={30} />
      </button>

      {/* Location Display */}
      <div className="location-display">
        <FaMapMarkerAlt size={20} />
        <span>{selectedLocation}</span> {/* Display the selected location */}
      </div>

      {/* Sliding Menu */}
      <div className={`menu ${isMenuOpen ? "menu-open" : ""}`}>
        {/* Close Button */}
        <button className="close-menu-btn" onClick={closeMenu}>
          <FaTimes size={30} />
        </button>

        <ul>
          {locations.map((location, index) => (
            <li key={index} onClick={() => handleLocationClick(location)}>
              {location}
            </li>
          ))}
        </ul>

        {/* Search and Add Location Section */}
        <div className="add-location">
          <input
            type="text"
            placeholder="Search and add location"
            value={newLocation}
            onChange={handleInputChange}
          />
          <button onClick={addLocation}>Add Location</button>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;
