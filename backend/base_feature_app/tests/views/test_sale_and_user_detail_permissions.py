import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from django_attachments.models import Library
from rest_framework import status

from base_feature_app.models import Product, Sale, SoldProduct


@pytest.fixture
def gallery(db):
    return Library.objects.create(title='Permission Test Gallery')


@pytest.fixture
def product(gallery):
    return Product.objects.create(
        title='Permission Product',
        category='Cat',
        sub_category='Sub',
        description='Desc',
        price=10,
        gallery=gallery,
    )


@pytest.fixture
def sale(product):
    sold = SoldProduct.objects.create(product=product, quantity=2)
    s = Sale.objects.create(
        email='buyer@example.com',
        address='Addr',
        city='City',
        state='State',
        postal_code='123',
    )
    s.sold_products.add(sold)
    return s


@pytest.mark.django_db
def test_sale_detail_requires_staff(api_client, sale):
    response = api_client.get(reverse('sale-detail', kwargs={'sale_id': sale.id}))

    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_user_detail_requires_staff(api_client):
    User = get_user_model()
    user = User.objects.create_user(email='target@example.com', password='pass1234')

    response = api_client.get(reverse('user-detail', kwargs={'user_id': user.id}))

    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_create_sale_returns_201_with_valid_payload(api_client, product):
    payload = {
        'email': 'buyer@example.com',
        'address': 'Addr',
        'city': 'City',
        'state': 'State',
        'postal_code': '123',
        'sold_products': [{'product_id': product.id, 'quantity': 1}],
    }

    response = api_client.post(reverse('create-sale'), payload, format='json')

    assert response.status_code == status.HTTP_201_CREATED
    assert Sale.objects.count() == 1
