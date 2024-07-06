import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import Navbar from '../component/weatherNavbar';
import Footer from '../component/weatherFooter';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const CityDetails = () => {
  const apiKey = '77af47cf2a0f463ca80120809242405';
  const router = useRouter();
  const { city } = router.query;
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setError] = useState(null);

  useEffect(() => {
    if (city) {
      fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch weather data');
          }
          return response.json();
        })
        .then(data => {
          setWeather(data);
          setLoading(false);
        })
        .catch(error => {
          setError(error.message);
          setLoading(false);
        });
    }
  }, [city]);

  if (loading) return <div><Navbar/><div className='text-center'>Loading {city}'s weather Infos... </div><Footer/></div>;

  const { lat, lon, name, country } = weather.location;

  return (
    <div>
      <Navbar/>
      <div className="container mt-4" id='container'>
        <div id='main'>
          <div className="row">
            <div className="col-md-6 mt-5 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{weather.location.name}</h5>
                  <h6 className="card-subtitle mb-1 text-muted">{weather.current.condition.text}
                    <img className="ml-2" src={`https:${weather.current.condition.icon}`} alt="Condition icon" />
                  </h6>
                  <p className="card-text"><strong>Temperature :</strong> {weather.current.temp_c}°C</p>
                  <p className="card-text"><strong>Humidity :</strong> {weather.current.humidity}%</p>
                  <p className="card-text"><strong>Wind speed :</strong> {weather.current.wind_kph} kph</p>
                  <p className="card-text"><strong>GPS coordinates :</strong> {weather.location.lat}, {weather.location.lon}</p>
                  <p className="card-text"><strong>Last update :</strong> {weather.current.last_updated}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <MapContainer center={[lat, lon]} zoom={13} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[lat, lon]}>
                  <Popup>
                    {name}, {country}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
          <div className="text-center mt-2 mb-4">
            <Link href={`/app`} legacyBehavior>
              <a className="btn btn-primary mt-4 bg-dark border-dark">Home</a>
            </Link>
          </div>
        </div>
      </div>

      <Footer/>
      <style jsx>{`
        @import url('https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css');
      `}</style>
    </div>
  );
};

export default CityDetails;
