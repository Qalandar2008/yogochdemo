from django.contrib import admin
from .models import Product, ProductSize, InventoryTransaction, DebtRecord


class ProductSizeInline(admin.TabularInline):
    model = ProductSize
    extra = 1
    fields = ['length', 'width', 'height']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'quantity', 'purchase_price', 'sold_quantity', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name']
    inlines = [ProductSizeInline]
    
    fieldsets = (
        (None, {
            'fields': ('name',)
        }),
        ('Miqdori va Narx', {
            'fields': ('quantity', 'purchase_price', 'sold_quantity')
        }),
    )


@admin.register(ProductSize)
class ProductSizeAdmin(admin.ModelAdmin):
    list_display = ['product', 'length', 'width', 'height']
    list_filter = ['product']
    search_fields = ['product__name']


@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    list_display = ['product', 'transaction_type', 'quantity', 'unit_price', 'unit_cost', 'occurred_at']
    list_filter = ['transaction_type', 'occurred_at']
    search_fields = ['product__name']


@admin.register(DebtRecord)
class DebtRecordAdmin(admin.ModelAdmin):
    list_display = ['customer_fio', 'product', 'quantity', 'unit_price', 'total_amount', 'volume_m3', 'occurred_at']
    list_filter = ['occurred_at']
    search_fields = ['customer_fio', 'phone', 'product__name']
