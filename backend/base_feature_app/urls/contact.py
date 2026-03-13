"""URL configuration for contact form endpoints."""

from django.urls import path

from base_feature_app.views.contact import submit_contact_form

urlpatterns = [
    path('submit/', submit_contact_form, name='contact-submit'),
]
