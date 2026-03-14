from django.contrib import admin
from .models import Promotion


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):

    list_display = [
        "id",
        "name",
        "base_salary",
        "description"
    ]

    search_fields = [
        "name"
    ]