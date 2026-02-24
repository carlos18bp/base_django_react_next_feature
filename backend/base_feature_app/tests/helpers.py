"""
Test helper utilities shared across multiple test modules.

These are utility functions (not fixtures) that provide common
data-building or response-parsing operations reused in tests.
"""
from django_attachments.models import Library

from base_feature_app.models import Blog, Product, Sale, SoldProduct


def get_paginated_results(response_data):
    """
    Extract results list from a DRF PageNumberPagination response.

    Args:
        response_data: The parsed JSON body of a paginated API response.

    Returns:
        list: The 'results' array, or the original data if not paginated.
    """
    if isinstance(response_data, dict) and 'results' in response_data:
        return response_data['results']
    return response_data


def make_library(title='Test Library'):
    """
    Create and return a Library instance for gallery fields.

    Args:
        title: Human-readable label for the library.

    Returns:
        Library: The created Library instance.
    """
    return Library.objects.create(title=title)


def make_product(title='Test Product', price=29.99, category='Electronics', sub_category='Gadgets'):
    """
    Create and return a Product instance with a fresh gallery.

    Args:
        title: Product display name.
        price: Unit price in default currency.
        category: Top-level product category.
        sub_category: Secondary product category.

    Returns:
        Product: The created Product instance.
    """
    gallery = make_library(f'{title} Gallery')
    return Product.objects.create(
        title=title,
        category=category,
        sub_category=sub_category,
        description=f'Description for {title}',
        price=price,
        gallery=gallery,
    )


def make_blog(title='Test Blog', category='Tech'):
    """
    Create and return a Blog instance with a fresh image library.

    Args:
        title: Blog post title.
        category: Blog category label.

    Returns:
        Blog: The created Blog instance.
    """
    image = make_library(f'{title} Image')
    return Blog.objects.create(
        title=title,
        description=f'Description for {title}',
        category=category,
        image=image,
    )


def make_sale(email='buyer@example.com', products_and_quantities=None):
    """
    Create and return a Sale with associated SoldProduct records.

    Args:
        email: Customer email address for the sale.
        products_and_quantities: List of (Product, quantity) tuples.
            Defaults to creating one product with quantity 1.

    Returns:
        Sale: The created Sale instance.
    """
    if products_and_quantities is None:
        product = make_product()
        products_and_quantities = [(product, 1)]

    sale = Sale.objects.create(
        email=email,
        address='123 Test Street',
        city='Test City',
        state='Test State',
        postal_code='12345',
    )
    for product, quantity in products_and_quantities:
        sold = SoldProduct.objects.create(product=product, quantity=quantity)
        sale.sold_products.add(sold)

    return sale
