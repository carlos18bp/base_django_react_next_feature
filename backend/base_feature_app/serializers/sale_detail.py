from rest_framework import serializers

from base_feature_app.models import Sale
from base_feature_app.serializers.sale import SoldProductSerializer


class SaleDetailSerializer(serializers.ModelSerializer):
    sold_products = SoldProductSerializer(many=True)

    class Meta:
        model = Sale
        fields = '__all__'
