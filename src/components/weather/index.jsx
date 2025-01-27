import { useEffect, useState } from "react";
import Search from "../search";

export default function Weather() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);

  async function fetchWeatherData(param) {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${param}&appid=e34b4c51d8c2b7bf48d5217fe52ff79e&units=metric`
      );

      const data = await response.json();
      if (data) {
        setWeatherData(data);
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      console.error(e);
    }
  }

  async function fetchCityNameFromCoordinates(lat, lon) {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=YOUR_OPENCAGE_API_KEY`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const city = data.results[0].components.city || data.results[0].components.town;
        if (city) {
          fetchWeatherData(city);
        } else {
          fetchWeatherData("ratlam"); // Fallback to default city if no city found
        }
      } else {
        fetchWeatherData("ratlam"); // Fallback to default city
      }
    } catch (error) {
      console.error("Error fetching city from coordinates:", error);
      fetchWeatherData("ratlam"); // Fallback to default city
    }
  }

  async function handleSearch() {
    fetchWeatherData(search);
  }

  function getCurrentDate() {
    return new Date().toLocaleDateString("en-us", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  useEffect(() => {
    // Get user's location and fetch city name and weather based on it
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        fetchCityNameFromCoordinates(latitude, longitude);
      }, (error) => {
        console.error("Error getting location: ", error);
        // Fallback to default location if location is not available
        fetchWeatherData("ratlam");
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Fallback to default location if geolocation is not supported
      fetchWeatherData("ratlam");
    }
  }, []);

  return (
    <div className="weather-container">
      <Search
        search={search}
        setSearch={setSearch}
        handleSearch={handleSearch}
      />
      {!loading && weatherData && (
        <div className="weather-details">
          <div className="city-name">
            <h2>
              {weatherData?.name}, <span>{weatherData?.sys?.country}</span>
            </h2>
          </div>
          <div className="date">
            <span>{getCurrentDate()}</span>
          </div>
          <div className="temp">
            {weatherData?.main?.temp}°C
          </div>
          <p className="description">
            {weatherData?.weather?.[0]?.description || ""}
          </p>
          <div className="weather-info">
            <div className="column">
              <div>
                <p className="wind">{weatherData?.wind?.speed} m/s</p>
                <p>Wind Speed</p>
              </div>
            </div>
            <div className="column">
              <div>
                <p className="humidity">{weatherData?.main?.humidity}%</p>
                <p>Humidity</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
