from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Product


class InventoryApiTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            username='api_tester',
            password='strong-pass-123'
        )
        self.client.force_authenticate(user=self.user)

    def _product_payload(self, **overrides):
        payload = {
            'name': 'Pine Wood',
            'quantity': 20,
            'purchase_price': 150000,
            'sold_quantity': 5,
            'sizes': [
                {'length': 2.5, 'width': 40, 'height': 20},
            ],
        }
        payload.update(overrides)
        return payload

    def test_product_crud_flow(self):
        create_response = self.client.post(
            reverse('product-list'),
            self._product_payload(),
            format='json'
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        product_id = create_response.data['id']

        list_response = self.client.get(reverse('product-list'))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

        update_payload = self._product_payload(
            name='Updated Pine',
            quantity=25,
            sold_quantity=10,
            sizes=[{'length': 3.0, 'width': 35, 'height': 15}],
        )
        update_response = self.client.put(
            reverse('product-detail', kwargs={'pk': product_id}),
            update_payload,
            format='json'
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['name'], 'Updated Pine')

        delete_response = self.client.delete(
            reverse('product-detail', kwargs={'pk': product_id})
        )
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Product.objects.count(), 0)

    def test_product_validation_rejects_invalid_sold_quantity(self):
        payload = self._product_payload(quantity=2, sold_quantity=5)
        response = self.client.post(reverse('product-list'), payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('sold_quantity', response.data)

    def test_stats_endpoint_returns_required_fields(self):
        self.client.post(reverse('product-list'), self._product_payload(), format='json')
        product_id = Product.objects.first().id
        self.client.post(
            reverse('product-sell', kwargs={'pk': product_id}),
            {'quantity': 3, 'sale_price': 210000},
            format='json'
        )
        response = self.client.get(reverse('stats'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        required_fields = {
            'total_products',
            'total_quantity',
            'total_sold_quantity',
            'total_volume',
            'total_inventory_value',
            'total_revenue',
            'total_profit',
        }
        self.assertTrue(required_fields.issubset(response.data.keys()))
        self.assertEqual(response.data['total_products'], 1)
        self.assertEqual(float(response.data['total_revenue']), 630000.0)
        self.assertEqual(float(response.data['total_profit']), 180000.0)

    def test_restock_and_sell_endpoints_update_stock(self):
        create_response = self.client.post(
            reverse('product-list'),
            self._product_payload(quantity=10, purchase_price=100000, sold_quantity=0),
            format='json'
        )
        product_id = create_response.data['id']

        restock_response = self.client.post(
            reverse('product-restock', kwargs={'pk': product_id}),
            {'quantity': 5, 'purchase_price': 130000},
            format='json'
        )
        self.assertEqual(restock_response.status_code, status.HTTP_200_OK)
        self.assertEqual(restock_response.data['quantity'], 15)

        sell_response = self.client.post(
            reverse('product-sell', kwargs={'pk': product_id}),
            {'quantity': 4, 'sale_price': 180000},
            format='json'
        )
        self.assertEqual(sell_response.status_code, status.HTTP_200_OK)
        self.assertEqual(sell_response.data['quantity'], 11)
        self.assertEqual(sell_response.data['sold_quantity'], 4)

    def test_transactions_endpoint_returns_items(self):
        create_response = self.client.post(
            reverse('product-list'),
            self._product_payload(quantity=10, purchase_price=100000, sold_quantity=0),
            format='json'
        )
        product_id = create_response.data['id']
        self.client.post(
            reverse('product-restock', kwargs={'pk': product_id}),
            {'quantity': 5, 'purchase_price': 130000},
            format='json'
        )

        response = self.client.get(reverse('transactions'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_only_superuser_can_create_superuser(self):
        forbidden_response = self.client.post(
            reverse('create_superuser'),
            {'username': 'new_admin', 'password': 'admin123456'},
            format='json'
        )
        self.assertEqual(forbidden_response.status_code, status.HTTP_403_FORBIDDEN)

        super_user = get_user_model().objects.create_superuser(
            username='root_admin',
            email='',
            password='superstrong123'
        )
        self.client.force_authenticate(user=super_user)
        allowed_response = self.client.post(
            reverse('create_superuser'),
            {'username': 'second_admin', 'password': 'admin123456'},
            format='json'
        )
        self.assertEqual(allowed_response.status_code, status.HTTP_201_CREATED)

    def test_debts_create_and_export_excel(self):
        create_response = self.client.post(
            reverse('product-list'),
            self._product_payload(quantity=12, purchase_price=100000, sold_quantity=0),
            format='json'
        )
        product_id = create_response.data['id']
        debt_response = self.client.post(
            reverse('debts'),
            {
                'product': product_id,
                'customer_fio': 'Ali Valiyev',
                'phone': '+998901112233',
                'quantity': 2,
                'unit_price': 160000,
                'occurred_at': '2026-04-26T10:30:00'
            },
            format='json'
        )
        self.assertEqual(debt_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(float(debt_response.data['total_amount']), 320000.0)

        list_response = self.client.get(reverse('debts'))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

        export_response = self.client.get(reverse('debts_export_excel'))
        self.assertEqual(export_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            export_response['Content-Type'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

    def test_excel_export_returns_xlsx_file(self):
        self.client.post(reverse('product-list'), self._product_payload(), format='json')
        response = self.client.get(reverse('export_excel'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response['Content-Type'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        self.assertIn('attachment; filename="inventory_report.xlsx"', response['Content-Disposition'])
