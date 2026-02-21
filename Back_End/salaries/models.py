# salaries/models.py
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from employees.models import Employee
from users.models import User

class SalaryGrade(models.Model):
    """Grille salariale"""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    
    min_salary = models.DecimalField(max_digits=12, decimal_places=2)
    max_salary = models.DecimalField(max_digits=12, decimal_places=2)
    mid_salary = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    
    currency = models.CharField(max_length=3, default='XOF')
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    def save(self, *args, **kwargs):
        if not self.mid_salary:
            self.mid_salary = (self.min_salary + self.max_salary) / 2
        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = "Grille salariale"
        verbose_name_plural = "Grilles salariales"
        ordering = ['code']


class EmployeeSalary(models.Model):
    """Salaire d'un employé"""
    PAYMENT_METHODS = [
        ('bank_transfer', 'Virement bancaire'),
        ('check', 'Chèque'),
        ('cash', 'Espèces'),
        ('mobile_money', 'Mobile Money'),
    ]
    
    PAYMENT_FREQUENCY = [
        ('monthly', 'Mensuel'),
        ('bi_weekly', 'Bi-mensuel'),
        ('weekly', 'Hebdomadaire'),
        ('daily', 'Journalier'),
        ('hourly', 'Horaire'),
    ]
    
    employee = models.OneToOneField(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='current_salary'
    )
    
    base_salary = models.DecimalField(max_digits=12, decimal_places=2)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    grade = models.ForeignKey(
        SalaryGrade, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='employees'
    )
    
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='bank_transfer')
    payment_frequency = models.CharField(max_length=20, choices=PAYMENT_FREQUENCY, default='monthly')
    bank_name = models.CharField(max_length=100, blank=True)
    bank_account = models.CharField(max_length=50, blank=True)
    bank_code = models.CharField(max_length=20, blank=True)
    
    # Avantages
    housing_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    transport_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    food_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    phone_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Taxes et retenues
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    social_security_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    pension_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    effective_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='created_salaries'
    )
    
    class Meta:
        verbose_name = "Salaire employé"
        verbose_name_plural = "Salaires employés"
        ordering = ['-effective_date']
    
    def __str__(self):
        return f"{self.employee} - {self.base_salary} ({self.effective_date})"
    
    @property
    def total_allowances(self):
        return (self.housing_allowance + self.transport_allowance + 
                self.food_allowance + self.phone_allowance + self.other_allowances)
    
    @property
    def gross_salary(self):
        return self.base_salary + self.total_allowances
    
    @property
    def tax_amount(self):
        return self.gross_salary * (self.tax_rate / 100)
    
    @property
    def social_security_amount(self):
        return self.gross_salary * (self.social_security_rate / 100)
    
    @property
    def pension_amount(self):
        return self.gross_salary * (self.pension_rate / 100)
    
    @property
    def total_deductions(self):
        return self.tax_amount + self.social_security_amount + self.pension_amount
    
    @property
    def net_salary(self):
        return self.gross_salary - self.total_deductions


