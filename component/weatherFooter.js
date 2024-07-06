import React from 'React';

const Footer = () => {
  return (
    <footer id="footer">
        <p>&copy; 2024 Weather App by EL BADRI ACHRAF</p>
        
        <style jsx global>{`
                * {
                padding: 0;
                margin: 0;
                box-sizing: border-box;
                }

                #container {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                }

                #main {
                flex: 1;
                }

                #footer {
                height: 40px;
                background-color: #000;
                color: #fff;
                text-align: center;
                padding: 10px;
                }
            `}</style>
    </footer>
  );
};

export default Footer;