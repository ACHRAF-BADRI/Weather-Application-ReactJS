import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const WeatherCard = ({ city }) => {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiKey = '77af47cf2a0f463ca80120809242405';
    fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch weather data');
        return response.json();
      })
      .then(data => setWeather(data))
      .catch(error => setError(error.message));
  }, [city]);

  if (error) return <div>Error fetching weather data: {error}</div>;
  if (!weather) return (<div className='text-center'>Loading weather Infos...</div>);

  const { current } = weather;

  return (
    <div className="container mt-4">
      <div className="card weather-card mx-auto shadow-sm">
        <div className="card-body">
          <h5 className="card-title text-center">{city}</h5>
          <div className="d-flex justify-content-center align-items-center">
            <h6 className="card-subtitle mb-2 text-muted">{current?.condition?.text}</h6>
            <img className="ml-2 condition-icon" src={`https:${current?.condition?.icon}`} alt="Condition icon" />
          </div>
          <div className="mt-1 text-center">
            <p className="card-text"><strong>Temperature:</strong> {current?.temp_c}°C</p>
            <p className="card-text"><strong>Humidity:</strong> {current?.humidity}%</p>
          </div>
          <div className="text-center mt-3">
            <Link href={`/detail_city?city=${city}`} legacyBehavior>
              <a className="btn btn-primary btn-block bg-dark border-dark">Details</a>
            </Link>
          </div>
        </div>
      </div>
      <style jsx>{`
        @import url('https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css');

        .weather-card {
          max-width: 350px;
          transition: transform 0.3s, box-shadow 0.3s;
          border: 2px solid black;
          border-radius: 20px;
        }
        .weather-card:hover {
          transform: translateY(-10px);
        }
        .condition-icon {
          width: 50px;
          height: 50px;
        }
      `}</style>
    </div>
  );
};

export default WeatherCard;
