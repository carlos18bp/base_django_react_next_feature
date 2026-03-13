from django.urls import include, path

urlpatterns = [
    path('google-captcha/', include('base_feature_app.urls.captcha')),
    path('contact/', include('base_feature_app.urls.contact')),
]