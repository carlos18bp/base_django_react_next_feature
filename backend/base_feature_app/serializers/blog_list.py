from rest_framework import serializers

from base_feature_app.models import Blog


class BlogListSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Blog
        fields = ('id', 'title', 'category', 'image_url')

    def get_image_url(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        if obj.image:
            attachment = obj.image.attachment_set.first()
            if attachment:
                return request.build_absolute_uri(attachment.file.url)
        return None
