# Weather Application with Leaflet
This weather application is a simple web app that provides weather information for predefined cities and allows users to add new cities. It also provides additional details for each city, such as GPS coordinates, wind speed, and humidity. The map functionality is implemented using Leaflet.

![App Image](./public/app_img.png)

## Features
- Display weather information for 5 predefined cities
- Retrieve weather data from an API
- Add new cities via a search bar
- Autosuggestion of city names when typing in the search bar
- Save cities to local storage
- Reset button to clear the saved cities to local storage beside the 5 predefined cities
- View additional details for each city
- Responsive design for desktop and mobile devices

## Technologies Used
- ReactJS
- NextJS
- Leaflet (for map functionality)
- Bootstrap

## Getting Started

1. Install dependencies:

cd El_Badri_Achraf_prj
npm install react-leaflet leaflet

2. Add your API Key :

(you can get your API key from this web site >>> [pip](https://www.weatherapi.com/docs) after creating an account)

Add your API Key to the variable "apiKey" in this files :
- pages/detail_city.js
- component/weatherDashboard.js
- component/weatherCard.js

3. Run the development server:

npm run dev

4. Open your browser and navigate to http://localhost:3000 and click on the button "My Weather App" to view the app.

## Usage

- Upon launching the app, you will see weather information for 5 predefined cities.
- Click on a city to view additional details.
- Use the search bar to add new cities.
- Weather data for added cities will be saved to local storage.

## Bonus Features
- Autosuggestion for city names in the search bar.
- Error message display for network/offline errors.
- Display a map of the city on the details page using Leaflet with GPS coordinates.
- Reset button to clear the saved cities to local storage.

## Credits

- This project was created by EL BADRI ACHRAF.