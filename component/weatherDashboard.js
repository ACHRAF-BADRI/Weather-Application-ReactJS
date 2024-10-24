import React, { useState, useEffect } from 'react';
import WeatherCard from './WeatherCard';

const predefinedCities = ['Rabat', 'Paris', 'Berlin', 'Marrakesh', 'Marseille'];
const apiKey = '77af47cf2a0f463ca80120809242405';

const WeatherDashboard = () => {
  const [cities, setCities] = useState(predefinedCities);
  const [newCity, setNewCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCities = localStorage.getItem('cities');
      if (savedCities) setCities(JSON.parse(savedCities));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cities', JSON.stringify(cities));
    }
  }, [cities]);

  const handleAddCity = () => {
    if (newCity && !cities.includes(newCity)) {
      setCities([...cities, newCity]);
      setNewCity('');
      setSuggestions([]);
    }
  };

  const handleCityChange = (e) => {
    const inputCity = e.target.value;
    setNewCity(inputCity);
    if (inputCity.length > 0) {
      fetch(`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${inputCity}`)
        .then((res) => res.json())
        .then((data) => setSuggestions(data.map(suggestion => suggestion.name)))
        .catch(() => setError('Error retrieving suggestions'));
    } else {
      setSuggestions([]);
    }
  };

  const handleResetLocalStorage = () => {
    localStorage.removeItem('cities');
    setCities(predefinedCities);
  };

  return (
    <div>
      <div className="mb-4">
        {error && <div className="alert alert-danger">{error}</div>}
        <input
          type="text"
          className="form-control"
          value={newCity}
          onChange={handleCityChange}
          placeholder="Search for a city"
        />
        <ul className="list-group">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="list-group-item list-group-item-action" onClick={() => {
              setNewCity(suggestion);
              setSuggestions([]);
            }}>
              {suggestion}
            </li>
          ))}
        </ul>
        
        <button className="btn btn-success mt-2" onClick={handleAddCity}>Add city</button>
        <button className="btn btn-danger mt-2 ml-2" onClick={handleResetLocalStorage}>Reset</button>
      </div>
      <div className="row">
        {cities.map((city, index) => (
          <div key={index} className="col-md-4 mb-4">
            <WeatherCard city={city} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherDashboard;
