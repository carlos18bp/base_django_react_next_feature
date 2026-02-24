from rest_framework import serializers
from base_feature_app.models import Product

class ProductSerializer(serializers.ModelSerializer):

    gallery_urls = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = '__all__'

    def get_gallery_urls(self, obj):
        """
        Retrieves the URLs of all images in the gallery associated with the Product instance.
        
        :param obj: The Product instance.
        :return: A list of absolute URLs of the images in the gallery.
        """
        request = self.context.get('request')
        if not request:
            return []
        if obj.gallery:
            return [request.build_absolute_uri(attachment.file.url) for attachment in obj.gallery.attachment_set.all()]
        return []