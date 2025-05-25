# Desmos3D Backend API

This is the Django REST Framework backend for the Desmos3D application, providing API endpoints for storing and managing 3D graph equations and configurations.

## Setup

1. Make sure you have Python 3.13 installed
2. Set up a virtual environment and activate it:
```bash
python3.13 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

## API Endpoints

- `GET /api/equations/` - List all equations
- `POST /api/equations/` - Create a new equation
- `GET /api/equations/{id}/` - Retrieve a specific equation
- `PUT /api/equations/{id}/` - Update a specific equation
- `DELETE /api/equations/{id}/` - Delete a specific equation

- `GET /api/graph-configs/` - List all graph configurations
- `POST /api/graph-configs/` - Create a new graph configuration
- `GET /api/graph-configs/{id}/` - Retrieve a specific graph configuration
- `PUT /api/graph-configs/{id}/` - Update a specific graph configuration
- `DELETE /api/graph-configs/{id}/` - Delete a specific graph configuration

## API Documentation

- Swagger UI: `/swagger/` - Interactive API documentation
- ReDoc: `/redoc/` - Alternative API documentation viewer

## Admin Interface

Access the admin interface at `/admin/` to manage equations and graph configurations.