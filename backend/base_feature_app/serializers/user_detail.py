from rest_framework import serializers

from base_feature_app.models import User


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'is_staff', 'date_joined')
