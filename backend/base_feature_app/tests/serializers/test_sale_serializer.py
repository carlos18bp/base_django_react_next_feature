import pytest
from django_attachments.models import Library

from base_feature_app.models import Product
from base_feature_app.serializers.sale import SaleSerializer


@pytest.mark.django_db
def test_sale_serializer_creates_sold_products():
    """Verifies SaleSerializer creates a Sale with linked SoldProduct records from the nested payload."""
    gallery = Library.objects.create(title='Gallery')
    product = Product.objects.create(
        title='P',
        category='C',
        sub_category='S',
        description='D',
        price=10,
        gallery=gallery,
    )

    payload = {
        'email': 'a@a.com',
        'address': 'A',
        'city': 'C',
        'state': 'S',
        'postal_code': '1',
        'sold_products': [{'product_id': product.id, 'quantity': 2}],
    }

    serializer = SaleSerializer(data=payload)
    assert serializer.is_valid(), serializer.errors
    sale = serializer.save()

    assert sale.sold_products.count() == 1
    assert sale.sold_products.first().quantity == 2
