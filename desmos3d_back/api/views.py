from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth import authenticate
from .models import Equation, GraphConfig
from .serializers import (
    EquationSerializer, GraphConfigSerializer, UserSerializer, 
    SaveGraphRequestSerializer
)

# Create your views here.

class EquationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on equations
    """
    serializer_class = EquationSerializer
    
    def get_queryset(self):
        """
        This view should return a list of all equations
        for the currently authenticated user.
        """
        user = self.request.user
        return Equation.objects.filter(user=user)
    
    def perform_create(self, serializer):
        """Save the user when creating a new equation"""
        serializer.save(user=self.request.user)

class GraphConfigViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on graph configurations
    """
    serializer_class = GraphConfigSerializer
    
    def get_queryset(self):
        """
        This view should return a list of all graph configs
        for the currently authenticated user.
        """
        user = self.request.user
        return GraphConfig.objects.filter(user=user)
    
    def perform_create(self, serializer):
        """Save the user when creating a new graph config"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def saved(self, request):
        """
        Returns all saved graph configurations for the user
        """
        queryset = self.get_queryset().filter(is_saved=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def save_current(self, request):
        """
        Save the current graph state as a new graph configuration
        """
        serializer = SaveGraphRequestSerializer(data=request.data)
        if serializer.is_valid():
            # Create graph config
            config_data = serializer.validated_data['config']
            graph_config = GraphConfig.objects.create(
                user=request.user,
                name=serializer.validated_data['name'],
                description=serializer.validated_data.get('description', ''),
                xMin=config_data.get('xMin', -10),
                xMax=config_data.get('xMax', 10),
                yMin=config_data.get('yMin', -10),
                yMax=config_data.get('yMax', 10),
                xStep=config_data.get('xStep', 0.1),
                gridVisible=config_data.get('gridVisible', True),
                is_saved=True
            )
            
            # Create equations
            equations_data = serializer.validated_data['equations']
            for eq_data in equations_data:
                Equation.objects.create(
                    user=request.user,
                    graph_config=graph_config,
                    expression=eq_data.get('expression', ''),
                    color=eq_data.get('color', '#3498db'),
                    visible=eq_data.get('visible', True)
                )
            
            return Response(
                GraphConfigSerializer(graph_config).data, 
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def default_data(request):
    """
    Returns default data for initializing the graph when no data exists
    """
    default_config = {
        "xMin": -10,
        "xMax": 10,
        "yMin": -10,
        "yMax": 10,
        "xStep": 0.1,
        "gridVisible": True
    }
    
    default_equations = [
        {
            "id": "default-1",
            "expression": "sin(x)",
            "color": "#3498db",
            "visible": True
        },
        {
            "id": "default-2",
            "expression": "cos(x)",
            "color": "#e74c3c",
            "visible": True
        }
    ]
    
    return Response({
        "config": default_config,
        "equations": default_equations
    })

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """
    Register a new user and return auth token
    """
    print(request.data)


    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email
        }, status=status.HTTP_201_CREATED)
    
    print(serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_user(request):
    """
    Login and return auth token
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email
        })

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def test_auth_endpoint(request):
    """
    Simple endpoint to test if auth endpoints are working
    """
    return Response({
        'message': 'Auth endpoints are working',
        'endpoints': {
            'register': '/api/auth/register/',
            'login': '/api/auth/login/',
            'token': '/api/auth/token/'
        }
    })

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def list_routes(request):
    """
    List all available API routes for diagnostics
    """
    from django.urls import get_resolver
    resolver = get_resolver()
    url_patterns = resolver.url_patterns
    
    api_routes = []
    for pattern in url_patterns:
        if hasattr(pattern, 'url_patterns'):
            for url in pattern.url_patterns:
                if hasattr(url, 'pattern'):
                    api_routes.append(str(url.pattern))
                elif hasattr(url, 'url_patterns'):
                    for nested_url in url.url_patterns:
                        if hasattr(nested_url, 'pattern'):
                            api_routes.append(str(nested_url.pattern))
    
    # Get module-specific routes
    module_routes = []
    #for url in urlpatterns:
    #    if hasattr(url, 'pattern'):
    #        module_routes.append(str(url.pattern))
    
    return Response({
        'message': 'API routes found',
        'all_routes': api_routes,
        'module_routes': module_routes
    })
