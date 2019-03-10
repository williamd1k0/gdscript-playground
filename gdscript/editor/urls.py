
from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^run.gd', views.script, name='script'),
    url(r'^.*', views.index, name='index'),
]
