# TruckFlow

TruckFlow is a comprehensive solution for truck drivers and fleet managers to optimize trucking operations through intelligent route planning and automated ELD (Electronic Logging Device) compliance.

## Deployed Application

**Live Demo:** [https://spotter-ai.vercel.app/](https://spotter-ai.vercel.app/)

**Demo Credentials:**  
- Email: admin@gmail.com
- Password: Admin@123

## Features

- **Intelligent Route Planning**: Optimize routes with real-time traffic data and ELD compliance built-in
- **Automated ELD Logs**: Generate electronic logging device sheets that comply with FMCSA regulations
- **Rest Stop & Fuel Planning**: Find optimal locations for rest breaks and refueling
- **Hours of Service Compliance**: Support for property-carrying drivers (70hrs/8days)
- **Accurate Time Estimations**: 1 hour for pickup and drop-off operations built into schedule

## Technology Stack

- **Frontend**: Next.js & React with Tailwind CSS
- **Backend**: Django REST Framework
- **Maps**: Mapbox API for route visualization
- **Hosting**: AWS (Backend) & Vercel (Frontend)
- **Database**: MySQL

## Core Functionality

TruckFlow takes the following inputs:
- Current location
- Pickup location
- Dropoff location
- Current Cycle Used (Hours)

And produces:
- Interactive map showing the optimized route
- Required rest stops based on HOS regulations
- Fueling locations (at least once every 1,000 miles)
- Automated ELD logs compliant with regulations

## Project Structure

```
truckflow/
├── frontend/               # Next.js React application
│   ├── components/         # React components
│   ├── pages/              # Next.js pages
│   ├── public/             # Static assets
│   └── styles/             # CSS styles
│
├── backend/                # Django application
│   ├── api/                # Django REST API
│   ├── spotter/              # Route planning logic
│
└── docs/                   # Documentation
```

## Key Assumptions

- Property-carrying driver, 70hrs/8days, no adverse driving conditions
- Fueling at least once every 1,000 miles
- 1 hour allocated for pickup and drop-off operations

## Local Development Setup

### Backend (Django)

```bash
# Clone the repository
git clone https://github.com/kuldeep55567/spotter.git
cd spotter/backend

# Create and activate virtual environment
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Run development server
python manage.py runserver
```

### Frontend (Next.js)

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## API Documentation

The TruckFlow API provides endpoints for:
- User authentication
- Route planning
- ELD log generation

For detailed API documentation, see the `/api` tab in the application.

## Future Enhancements

- Mobile app with offline capabilities
- Integration with popular fleet management systems
- Real-time driver communication
- Fuel price optimization
- Weather condition alerts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.