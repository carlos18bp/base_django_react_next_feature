from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from base_feature_app.models import StagingPhaseBanner
from base_feature_app.serializers.staging_phase_banner import StagingPhaseBannerSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def staging_banner_state(request):
    """Public endpoint returning the current staging phase banner state.

    Frontend uses this to render the top banner and the expired-takeover view.
    Visibility is controlled exclusively via `StagingPhaseBanner.is_visible`
    in the Django admin — the feature is never deleted.
    """
    banner = StagingPhaseBanner.get_solo()
    serializer = StagingPhaseBannerSerializer(banner)
    return Response(serializer.data, status=status.HTTP_200_OK)
