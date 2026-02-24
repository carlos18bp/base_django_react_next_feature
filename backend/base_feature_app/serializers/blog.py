from rest_framework import serializers
from base_feature_app.models import Blog

class BlogSerializer(serializers.ModelSerializer):
    """
    Blog serializer.

    Serializes and deserializes Blog instances.
    """

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Blog
        fields = '__all__'

    def get_image_url(self, obj):
        """
        Retrieves the URL of the image associated with the Blog instance.

        :param obj: The Blog instance.
        :return: The absolute URL of the image.
        """
        request = self.context.get('request')
        if not request:
            return None
        if obj.image:
            attachment = obj.image.attachment_set.first()
            if attachment:
                return request.build_absolute_uri(obj.image.attachment_set.all()[0].file.url)
        return None
