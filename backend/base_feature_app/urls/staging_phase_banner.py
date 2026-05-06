from django.urls import path

from base_feature_app.views import staging_phase_banner

urlpatterns = [
    path('staging-banner/', staging_phase_banner.staging_banner_state, name='staging-banner'),
]
