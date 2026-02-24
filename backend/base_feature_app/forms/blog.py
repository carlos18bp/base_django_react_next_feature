from django import forms
from django_attachments.models import Library
from base_feature_app.models import Blog

class BlogForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def clean_image(self):
        image = self.cleaned_data.get('image')
        if image and image.attachment_set.count() > 1:
            raise forms.ValidationError("Only one file is allowed.")
        return image

    def save(self, commit=True):
        obj = super().save(commit=False)
        if not hasattr(obj, 'image'):
            lib = Library()
            lib.save()
            obj.image = lib
        if commit:
            obj.save()
        return obj

    class Meta:
        model = Blog
        fields = '__all__'
