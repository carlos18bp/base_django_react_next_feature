import random
from faker import Faker
from django.core.management.base import BaseCommand
from base_feature_app.models import Sale, SoldProduct, Product

class Command(BaseCommand):
    help = 'Create Sale records in the database'

    def add_arguments(self, parser):
        parser.add_argument('number_of_sales', type=int, nargs='?', default=10)

    def handle(self, *args, **options):
        number_of_sales = options['number_of_sales']
        fake = Faker()

        # Check if there are products in the database
        products = list(Product.objects.all())
        if not products:
            self.stdout.write(self.style.WARNING('No products found in database. Please create products first.'))
            return

        for _ in range(number_of_sales):
            # Create sale
            new_sale = Sale.objects.create(
                email=fake.email(),
                address=fake.street_address(),
                city=fake.city(),
                state=fake.state(),
                postal_code=fake.postcode(),
            )

            # Add random products to the sale (between 1 and 5 products)
            num_products = random.randint(1, min(5, len(products)))
            selected_products = random.sample(products, num_products)

            for product in selected_products:
                quantity = random.randint(1, 5)
                sold_product = SoldProduct.objects.create(
                    product=product,
                    quantity=quantity,
                )
                new_sale.sold_products.add(sold_product)

            new_sale.save()
            self.stdout.write(self.style.SUCCESS(
                f'Sale "{new_sale.email}" created with {num_products} products'
            ))

        self.stdout.write(self.style.SUCCESS(f'{number_of_sales} Sale records created'))
