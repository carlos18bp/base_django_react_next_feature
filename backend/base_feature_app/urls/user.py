from django.urls import path

from base_feature_app.views import user_crud

urlpatterns = [
    path('users/', user_crud.users, name='user-list'),
    path('users/<int:user_id>/', user_crud.user_detail, name='user-detail'),
]
