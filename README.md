# LexiLand

LexiLand is an interactive educational web application designed to support children with dyslexia in developing their reading and language skills through fun and engaging activities.

## About the Project

The application was developed as a diploma project to provide children with an additional tool for practicing reading and language skills in an interactive and supportive environment. It can be used independently at home or together with parents and educational professionals.

LexiLand is intended as a supplementary learning tool, not a replacement for professional support.

## Features

- User registration, login, and profile management.
- Six types of educational games:
  - Memory
  - Word Building
  - Missing Letter
  - Rhymes
  - Syllables
  - Sound Manipulation
- Interactive learning activities adapted to different age groups (5–7, 8–10, and 11–15).
- Reading support using text-to-speech and speech recognition.
- Progress tracking and activity history.
- Unlockable worlds and missions based on completed activities.
- Customizable reading settings, including the OpenDyslexic font.
- Relaxation activities.

## Technologies Used

### Frontend
- React
- JavaScript
- Vite
- CSS

### Backend
- Java
- Spring Boot
- Maven
- REST API

### Database
- PostgreSQL

### Additional Services
- Microsoft Azure Speech for text-to-speech and speech recognition.

## Getting Started

The application can be started locally by running the frontend and backend separately.

### Prerequisites

Make sure the following tools are installed:

- Node.js and npm
- Java JDK
- PostgreSQL

### 1. Clone the Repository

```bash
git clone https://github.com/draganaristova/dyslexia.git
cd dyslexia
```

### 2. Start the Backend

Open a terminal and navigate to the backend directory.

On Windows, run:

```cmd
mvnw.cmd spring-boot:run
```

Make sure the PostgreSQL database is running and the backend configuration contains the correct database connection settings.

### 3. Start the Frontend

Open another terminal and navigate to the frontend directory.

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will display the local URL in the terminal. Open that URL in your browser to access the application.

## Configuration

Before running the application, make sure the required configuration is provided, including:

- PostgreSQL database connection settings.
- Microsoft Azure Speech credentials and configuration, if speech features are used.

Do not commit passwords, API keys, or other sensitive configuration values to the repository.

## Project Status

LexiLand is a diploma project. The application has been functionally tested during development, but it has not yet been evaluated with children with dyslexia in real-world conditions.

## Future Improvements

- Manage educational content separately from the application source code.
- Add more educational games and learning activities.
- Collect feedback from children, parents, and educational professionals.
- Improve the platform based on user feedback and testing.

## License

This project was developed for academic purposes.
