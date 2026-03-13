from django.urls import path, include
from django.conf import settings
from django.contrib import admin
from base_feature_app.admin import admin_site
from django.conf.urls.static import static

urlpatterns = [
    path('admin-gallery/', admin.site.urls),
    path('admin/', admin_site.urls),
    path('api/', include('base_feature_app.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
