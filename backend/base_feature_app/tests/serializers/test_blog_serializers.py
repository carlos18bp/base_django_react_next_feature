import io

import pytest
from django.conf import settings as django_settings
from django.core.files.base import ContentFile
from django_attachments.models import Attachment, Library
from PIL import Image
from rest_framework.test import APIRequestFactory

from base_feature_app.models import Blog
from base_feature_app.serializers.blog import BlogSerializer
from base_feature_app.serializers.blog_detail import BlogDetailSerializer
from base_feature_app.serializers.blog_list import BlogListSerializer


def _placeholder_image(name='placeholder.webp'):
    image = Image.new('RGB', (10, 10), color=(240, 240, 240))
    buffer = io.BytesIO()
    image.save(buffer, format='WEBP')
    buffer.seek(0)
    return ContentFile(buffer.read(), name=name)


@pytest.mark.django_db
def test_blog_list_serializer_includes_absolute_image_url():
    library = Library.objects.create(title='Blog Image')
    Attachment.objects.create(library=library, file=_placeholder_image(), original_name='placeholder.webp', rank=0)
    blog = Blog.objects.create(title='T', description='D', category='C', image=library)

    factory = APIRequestFactory()
    request = factory.get('/api/blogs/')

    serializer = BlogListSerializer(blog, context={'request': request})
    assert serializer.data['image_url'].startswith('http://testserver/')


@pytest.mark.django_db
def test_blog_list_serializer_returns_none_without_request():
    library = Library.objects.create(title='Blog Image')
    blog = Blog.objects.create(title='T', description='D', category='C', image=library)

    serializer = BlogListSerializer(blog)

    assert serializer.data['image_url'] is None


@pytest.mark.django_db
def test_blog_serializer_returns_none_without_request():
    library = Library.objects.create(title='Blog Image')
    blog = Blog.objects.create(title='T', description='D', category='C', image=library)

    serializer = BlogSerializer(blog)

    assert serializer.data['image_url'] is None


@pytest.mark.django_db
def test_blog_serializer_returns_none_without_attachment(monkeypatch, tmp_path):
    monkeypatch.setattr(django_settings, 'MEDIA_ROOT', tmp_path)
    library = Library.objects.create(title='Blog Image')
    blog = Blog.objects.create(title='T', description='D', category='C', image=library)

    factory = APIRequestFactory()
    request = factory.get('/api/blogs/')

    serializer = BlogSerializer(blog, context={'request': request})

    assert serializer.data['image_url'] is None


@pytest.mark.django_db
def test_blog_detail_serializer_includes_image_url(monkeypatch, tmp_path):
    monkeypatch.setattr(django_settings, 'MEDIA_ROOT', tmp_path)
    library = Library.objects.create(title='Blog Image')
    Attachment.objects.create(library=library, file=_placeholder_image(), original_name='placeholder.webp', rank=0)
    blog = Blog.objects.create(title='T', description='D', category='C', image=library)

    factory = APIRequestFactory()
    request = factory.get('/api/blogs/')

    serializer = BlogDetailSerializer(blog, context={'request': request})

    assert serializer.data['image_url'].startswith('http://testserver/')


@pytest.mark.django_db
def test_blog_detail_serializer_returns_none_without_request():
    library = Library.objects.create(title='Blog Image')
    blog = Blog.objects.create(title='T', description='D', category='C', image=library)

    serializer = BlogDetailSerializer(blog)

    assert serializer.data['image_url'] is None


@pytest.mark.django_db
def test_blog_serializer_includes_image_url(monkeypatch, tmp_path):
    monkeypatch.setattr(django_settings, 'MEDIA_ROOT', tmp_path)
    library = Library.objects.create(title='Blog Image')
    Attachment.objects.create(library=library, file=_placeholder_image(), original_name='placeholder.webp', rank=0)
    blog = Blog.objects.create(title='T', description='D', category='C', image=library)

    factory = APIRequestFactory()
    request = factory.get('/api/blogs/')

    serializer = BlogSerializer(blog, context={'request': request})

    assert serializer.data['image_url'].startswith('http://testserver/')
