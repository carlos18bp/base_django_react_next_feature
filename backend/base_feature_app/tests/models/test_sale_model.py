import pytest
from django_attachments.models import Library

from base_feature_app.models import Product, Sale, SoldProduct


@pytest.mark.django_db
def test_sold_product_str_includes_title_and_quantity():
    gallery = Library.objects.create(title='Gallery')
    product = Product.objects.create(
        title='Widget',
        category='Cat',
        sub_category='Sub',
        description='Desc',
        price=10,
        gallery=gallery,
    )
    sold = SoldProduct.objects.create(product=product, quantity=3)

    assert str(sold) == f'{product.title} (Qty: {sold.quantity})'


@pytest.mark.django_db
def test_sale_str_returns_email():
    """Verifies that the string representation of a Sale returns its email address."""
    gallery = Library.objects.create(title='Gallery2')
    product = Product.objects.create(
        title='Widget2',
        category='Cat',
        sub_category='Sub',
        description='Desc',
        price=10,
        gallery=gallery,
    )
    sold = SoldProduct.objects.create(product=product, quantity=1)
    sale = Sale.objects.create(
        email='buyer@example.com',
        address='Addr',
        city='City',
        state='State',
        postal_code='123',
    )
    sale.sold_products.add(sold)

    assert str(sale) == sale.email


@pytest.mark.django_db
def test_sale_delete_removes_sold_products():
    """Verifies that deleting a Sale also removes all associated SoldProduct records."""
    gallery = Library.objects.create(title='Gallery')
    product = Product.objects.create(
        title='P',
        category='C',
        sub_category='S',
        description='D',
        price=10,
        gallery=gallery,
    )

    sold = SoldProduct.objects.create(product=product, quantity=1)
    sale = Sale.objects.create(email='a@a.com', address='A', city='C', state='S', postal_code='1')
    sale.sold_products.add(sold)

    sold_id = sold.id
    sale.delete()

    assert not SoldProduct.objects.filter(id=sold_id).exists()
