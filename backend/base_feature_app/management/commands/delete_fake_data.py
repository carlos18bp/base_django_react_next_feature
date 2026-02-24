from django.core.management.base import BaseCommand, CommandError
from base_feature_app.models import Product, Blog, Sale, User

class Command(BaseCommand):
    help = 'Delete fake records from the database'

    """
    To delete fake data via console, run:
    python3 manage.py delete_fake_data --confirm
    
    Note: This command will NOT delete superusers or admin users to protect system administrators.
    """

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm deletion of all fake data.',
        )

    def handle(self, *args, **options):
        if not options.get('confirm'):
            raise CommandError('Deletion not confirmed. Re-run with --confirm.')
        
        self.stdout.write(self.style.SUCCESS('==== Deleting Fake Data ===='))
        
        # Delete Sales (includes SoldProducts via cascade)
        self.stdout.write(self.style.SUCCESS('\n--- Deleting Sales ---'))
        sale_count = Sale.objects.count()
        for sale in Sale.objects.all():
            sale.delete()
        self.stdout.write(self.style.SUCCESS(f'{sale_count} Sales deleted'))
        
        # Delete Products
        self.stdout.write(self.style.SUCCESS('\n--- Deleting Products ---'))
        product_count = Product.objects.count()
        for product in Product.objects.all():
            product.delete()
        self.stdout.write(self.style.SUCCESS(f'{product_count} Products deleted'))
        
        # Delete Blogs
        self.stdout.write(self.style.SUCCESS('\n--- Deleting Blogs ---'))
        blog_count = Blog.objects.count()
        for blog in Blog.objects.all():
            blog.delete()
        self.stdout.write(self.style.SUCCESS(f'{blog_count} Blogs deleted'))
        
        # Delete Users (excluding superusers and staff)
        self.stdout.write(self.style.SUCCESS('\n--- Deleting Users ---'))
        # Filter to exclude superusers and staff to protect admin accounts
        users_to_delete = User.objects.filter(is_superuser=False, is_staff=False)
        user_count = users_to_delete.count()
        protected_count = User.objects.filter(is_superuser=True).count() + User.objects.filter(is_staff=True, is_superuser=False).count()
        
        for user in users_to_delete:
            user.delete()
        
        self.stdout.write(self.style.SUCCESS(f'{user_count} Users deleted'))
        self.stdout.write(self.style.WARNING(f'{protected_count} Admin/Superuser accounts protected and not deleted'))
        
        self.stdout.write(self.style.SUCCESS('\n==== Fake Data Deletion Complete ===='))