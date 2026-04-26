# Generated initial migration

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Nomi')),
                ('quantity', models.PositiveIntegerField(default=0, verbose_name='Dona soni')),
                ('purchase_price', models.DecimalField(decimal_places=2, default=0, max_digits=15, verbose_name='Kirib kelgan narxi')),
                ('sold_quantity', models.PositiveIntegerField(default=0, verbose_name='Sotilgan dona')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Mahsulot',
                'verbose_name_plural': 'Mahsulotlar',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ProductSize',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('length', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Uzunlik (m)')),
                ('width', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Eni (sm)')),
                ('height', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Qalinlik (sm)')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sizes', to='inventory.product')),
            ],
            options={
                'verbose_name': "Mahsulot o'lchami",
                'verbose_name_plural': "Mahsulot o'lchamlari",
            },
        ),
    ]
