import React, { useEffect } from 'react';
import WeatherDashboard from '../component/weatherDashboard';
import Navbar from '../component/weatherNavbar';
import Footer from '../component/weatherFooter';

const App = () => {
  useEffect(() => {
    document.title = "EL BADRI ACHRAF Weather App";
  }, []);

  return (
    <div style={{ backgroundImage: "url('background_img.jpg')", backgroundSize: 'cover', minHeight: '100vh' }}>
      <Navbar />
      <div id="main">
        <div className="container">
          <h1 className="text-center my-4 text-white">Weather Management Application</h1>
          <WeatherDashboard />
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default App;
