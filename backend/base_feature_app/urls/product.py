from django.urls import path

from base_feature_app.views import product, product_crud

urlpatterns = [
    path('products-data/', product.product_list, name='product-list'),
    path('products/', product_crud.products, name='products'),
    path('products/<int:product_id>/', product_crud.product_detail, name='product-detail'),
]
