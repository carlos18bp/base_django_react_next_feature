from django.db import models
from base_feature_app.models import Product

class SoldProduct(models.Model):
    """
    Model representing a product in the cart.
    """
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.IntegerField()

    def __str__(self):
        return f'{self.product.title} (Qty: {self.quantity})'

class Sale(models.Model):
    """
    Model representing a sale.
    """
    email = models.EmailField()
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    sold_products = models.ManyToManyField(SoldProduct)

    def __str__(self):
        return self.email

    def delete(self, *args, **kwargs):
        # Delete all sold products associated with this sale
        for sold_product in self.sold_products.all():
            sold_product.delete()
        # Call the superclass delete method
        super().delete(*args, **kwargs)