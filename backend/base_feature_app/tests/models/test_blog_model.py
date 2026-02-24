import io

import pytest
from django.core.files.base import ContentFile
from django_attachments.models import Attachment, Library
from PIL import Image

from base_feature_app.models import Blog


def _placeholder_image(name='placeholder.webp'):
    image = Image.new('RGB', (10, 10), color=(240, 240, 240))
    buffer = io.BytesIO()
    image.save(buffer, format='WEBP')
    buffer.seek(0)
    return ContentFile(buffer.read(), name=name)


@pytest.mark.django_db
def test_blog_delete_removes_library():
    library = Library.objects.create(title='Blog Image')
    Attachment.objects.create(library=library, file=_placeholder_image(), original_name='placeholder.webp', rank=0)
    blog = Blog.objects.create(title='T', description='D', category='C', image=library)

    library_id = library.id
    blog.delete()

    assert not Library.objects.filter(id=library_id).exists()


@pytest.mark.django_db
def test_blog_str_representation():
    library = Library.objects.create(title='Blog Image')
    blog = Blog.objects.create(title='My Blog', description='D', category='C', image=library)

    assert str(blog) == 'My Blog'


@pytest.mark.django_db
def test_blog_delete_handles_missing_library():
    library = Library.objects.create(title='Blog Image')
    blog = Blog.objects.create(title='T', description='D', category='C', image=library)

    Blog.objects.filter(id=blog.id).update(image_id=9999)
    blog.refresh_from_db()

    blog.delete()

    assert not Blog.objects.filter(id=blog.id).exists()
