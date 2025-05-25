from django.contrib import admin
from .models import Equation, GraphConfig

@admin.register(Equation)
class EquationAdmin(admin.ModelAdmin):
    list_display = ('expression', 'user', 'color', 'visible', 'created_at')
    list_filter = ('user', 'visible', 'created_at')
    search_fields = ('expression', 'user__username')
    ordering = ('-created_at',)
    list_per_page = 20

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(user=request.user)

@admin.register(GraphConfig)
class GraphConfigAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'xMin', 'xMax', 'yMin', 'yMax', 'gridVisible', 'is_saved', 'created_at')
    list_filter = ('user', 'gridVisible', 'is_saved', 'created_at')
    search_fields = ('name', 'user__username', 'description')
    ordering = ('-created_at',)
    list_per_page = 20

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(user=request.user)
