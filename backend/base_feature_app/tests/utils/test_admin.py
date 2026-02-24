import pytest
from django.test import RequestFactory
from django_attachments.models import Library

from base_feature_app.admin import (
    BlogAdmin,
    PasswordCodeAdmin,
    ProductAdmin,
    SaleAdmin,
    admin_site,
)
from base_feature_app.models import Blog, PasswordCode, Product, Sale, SoldProduct, User


@pytest.mark.django_db
def test_password_code_admin_disables_add_permission():
    admin = PasswordCodeAdmin(PasswordCode, admin_site)
    request = RequestFactory().get('/admin/')

    assert admin.has_add_permission(request) is False


@pytest.mark.django_db
def test_blog_admin_delete_queryset_removes_objects():
    library = Library.objects.create(title='Blog Library')
    blog = Blog.objects.create(
        title='Test Blog',
        description='Desc',
        category='Cat',
        image=library,
    )

    admin = BlogAdmin(Blog, admin_site)
    admin.delete_queryset(RequestFactory().get('/admin/'), Blog.objects.filter(id=blog.id))

    assert Blog.objects.count() == 0


@pytest.mark.django_db
def test_product_admin_delete_queryset_removes_gallery():
    """Verifies ProductAdmin.delete_queryset removes the product and its associated gallery library."""
    library = Library.objects.create(title='Product Library')
    product = Product.objects.create(
        title='Test Product',
        category='Cat',
        sub_category='Sub',
        description='Desc',
        price=50,
        gallery=library,
    )

    admin = ProductAdmin(Product, admin_site)
    admin.delete_queryset(RequestFactory().get('/admin/'), Product.objects.filter(id=product.id))

    assert Product.objects.count() == 0
    assert Library.objects.filter(id=library.id).count() == 0


@pytest.mark.django_db
def test_sale_admin_delete_queryset_and_total():
    """Verifies SaleAdmin computes total products correctly and deletes the sale with its sold products."""
    library = Library.objects.create(title='Sale Library')
    product = Product.objects.create(
        title='Test Product',
        category='Cat',
        sub_category='Sub',
        description='Desc',
        price=50,
        gallery=library,
    )
    sold_product = SoldProduct.objects.create(product=product, quantity=2)
    sale = Sale.objects.create(
        email='buyer@example.com',
        address='Addr',
        city='City',
        state='State',
        postal_code='12345',
    )
    sale.sold_products.add(sold_product)

    admin = SaleAdmin(Sale, admin_site)

    assert admin.get_total_products(sale) == 1

    admin.delete_queryset(RequestFactory().get('/admin/'), Sale.objects.filter(id=sale.id))

    assert Sale.objects.count() == 0
    assert SoldProduct.objects.count() == 0


@pytest.mark.django_db
def test_admin_site_custom_sections():
    """Verifies the custom admin site exposes all required model sections in the app list."""
    User.objects.create_superuser(email='admin@example.com', password='pass1234')
    request = RequestFactory().get('/admin/')
    request.user = User.objects.get(email='admin@example.com')

    app_list = admin_site.get_app_list(request)

    object_names = {model['object_name'] for section in app_list for model in section['models']}

    assert {'User', 'PasswordCode', 'Blog', 'Product', 'Sale', 'SoldProduct'}.issubset(object_names)
