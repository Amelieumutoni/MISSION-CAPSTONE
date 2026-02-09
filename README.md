# Craftfolio

## Description
CraftTFOLIO is a web-based platform that allows Rwandan designers and artisans to digitally document, showcase, and sell their creative works. 
The platform aims to provide visibility, easy curation, and direct market connectivity for local creators. 
Users can create profiles, upload their works, and manage their online portfolio.

## Link to the GitHub repo
https://github.com/Amelieumutoni/MISSION-CAPSTONE.git

## link to the video
https://drive.google.com/file/d/19s0CIDRpOvVHkvTgZ9d41xKGJQMh0EHT/view?usp=sharing

## Getting Started

1. **Clone the repository**
```bash

git clone https://github.com/Amelieumutoni/MISSION-CAPSTONE.git

## Prerequisites

- Node.js (v18 or later)
- npm

### Installation

cd mission-capstone-1

Install dependencies

npm install

Run the project

npm start

Open in browser

Visit http://localhost:3000 to view the app.

## Project Structure

```
craftfolio/
├── src/
│   ├── components/    # Reusable UI components
│   ├── Pages/         # Page components
│   ├── App.jsx
│   └── main.jsx
├── public/
└── index.html


## DESIGNS
the following is the link of design created in Figma 
https://www.figma.com/proto/2kxvAftKtQrBbufLmn9Zpl/MISSION-CAPSTONE-PROJECT-DESIGN?node-id=0-1&t=RhZiwIwuHV7TBq4I-1

## Deployment Plan
The project will be deployed usingdeployed on Firebase using the following services:


The platform uses a Docker-based deployment strategy. This method packages each part (frontend, backend services, and databases) i choose this to ensure they run the same way on the  laptop as they do on a live server.

1. Containerization (Docker)
Each microservice is bundled with its own environment and dependencies.

2. The Docker Host
All containers are managed on a Docker Host, which acts as the engine running the entire ecosystem.

The Web API containers communicate internally to handle artisan data, while the Client Apps connect through a central gateway.

3. Database
SQL Server containers store permanent data like artisan biographies and creative metadata.

Redis will be  used for fast, temporary data storage  to ensure the site remains responsive even with many users.

4. Continuous Deployment (CI/CD)
Automated Pipeline: When code is updated on GitHub, it automatically triggers a new "build" of the container image.


