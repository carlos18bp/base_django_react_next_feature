import os
import io
import random
from faker import Faker
from django.core.files import File
from django.core.files.base import ContentFile
from base_feature_app.models import Product
from django.core.management.base import BaseCommand
from django_attachments.models import Attachment, Library
from PIL import Image

class Command(BaseCommand):
    help = 'Create Product records in the database'

    def add_arguments(self, parser):
        parser.add_argument('number_of_products', type=int, nargs='?', default=10)

    def handle(self, *args, **options):
        number_of_products = options['number_of_products']
        fake = Faker()

        # List of test images
        test_images = [
            'media/temp/product/image_temp1.webp',
            'media/temp/product/image_temp2.webp',
            'media/temp/product/image_temp3.webp',
            'media/temp/product/image_temp4.webp',
        ]

        def _get_image_file(index):
            existing = [p for p in test_images if os.path.isfile(os.path.join(os.getcwd(), p))]
            if existing:
                selected = existing[index % len(existing)]
                full_image_path = os.path.join(os.getcwd(), selected)
                with open(full_image_path, 'rb') as image_file:
                    return File(image_file, name=os.path.basename(full_image_path))

            image = Image.new('RGB', (640, 480), color=(240, 240, 240))
            buffer = io.BytesIO()
            image.save(buffer, format='WEBP')
            buffer.seek(0)
            return ContentFile(buffer.read(), name=f'placeholder_{index}.webp')

        categories = [
            'Aesthetic Candles',
            'Decor',
            'Gift & Party Favors'    
        ]
        sub_categories = {
            'Aesthetic Candles': [
                'Greek Sculptures',
                'Love & Romance',
                'Minimalist Modern',
                'Cute Animals',
                'Flowers',
                'Holiday Glow',
                'New Arrivals'
            ],
            'Decor': [
                'Trending Now',
                'New Arrivals'
            ],
            'Gift & Party Favors': [
                "Valentine's Day",
                'Birthdays',
                'Wedding',
                'Christmas',
                "Mother's Day",
                'Gender Reveal & Baby Showers',
                'Trending Now'
            ]  
        }

        for _ in range(number_of_products):
            category = random.choice(categories)
            sub_category = random.choice(sub_categories[category])
            title = fake.word().capitalize()
            description  = fake.text(max_nb_chars=300)

            # Create a new gallery (library)
            gallery = Library.objects.create(title=title)

            # Add test images to the gallery
            for idx, _ in enumerate(test_images):
                upload = _get_image_file(idx)
                Attachment.objects.create(
                    library=gallery,
                    file=upload,
                    original_name=getattr(upload, 'name', f'placeholder_{idx}.webp'),
                    rank=0,
                )

            new_product = Product.objects.create(
                category=category + ' (EN)',
                sub_category=sub_category + ' (EN)',
                title=title + ' (EN)',
                description=description + ' (EN)',
                price=fake.random_int(min=100, max=190),
                gallery=gallery,
            )

            self.stdout.write(self.style.SUCCESS(f'Product "{new_product}" created'))

        self.stdout.write(self.style.SUCCESS(f'"{Product.objects.count()}" Product records created'))