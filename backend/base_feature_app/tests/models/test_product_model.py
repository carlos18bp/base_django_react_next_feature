import io

import pytest
from django.core.files.base import ContentFile
from django_attachments.models import Attachment, Library
from PIL import Image

from base_feature_app.models import Product


def _placeholder_image(name='placeholder.webp'):
    image = Image.new('RGB', (10, 10), color=(240, 240, 240))
    buffer = io.BytesIO()
    image.save(buffer, format='WEBP')
    buffer.seek(0)
    return ContentFile(buffer.read(), name=name)


@pytest.mark.django_db
def test_product_delete_removes_library_and_attachments():
    """Verifies that deleting a product also removes its associated library and all attachments."""
    gallery = Library.objects.create(title='Product Gallery')
    Attachment.objects.create(library=gallery, file=_placeholder_image(), original_name='placeholder.webp', rank=0)
    product = Product.objects.create(
        title='T',
        category='C',
        sub_category='S',
        description='D',
        price=10,
        gallery=gallery,
    )

    gallery_id = gallery.id
    product.delete()

    assert not Library.objects.filter(id=gallery_id).exists()
    assert not Attachment.objects.filter(library_id=gallery_id).exists()


@pytest.mark.django_db
def test_product_str_representation():
    gallery = Library.objects.create(title='Gallery')
    product = Product.objects.create(
        title='My Product',
        category='C',
        sub_category='S',
        description='D',
        price=10,
        gallery=gallery,
    )

    assert str(product) == 'My Product'


@pytest.mark.django_db
def test_product_delete_handles_missing_gallery():
    """Verifies that deleting a product with a non-existent gallery reference does not raise an error."""
    gallery = Library.objects.create(title='Gallery')
    product = Product.objects.create(
        title='T',
        category='C',
        sub_category='S',
        description='D',
        price=10,
        gallery=gallery,
    )

    Product.objects.filter(id=product.id).update(gallery_id=9999)
    product.refresh_from_db()

    product.delete()

    assert not Product.objects.filter(id=product.id).exists()
