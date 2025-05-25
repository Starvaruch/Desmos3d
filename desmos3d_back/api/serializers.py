from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Equation, GraphConfig

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}
        
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class EquationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equation
        fields = ['id', 'expression', 'color', 'visible', 'graph_config', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class GraphConfigSerializer(serializers.ModelSerializer):
    equations = EquationSerializer(many=True, read_only=True)
    
    class Meta:
        model = GraphConfig
        fields = ['id', 'name', 'description', 'xMin', 'xMax', 'yMin', 'yMax', 'xStep', 'gridVisible', 'is_saved', 'equations', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class SaveGraphRequestSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100, default="Мой график")
    description = serializers.CharField(required=False, allow_blank=True)
    config = serializers.DictField()
    equations = serializers.ListField(
        child=serializers.DictField()
    )