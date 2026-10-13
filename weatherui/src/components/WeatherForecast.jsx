import React, { useState } from 'react';
import './WeatherForecast.css'; // We will create this CSS file next
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm, WiDayCloudy, WiNa, WiHumidity, WiStrongWind, WiThermometer, WiDaySunnyOvercast } from 'react-icons/wi';
import { FaSearchLocation } from 'react-icons/fa';

// Helper function to get the day of the week from a date string (e.g., "2025-08-18" -> "Monday")
const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    // Adding a time zone offset might be needed if dates are off by one day
    // For India (IST is UTC+5:30), this helps ensure correctness
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset() + 330);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
};


// Helper function to map weather conditions from your API to an icon
const getWeatherIcon = (condition) => {
    if (!condition) return <WiNa size={50} />;
    const lowerCaseCondition = condition.toLowerCase();

    if (lowerCaseCondition.includes('sunny')) {
        return <WiDaySunny size={50} />;
    } else if (lowerCaseCondition.includes('partly cloudy')) {
        return <WiDayCloudy size={50} />;
    } else if (lowerCaseCondition.includes('cloudy') || lowerCaseCondition.includes('overcast')) {
        return <WiCloudy size={50} />;
    } else if (lowerCaseCondition.includes('rain') || lowerCaseCondition.includes('drizzle')) {
        return <WiRain size={50} />;
    } else if (lowerCaseCondition.includes('thunder') || lowerCaseCondition.includes('storm')) {
        return <WiThunderstorm size={50} />;
    } else if (lowerCaseCondition.includes('snow') || lowerCaseCondition.includes('sleet')) {
        return <WiSnow size={50} />;
    } else {
        // A good default for conditions not yet mapped
        return <WiCloudy size={50} />;
    }
};


const WeatherForecast = () => {
    const [city, setCity] = useState('');
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFetchForecast = async (e) => {
        e.preventDefault();
        if (!city) {
            setError('Please enter a city name.');
            return;
        }

        setLoading(true);
        setError(null);
        setForecastData(null);

        try {
            // Replace with your actual backend URL
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/weather/forecast?city=${city}&days=7`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `City not found or server error.`);
            }

            const data = await response.json();
            setForecastData(data);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="weather-container">
            <h1 className="title">Weather Forecast 🌦️</h1>

            <form onSubmit={handleFetchForecast} className="search-form">
                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter Location"
                    className="city-input"
                />
                <button type="submit" className="search-button" disabled={loading}>
                    <FaSearchLocation />
                </button>
            </form>

            {loading && <div className="loader"></div>}
            {error && <p className="error-message">{error}</p>}

            {forecastData && (
                <div className="results-container">
                    {/* Current Weather Section */}
                    <div className="current-weather">
                        <div className="current-info">
                            <h2>{forecastData.weatherResponse.city}, {forecastData.weatherResponse.region}</h2>
                            <p className="current-condition">{forecastData.weatherResponse.condition}</p>
                            <p className="current-temp">{Math.round(forecastData.weatherResponse.temperature)}°C</p>
                        </div>
                        <div className="current-icon">
                            {getWeatherIcon(forecastData.weatherResponse.condition)}
                        </div>
                    </div>

                    {/* Weather Details Grid */}
                    <div className="weather-details">
                        <div className="detail-item">
                            <WiHumidity className="detail-icon" />
                            <div className="detail-text">
                                <span className="detail-label">Humidity</span>
                                <span className="detail-value">{forecastData.weatherResponse.humidity}%</span>
                            </div>
                        </div>
                        <div className="detail-item">
                            <WiThermometer className="detail-icon" />
                            <div className="detail-text">
                                <span className="detail-label">Feels Like</span>
                                <span className="detail-value">{Math.round(forecastData.weatherResponse.feelsLike)}°C</span>
                            </div>
                        </div>
                        <div className="detail-item">
                            <WiStrongWind className="detail-icon" />
                            <div className="detail-text">
                                <span className="detail-label">Wind</span>
                                <span className="detail-value">{Math.round(forecastData.weatherResponse.windKph)} km/h {forecastData.weatherResponse.windDir}</span>
                            </div>
                        </div>
                        <div className="detail-item">
                            <WiDaySunnyOvercast className="detail-icon" />
                            <div className="detail-text">
                                <span className="detail-label">UV Index</span>
                                <span className="detail-value">{forecastData.weatherResponse.uv}</span>
                            </div>
                        </div>
                    </div>

                    {/* 3-Day Forecast Section (Free tier limit) */}
                    <h3 className="forecast-title">3-Day Forecast</h3>
                    <div className="forecast-grid">
                        {forecastData.daysTemp.map((day, index) => (
                            <div key={index} className="forecast-day-card">
                                <h4>{getDayOfWeek(day.date)}</h4>
                                <div className="forecast-icon">
                                    {getWeatherIcon(day.condition)}
                                </div>
                                <p className="forecast-temps">
                                    <span className="temp-high">{Math.round(day.maxTemp)}°</span> / <span className="temp-low">{Math.round(day.minTemp)}°</span>
                                </p>
                                {day.chanceOfRain > 0 && (
                                    <p className="rain-chance">🌧️ {day.chanceOfRain}%</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherForecast;