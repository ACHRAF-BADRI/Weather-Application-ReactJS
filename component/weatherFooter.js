import React from 'react';

const Footer = () => {
  return (
    <footer id="footer" role="contentinfo">
      <p>&copy; 2024 Weather App by EL BADRI ACHRAF</p>

      <style jsx global>{`
        * {
          padding: 0;
          margin: 0;
          box-sizing: border-box;
        }

        #footer {
          height: 40px;
          background-color: #000;
          color: #fff;
          text-align: center;
          padding: 10px;
          position: relative;
          bottom: 0;
          width: 100%;
        }

        body {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        #main {
          flex-grow: 1;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
