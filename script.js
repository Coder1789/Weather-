const geoApiUrl = 'https://api.openweathermap.org/geo/1.0/direct';
const weatherApiUrl = 'https://api.open-meteo.com/v1/forecast';
const geoApiKey = 'f00c38e0279b7bc85480c3fe775d518c'; // Replace with API key(grab from internet)

const locationInput = document.getElementById('locationInput');
const searchButton = document.getElementById('searchButton');
const locationElement = document.getElementById('location');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');
const weatherAnimation = document.getElementById('weatherAnimation');

searchButton.addEventListener('click', () => {
    const location = locationInput.value.trim();
    if (location) {
        // Show loader
        loader.style.display = 'block';
        locationElement.textContent = '';
        temperatureElement.textContent = '';
        descriptionElement.textContent = '';
        weatherAnimation.innerHTML = '';

        geocodeLocation(location)
            .then(({ latitude, longitude, name }) => {
                fetchWeather(latitude, longitude, name);
            })
            .catch(error => {
                loader.style.display = 'none'; // Hide loader on error
                locationElement.textContent = "Error:";
                temperatureElement.textContent = "";
                descriptionElement.textContent = error;
                console.error('Error finding location:', error);
            });
    } else {
        locationElement.textContent = "Error:";
        temperatureElement.textContent = "";
        descriptionElement.textContent = "Please enter a valid city name.";
    }
});


function geocodeLocation(location) {
    const url = `${geoApiUrl}?q=${encodeURIComponent(location)}&limit=1&appid=${geoApiKey}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat: latitude, lon: longitude, name } = data[0];
                return { latitude, longitude, name };
            } else {
                throw "Location not found. Please try again.";
            }
        });
}

function fetchWeather(latitude, longitude, locationName) {
    const url = `${weatherApiUrl}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            loader.style.display = 'none'; // Hide loader
            locationElement.textContent = locationName;

            // Assuming the first hour's temperature is used
            const temperature = data.hourly.temperature_2m[0];
            const weatherCode = data.hourly.weathercode[0]; // Use weather code for condition

            temperatureElement.textContent = `${temperature}°C`;

            // Map weather codes to descriptions and animations
            const weatherDescriptions = {
                0: "Clear sky",
                1: "Mainly clear",
                2: "Partly cloudy",
                3: "Overcast",
                45: "Fog",
                48: "Depositing rime fog",
                51: "Drizzle: Light",
                61: "Rain: Light",
                71: "Snowfall: Light",
                95: "Thunderstorm: Slight or moderate"
            };

            const description = weatherDescriptions[weatherCode] || "Unknown weather";
            descriptionElement.textContent = description;

            // Display weather animation based on condition
            if ([0, 1].includes(weatherCode)) {
                weatherAnimation.innerHTML = '<div class="sun"></div>';
            } else if ([2, 3].includes(weatherCode)) {
                weatherAnimation.innerHTML = '<div class="cloud"></div>';
            } else if ([51, 61].includes(weatherCode)) {
                weatherAnimation.innerHTML = '<div class="rain"></div>';
            } else {
                weatherAnimation.innerHTML = '';
            }
        })
        .catch(error => {
            loader.style.display = 'none';
            locationElement.textContent = "Error:";
            temperatureElement.textContent = "";
            descriptionElement.textContent = "Failed to fetch weather data.";
            console.error('Error fetching weather data:', error);
        });
}
