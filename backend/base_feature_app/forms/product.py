from django import forms
from django_attachments.models import Library
from base_feature_app.models import Product

class ProductForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def save(self, commit=True):
        obj = super().save(commit=False)
        if not hasattr(obj, 'gallery'):
            lib = Library()
            lib.save()
            obj.gallery = lib
        if commit:
            obj.save()
        return obj

    class Meta:
        model = Product
        fields = '__all__'
