import os

from django.http import JsonResponse
from django.urls import path, include
from django.conf import settings
from django.contrib import admin
from base_feature_app.admin import admin_site
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


def health_check(request):
    # 'environment' reads the SETTING first: DJANGO_ENV lives in backend/.env
    # (read by the settings module), while systemd only exports
    # DJANGO_SETTINGS_MODULE — os.getenv alone reports 'development' in
    # production. The setting is what the app itself believes it is.
    # 'project' (the clone dir name == canonical fleet name) and 'environment'
    # let external probes verify WHO answered — a dead staging domain can fall
    # through DNS/nginx to another app (measured: /qa pilot #3, F24).
    return JsonResponse({
        'status': 'ok',
        'project': settings.BASE_DIR.parent.name,
        'environment': getattr(settings, 'DJANGO_ENV', os.getenv('DJANGO_ENV', 'development')),
    })


urlpatterns = [
    path('api/health/', health_check, name='health-check'),
    path('admin-gallery/', admin.site.urls),
    path('admin/', admin_site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('base_feature_app.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if getattr(settings, 'ENABLE_SILK', False):
    urlpatterns += [path('silk/', include('silk.urls', namespace='silk'))]
