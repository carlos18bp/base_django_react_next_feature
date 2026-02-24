from rest_framework import serializers

from base_feature_app.models import Product


class ProductDetailSerializer(serializers.ModelSerializer):
    gallery_urls = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_gallery_urls(self, obj):
        request = self.context.get('request')
        if not request:
            return []
        if obj.gallery:
            return [request.build_absolute_uri(a.file.url) for a in obj.gallery.attachment_set.all()]
        return []
