# Fake Data Management Commands

This directory contains Django commands to create and delete test data (fake data) in the database.

## 📋 Available Commands

### 1. Create Fake Data by Individual Model

#### Create Blogs
```bash
python manage.py create_blogs [number_of_blogs]
```
**Example:**
```bash
python manage.py create_blogs 20
```

#### Create Products
```bash
python manage.py create_products [number_of_products]
```
**Example:**
```bash
python manage.py create_products 30
```

#### Create Users
```bash
python manage.py create_users [number_of_users]
```
**Example:**
```bash
python manage.py create_users 15
```
**Note:** Users are created with the default password: `password123`

#### Create Sales
```bash
python manage.py create_sales [number_of_sales]
```
**Example:**
```bash
python manage.py create_sales 25
```
**Requirement:** Products must exist in the database before creating sales.

---

### 2. Create All Fake Data at Once

```bash
python manage.py create_fake_data [number_of_records]
```

**Example with single number for all models:**
```bash
python manage.py create_fake_data 20
```
This will create 20 users, 20 blogs, 20 products, and 20 sales.

**Example with specific numbers per model:**
```bash
python manage.py create_fake_data --blogs 15 --products 25 --users 10 --sales 30
```

---

### 3. Delete All Fake Data

```bash
python manage.py delete_fake_data --confirm
```

**⚠️ IMPORTANT:** 
- This command requires the `--confirm` flag to prevent accidental deletions.
- **WILL NOT delete** administrator users or superusers (automatic protection).
- Deletes in the following order: Sales → Products → Blogs → Users (except admins).

---

## 🔒 Administrator User Protection

The `delete_fake_data` command is designed to **automatically protect** administrator users:

- ✅ **Keeps** users with `is_superuser=True`
- ✅ **Keeps** users with `is_staff=True`
- ❌ **Deletes** regular users (customers)

This ensures that system administration accounts are never accidentally deleted.

---

## 📊 Generated Data Structure

### Blog
- Random title
- Description (up to 1500 characters)
- Category: Technology, Health, Travel, Education, Food, Fashion
- Test image or placeholder

### Product
- Random title
- Description (up to 300 characters)
- Category: Aesthetic Candles, Decor, Gift & Party Favors
- Subcategory according to category
- Price: between $100 and $190
- Image gallery

### User
- Unique email
- First and last name
- Phone number
- Role: Customer or Admin
- Default password: `password123`

### Sale
- Customer email
- Complete address (street, city, state, postal code)
- Between 1 and 5 products per sale
- Quantity of each product: between 1 and 5 units

---

## 🎯 Recommended Workflow

1. **Create all test data:**
   ```bash
   python manage.py create_fake_data 50
   ```

2. **Work with the application** using the test data.

3. **Clean the database when finished:**
   ```bash
   python manage.py delete_fake_data --confirm
   ```

4. **Recreate data if needed.**

---

## 💡 Tips

- Individual commands are useful when you need more data for a specific model.
- Always create products before creating sales (sales require existing products).
- Fake users have the password `password123` for easy testing.
- Check the Django admin panel to see all data organized by sections.
