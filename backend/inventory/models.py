from django.db import models
from django.utils import timezone


class Product(models.Model):
    name = models.CharField(max_length=255, verbose_name='Nomi')
    quantity = models.PositiveIntegerField(default=0, verbose_name='Dona soni')
    purchase_price = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name='Kirib kelgan narxi')
    sold_quantity = models.PositiveIntegerField(default=0, verbose_name='Sotilgan dona')
    occurred_at = models.DateTimeField(default=timezone.now, verbose_name='Kelib tushgan vaqt')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Mahsulot'
        verbose_name_plural = 'Mahsulotlar'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def total_volume(self):
        """Umumiy hajm (m³)"""
        return sum(size.total_volume for size in self.sizes.all())

    @property
    def sold_volume(self):
        """Sotilgan hajm (m³)"""
        single_volume = sum(size.single_volume for size in self.sizes.all())
        return single_volume * self.sold_quantity

    @property
    def profit(self):
        """Sof foyda - OUT transactionlardan hisoblanadi"""
        sold_transactions = self.transactions.filter(transaction_type=InventoryTransaction.TransactionType.OUT)
        return sum(float(t.unit_price - t.unit_cost) * t.quantity for t in sold_transactions)

    @property
    def total_purchase_value(self):
        """Ombordagi tovarlarning umumiy qiymati"""
        return float(self.quantity) * float(self.purchase_price)

    @property
    def avg_price(self):
        """O'rtacha narx"""
        return float(self.purchase_price) * 1.3  # 30% qo'shimcha


class ProductSize(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sizes')
    length = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Uzunlik (m)')
    width = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Eni (sm)')
    height = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Qalinlik (sm)')

    class Meta:
        verbose_name = 'Mahsulot o\'lchami'
        verbose_name_plural = 'Mahsulot o\'lchamlari'

    def __str__(self):
        return f"{self.product.name} - {self.length}×{self.width}×{self.height}"

    @property
    def single_volume(self):
        """Bitta dona hajmi (m³) - width va height cm dan m ga o'tkaziladi"""
        width_in_meters = float(self.width) / 100
        height_in_meters = float(self.height) / 100
        return float(self.length) * width_in_meters * height_in_meters

    @property
    def total_volume(self):
        """Umumiy hajm (m³) - bitta hajm * quantity"""
        return self.single_volume * self.product.quantity


class InventoryTransaction(models.Model):
    class TransactionType(models.TextChoices):
        IN = 'IN', 'Kirim'
        OUT = 'OUT', 'Chiqim'

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=3, choices=TransactionType.choices)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    unit_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    occurred_at = models.DateTimeField(default=timezone.now, verbose_name='Amalga oshgan vaqt')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Ombor harakati'
        verbose_name_plural = 'Ombor harakatlari'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.name} {self.transaction_type} x{self.quantity}"


class DebtRecord(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='debts')
    customer_fio = models.CharField(max_length=255, verbose_name='Qarz olgan FIO')
    phone = models.CharField(max_length=13, verbose_name='Telefon raqam (+998...)')
    quantity = models.PositiveIntegerField(verbose_name='Dona')
    unit_price = models.DecimalField(max_digits=15, decimal_places=2, verbose_name='Bir dona narxi')
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, verbose_name='Jami qarz summasi')
    volume_m3 = models.DecimalField(max_digits=15, decimal_places=3, verbose_name='Hajm (m³)')
    occurred_at = models.DateTimeField(verbose_name='Qarz olingan vaqt')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Qarz yozuvi'
        verbose_name_plural = 'Qarz yozuvlari'
        ordering = ['-occurred_at']

    def __str__(self):
        return f"{self.customer_fio} - {self.product.name} ({self.quantity})"
