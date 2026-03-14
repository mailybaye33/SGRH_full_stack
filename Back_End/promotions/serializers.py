from rest_framework import serializers
from .models import Promotion


class PromotionSerializer(serializers.ModelSerializer):

    class Meta:

        model = Promotion

        fields = [
            "id",
            "name",
            "base_salary",
            "description"
        ]