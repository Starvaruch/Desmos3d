from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class GraphConfig(models.Model):
    name = models.CharField(max_length=100, default="Default Config")
    xMin = models.FloatField(default=-10)
    xMax = models.FloatField(default=10)
    yMin = models.FloatField(default=-10)
    yMax = models.FloatField(default=10)
    xStep = models.FloatField(default=0.1)
    gridVisible = models.BooleanField(default=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='graph_configs', null=True)
    description = models.TextField(blank=True, null=True)
    is_saved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Equation(models.Model):
    expression = models.CharField(max_length=255)
    color = models.CharField(max_length=20, default="#3498db")
    visible = models.BooleanField(default=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='equations', null=True)
    graph_config = models.ForeignKey(GraphConfig, on_delete=models.CASCADE, related_name='equations', null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.expression