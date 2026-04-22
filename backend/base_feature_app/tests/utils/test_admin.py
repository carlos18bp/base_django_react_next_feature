import pytest
from django.contrib.messages.storage.fallback import FallbackStorage
from django.core.exceptions import PermissionDenied
from django.test import RequestFactory
from django_attachments.models import Library

from base_feature_app.admin import (
    BaseFeatureUserAdmin,
    BlogAdmin,
    PasswordCodeAdmin,
    ProductAdmin,
    SaleAdmin,
    admin_site,
)
from base_feature_app.models import Blog, PasswordCode, Product, Sale, SoldProduct, User


def _request_with_messages(user):
    request = RequestFactory().get('/admin/')
    request.user = user
    request.session = {}
    setattr(request, '_messages', FallbackStorage(request))
    return request


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


@pytest.mark.django_db
def test_user_admin_login_as_link_renders_admin_url():
    user = User.objects.create_user(email='target@example.com', password='pass1234')
    admin = BaseFeatureUserAdmin(User, admin_site)

    html = admin.login_as_link(user)

    assert 'Login as this user' in html
    assert f'/admin/base_feature_app/user/{user.id}/login_as/' in html


@pytest.mark.django_db
def test_user_admin_login_as_redirects_to_frontend(settings):
    factory = RequestFactory()
    admin_user = User.objects.create_superuser(email='admin@example.com', password='pass1234')
    target_user = User.objects.create_user(email='target@example.com', password='pass1234')
    request = factory.get('/admin/')
    request.user = admin_user
    settings.FRONTEND_URL = 'http://localhost:3000'

    admin = BaseFeatureUserAdmin(User, admin_site)
    response = admin.login_as_user_view(request, target_user.id)

    assert response.status_code == 302
    assert response['Location'].startswith('http://localhost:3000/admin-login?')
    assert 'access=' in response['Location']
    assert 'refresh=' in response['Location']
    assert 'redirect=%2F' in response['Location']


@pytest.mark.django_db
def test_user_admin_login_as_requires_active_superuser():
    factory = RequestFactory()
    regular_user = User.objects.create_user(email='user@example.com', password='pass1234')
    target_user = User.objects.create_user(email='target@example.com', password='pass1234')
    request = factory.get('/admin/')
    request.user = regular_user

    admin = BaseFeatureUserAdmin(User, admin_site)

    with pytest.raises(PermissionDenied):
        admin.login_as_user_view(request, target_user.id)


@pytest.mark.django_db
@pytest.mark.parametrize('build_target', [
    pytest.param(
        lambda: User.objects.create_superuser(email='target@example.com', password='pass1234'),
        id='superuser',
    ),
    pytest.param(
        lambda: User.objects.create_user(
            email='target@example.com', password='pass1234', is_active=False,
        ),
        id='inactive',
    ),
])
def test_user_admin_login_as_blocks_ineligible_target(build_target):
    admin_user = User.objects.create_superuser(email='admin@example.com', password='pass1234')
    target_user = build_target()
    request = _request_with_messages(admin_user)

    admin = BaseFeatureUserAdmin(User, admin_site)
    response = admin.login_as_user_view(request, target_user.id)

    assert response.status_code == 302
    assert 'access=' not in response['Location']
    assert f'/user/{target_user.id}/change/' in response['Location']
