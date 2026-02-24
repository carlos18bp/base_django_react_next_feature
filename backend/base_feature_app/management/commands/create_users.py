from faker import Faker
from django.core.management.base import BaseCommand
from base_feature_app.models import User

class Command(BaseCommand):
    help = 'Create User records in the database'

    def add_arguments(self, parser):
        parser.add_argument('number_of_users', type=int, nargs='?', default=10)

    def handle(self, *args, **options):
        number_of_users = options['number_of_users']
        fake = Faker()

        roles = [User.Role.CUSTOMER, User.Role.ADMIN]

        for i in range(number_of_users):
            # Generate unique email
            email = fake.unique.email()
            first_name = fake.first_name()
            last_name = fake.last_name()
            phone = fake.phone_number()
            role = fake.random_element(elements=roles)
            
            # Create user with random password
            user = User.objects.create_user(
                email=email,
                password='password123',  # Default password for fake users
                first_name=first_name,
                last_name=last_name,
                phone=phone,
                role=role,
                is_active=True,
                is_staff=(role == User.Role.ADMIN),
            )

            self.stdout.write(self.style.SUCCESS(f'User "{user.email}" created with role {role}'))

        self.stdout.write(self.style.SUCCESS(f'{number_of_users} User records created'))