class SalaryHistory(models.Model):
    """Historique des salaires"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='salary_history')
    previous_salary = models.DecimalField(max_digits=12, decimal_places=2)
    new_salary = models.DecimalField(max_digits=12, decimal_places=2)
    change_amount = models.DecimalField(max_digits=12, decimal_places=2)
    change_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    
    reason = models.CharField(max_length=200)
    change_date = models.DateField()
    
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Historique salarial"
        verbose_name_plural = "Historiques salariaux"
        ordering = ['-change_date']
    
    def __str__(self):
        return f"{self.employee} - {self.previous_salary} → {self.new_salary} ({self.change_date})"


class Payroll(models.Model):
    """Fiche de paie"""
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('calculated', 'Calculé'),
        ('validated', 'Validé'),
        ('paid', 'Payé'),
        ('cancelled', 'Annulé'),
    ]
    
    # 🔴 LIGNE CORRIGÉE - related_name unique
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='salary_payrolls'  # Changé de 'payrolls' à 'salary_payrolls'
    )
    
    # Période
    month = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    year = models.IntegerField()
    
    # Salaires
    base_salary = models.DecimalField(max_digits=12, decimal_places=2)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    hours_worked = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    overtime_rate = models.DecimalField(max_digits=5, decimal_places=2, default=1.5)
    
    # Primes et avantages
    housing_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    transport_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    food_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    phone_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    commission = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    thirteenth_month = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Retenues
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    social_security = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pension = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    loan_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    advance_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    absence_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Totaux
    gross_salary = models.DecimalField(max_digits=12, decimal_places=2)
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Paiement
    payment_date = models.DateField(null=True, blank=True)
    payment_method = models.CharField(max_length=20, choices=EmployeeSalary.PAYMENT_METHODS, default='bank_transfer')
    payment_reference = models.CharField(max_length=100, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    bank_account = models.CharField(max_length=50, blank=True)
    
    # Statut
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Validation
    validated_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='validated_payrolls'
    )
    validated_at = models.DateTimeField(null=True, blank=True)
    
    # Document
    pdf_file = models.FileField(upload_to='payrolls/', null=True, blank=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='created_payrolls'
    )
    
    class Meta:
        verbose_name = "Fiche de paie"
        verbose_name_plural = "Fiches de paie"
        unique_together = ['employee', 'month', 'year']
        ordering = ['-year', '-month']
        indexes = [
            models.Index(fields=['employee', 'year', 'month']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.employee} - {self.month}/{self.year} - {self.net_salary}"
    
    def calculate_overtime_pay(self):
        return self.overtime_hours * self.hourly_rate * self.overtime_rate
    
    def calculate_gross_salary(self):
        overtime_pay = self.calculate_overtime_pay()
        allowances = (self.housing_allowance + self.transport_allowance + 
                     self.food_allowance + self.phone_allowance + 
                     self.bonus + self.commission + self.thirteenth_month + 
                     self.other_allowances)
        
        base = self.base_salary + (self.hours_worked * self.hourly_rate)
        return base + overtime_pay + allowances
    
    def calculate_total_deductions(self):
        return (self.tax_amount + self.social_security + self.pension +
                self.loan_deduction + self.advance_deduction +
                self.absence_deduction + self.other_deductions)
    
    def calculate_net_salary(self):
        self.gross_salary = self.calculate_gross_salary()
        self.total_deductions = self.calculate_total_deductions()
        self.net_salary = self.gross_salary - self.total_deductions
        return self.net_salary
    
    def save(self, *args, **kwargs):
        self.calculate_net_salary()
        super().save(*args, **kwargs)
    
    def validate(self, user):
        self.status = 'validated'
        self.validated_by = user
        self.validated_at = timezone.now()
        self.save()
    
    def mark_as_paid(self, payment_date=None):
        self.status = 'paid'
        self.payment_date = payment_date or timezone.now().date()
        self.save()


class PayrollBatch(models.Model):
    """Lot de fiches de paie"""
    name = models.CharField(max_length=100)
    month = models.IntegerField()
    year = models.IntegerField()
    
    payrolls = models.ManyToManyField(Payroll, related_name='batches')
    
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    count = models.IntegerField(default=0)
    
    status = models.CharField(max_length=20, choices=Payroll.STATUS_CHOICES, default='draft')
    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Lot de paies"
        verbose_name_plural = "Lots de paies"
        unique_together = ['month', 'year']
    
    def __str__(self):
        return f"{self.name} - {self.month}/{self.year}"
    
    def calculate_totals(self):
        self.count = self.payrolls.count()
        self.total_amount = self.payrolls.aggregate(total=models.Sum('net_salary'))['total'] or 0
        self.save()


class SalaryAdvance(models.Model):
    """Avance sur salaire"""
    STATUS_CHOICES = [
        ('requested', 'Demandé'),
        ('approved', 'Approuvé'),
        ('paid', 'Payé'),
        ('rejected', 'Refusé'),
        ('repaid', 'Remboursé'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='salary_advances')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    request_date = models.DateField(default=timezone.now)
    expected_payment_date = models.DateField()
    payment_date = models.DateField(null=True, blank=True)
    
    reason = models.TextField()
    
    # Remboursement
    repayment_months = models.IntegerField(default=1, help_text="Nombre de mois pour rembourser")
    monthly_repayment = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    
    approved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_advances'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Avance sur salaire"
        verbose_name_plural = "Avances sur salaires"
        ordering = ['-request_date']
    
    def __str__(self):
        return f"{self.employee} - {self.amount} ({self.request_date})"
    
    def save(self, *args, **kwargs):
        if self.repayment_months > 0:
            self.monthly_repayment = self.amount / self.repayment_months
        super().save(*args, **kwargs)
    
    def approve(self, user):
        self.status = 'approved'
        self.approved_by = user
        self.approved_at = timezone.now()
        self.save()
    
    def reject(self, user, reason):
        self.status = 'rejected'
        self.approved_by = user
        self.approved_at = timezone.now()
        self.notes = reason
        self.save()
    
    def mark_as_paid(self):
        self.status = 'paid'
        self.payment_date = timezone.now().date()
        self.save()