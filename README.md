# Node.js Character Management System

This Node.js application allows you to manage characters including viewing all characters, searching by name, deleting by name, and adding new characters. Additionally, it provides API endpoints for user authentication including login and registration.

## Features

- View all characters
- Search characters by name
- Delete characters by name
- Add new characters
- API endpoints for user authentication:
  - Login
  - Register

## Requirements

- Node.js
- npm (Node Package Manager)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/sevdevelop11/test-api.git

2. **Navigate to the project directory:**
   cd test-api

3. **Install dependencies:**
    npm install
  
4. **Set up the environment variables:**
   Create a .env file in the root directory and add the following:
     PORT=3000
     DATABASE_URL=your_database_url
     SECRET_KEY=your_secret_key

   Replace your_database_url with your database connection URL and your_secret_key with a secret key for JWT authentication.

5. **Start the application:**
   npm start

# Usage
## Character Management
- View all characters: Navigate to /characters endpoint.
- Search characters by name: Navigate to /characters?name=charactername endpoint.
- Delete characters by name: Send a DELETE request to /characters/:name endpoint, replacing :name with the name of the character to delete.
- Add new characters: Send a POST request to /characters endpoint with a JSON payload containing character information.

## API Endpoints
Login
- URL: /api/login
- Method: POST
- Data Params: { "username": "your_username", "password": "your_password" }
- Register

- URL: /api/register
- Method: POST
- Data Params: { "username": "new_username", "password": "new_password" }

 ## Contributing
Contributions are welcome! Please feel free to submit a pull request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.



   
