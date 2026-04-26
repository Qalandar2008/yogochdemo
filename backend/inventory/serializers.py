from rest_framework import serializers
from .models import Product, ProductSize, InventoryTransaction, DebtRecord


class ProductSizeSerializer(serializers.ModelSerializer):
    volume = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = ProductSize
        fields = ['id', 'length', 'width', 'height', 'volume']
    
    def get_volume(self, obj):
        return round(obj.single_volume, 6)
    
    def create(self, validated_data):
        # Remove volume if present (read-only field)
        validated_data.pop('volume', None)
        return super().create(validated_data)


class ProductSerializer(serializers.ModelSerializer):
    sizes = ProductSizeSerializer(many=True)
    total_volume = serializers.SerializerMethodField()
    sold_volume = serializers.SerializerMethodField()
    profit = serializers.SerializerMethodField()
    purchase_price = serializers.DecimalField(max_digits=15, decimal_places=2, coerce_to_string=False)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'quantity', 'purchase_price', 'sold_quantity',
            'sizes', 'total_volume', 'sold_volume', 'profit', 'occurred_at', 'created_at'
        ]
    
    def get_total_volume(self, obj):
        return round(obj.total_volume, 3)
    
    def get_sold_volume(self, obj):
        return round(obj.sold_volume, 3)
    
    def get_profit(self, obj):
        return round(obj.profit, 2)

    def validate(self, attrs):
        quantity = attrs.get('quantity', getattr(self.instance, 'quantity', 0))
        sold_quantity = attrs.get('sold_quantity', getattr(self.instance, 'sold_quantity', 0))

        if sold_quantity > quantity:
            raise serializers.ValidationError({
                'sold_quantity': 'Sold quantity cannot be greater than available quantity.'
            })
        return attrs
    
    def create(self, validated_data):
        # Remove computed fields if present
        validated_data.pop('total_volume', None)
        validated_data.pop('sold_volume', None)
        validated_data.pop('profit', None)
        
        sizes_data = validated_data.pop('sizes', [])
        product = Product.objects.create(**validated_data)
        
        for size_data in sizes_data:
            # Remove computed volume field from size data
            size_data.pop('volume', None)
            ProductSize.objects.create(product=product, **size_data)
        
        return product
    
    def update(self, instance, validated_data):
        # Remove computed fields if present
        validated_data.pop('total_volume', None)
        validated_data.pop('sold_volume', None)
        validated_data.pop('profit', None)
        
        sizes_data = validated_data.pop('sizes', [])
        
        # Update product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update sizes - delete old ones and create new
        if sizes_data:
            instance.sizes.all().delete()
            for size_data in sizes_data:
                # Remove computed volume field from size data
                size_data.pop('volume', None)
                ProductSize.objects.create(product=instance, **size_data)
        
        return instance


class ProductListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    sizes = ProductSizeSerializer(many=True)
    total_volume = serializers.SerializerMethodField()
    sold_volume = serializers.SerializerMethodField()
    profit = serializers.SerializerMethodField()
    purchase_price = serializers.DecimalField(max_digits=15, decimal_places=2, coerce_to_string=False)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'quantity', 'purchase_price', 'sold_quantity',
            'sizes', 'total_volume', 'sold_volume', 'profit', 'occurred_at'
        ]
    
    def get_total_volume(self, obj):
        return round(obj.total_volume, 3)
    
    def get_sold_volume(self, obj):
        return round(obj.sold_volume, 3)
    
    def get_profit(self, obj):
        return round(obj.profit, 2)


class StatsSerializer(serializers.Serializer):
    """Dashboard stats serializer"""
    total_products = serializers.IntegerField()
    total_quantity = serializers.IntegerField()
    total_sold_quantity = serializers.IntegerField()
    total_sold_volume = serializers.FloatField()
    total_volume = serializers.FloatField()
    total_inventory_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_profit = serializers.DecimalField(max_digits=15, decimal_places=2)


class InventoryTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = InventoryTransaction
        fields = [
            'id', 'product', 'product_name', 'transaction_type',
            'quantity', 'unit_price', 'unit_cost', 'occurred_at', 'created_at'
        ]


class DebtRecordSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = DebtRecord
        fields = [
            'id',
            'product',
            'product_name',
            'customer_fio',
            'phone',
            'quantity',
            'unit_price',
            'total_amount',
            'volume_m3',
            'occurred_at',
            'created_at',
        ]
        read_only_fields = ['total_amount', 'volume_m3', 'created_at']
