from django.urls import include, path

urlpatterns = [
    path('', include('base_feature_app.urls.auth')),
    path('', include('base_feature_app.urls.blog')),
    path('', include('base_feature_app.urls.product')),
    path('', include('base_feature_app.urls.sale')),
    path('', include('base_feature_app.urls.user')),
]
