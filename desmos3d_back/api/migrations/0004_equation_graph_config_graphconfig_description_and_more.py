# Generated by Django 5.2 on 2025-05-04 13:06

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_savedgraph_savedequation'),
    ]

    operations = [
        migrations.AddField(
            model_name='equation',
            name='graph_config',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='equations', to='api.graphconfig'),
        ),
        migrations.AddField(
            model_name='graphconfig',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='graphconfig',
            name='is_saved',
            field=models.BooleanField(default=False),
        ),
    ]
