import pytest
from django.urls import reverse
from django_attachments.models import Library
from rest_framework import status

from base_feature_app.models import Blog, Product


@pytest.fixture
def library(db):
    return Library.objects.create(title='Test Library')


@pytest.fixture
def product(db, library):
    return Product.objects.create(
        title='Test Product',
        category='Test Category',
        sub_category='Test Sub',
        description='Test Description',
        price=100,
        gallery=library,
    )


@pytest.fixture
def blog(db, library):
    return Blog.objects.create(
        title='Test Blog',
        description='Test Description',
        category='Test Category',
        image=library,
    )


@pytest.mark.django_db
def test_product_list_success(api_client, product):
    url = reverse('product-list')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1


@pytest.mark.django_db
def test_blog_list_success(api_client, blog):
    url = reverse('blog-list')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1


@pytest.mark.django_db
def test_create_sale_validation_error(api_client):
    url = reverse('create-sale')
    response = api_client.post(url, {}, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
