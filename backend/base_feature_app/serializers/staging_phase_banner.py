from rest_framework import serializers

from base_feature_app.models import StagingPhaseBanner


class StagingPhaseBannerSerializer(serializers.ModelSerializer):
    expires_at = serializers.DateTimeField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True, allow_null=True)
    is_expired = serializers.BooleanField(read_only=True)
    phase_labels = serializers.DictField(read_only=True, child=serializers.CharField())

    class Meta:
        model = StagingPhaseBanner
        fields = [
            'is_visible',
            'current_phase',
            'phase_labels',
            'started_at',
            'expires_at',
            'days_remaining',
            'is_expired',
            'contact_whatsapp',
            'contact_email',
        ]
