from django.db import models
from django_attachments.models import Library
from django_attachments.fields import GalleryField

class Product(models.Model):
    """
    Product model.

    :ivar category: category product.
    :vartype category: str
    :ivar sub_category: subcategory product.
    :vartype sub_category: str
    :ivar title: title product.
    :vartype title: str
    :ivar description: description product.
    :vartype description: str
    :ivar price: price of the product.
    :vartype price: int
    :ivar gallery: gallery of images associated with the product.
    :vartype gallery: Gallery
    :ivar categoria: category of the product in Spanish.
    """

    title = models.CharField(max_length=40)
    category = models.CharField(max_length=40)
    sub_category = models.CharField(max_length=40)    
    description = models.TextField()

    price = models.IntegerField()
    gallery = GalleryField(related_name='products_with_attachment', on_delete=models.CASCADE)

    def __str__(self):
        return self.title

    def delete(self, *args, **kwargs):
        try:
            if self.gallery:
                self.gallery.delete()
        except Library.DoesNotExist:
            pass
        super(Product, self).delete(*args, **kwargs)