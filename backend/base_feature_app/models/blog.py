from django.db import models
from django_attachments.models import Library
from django_attachments.fields import SingleImageField

class Blog(models.Model):
    """
    Blog model.

    :ivar title: title blog.
    :vartype title: str
    :ivar description: description blog.
    :vartype description: str
    :ivar category: category blog.
    :vartype category: str
    :ivar image: image by blog.
    :vartype image: Image
    """

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=40)
    image = SingleImageField(related_name='blog_image', on_delete=models.CASCADE)

    def __str__(self):
        return self.title
    
    def delete(self, *args, **kwargs):
        try:
            if self.image:
                self.image.delete()
        except Library.DoesNotExist:
            pass
        super(Blog, self).delete(*args, **kwargs)