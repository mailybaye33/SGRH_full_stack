from rest_framework import serializers
from .models import Leave


class LeaveSerializer(serializers.ModelSerializer):

    class Meta:
        model = Leave
        fields = "__all__"
        read_only_fields = ["days"]

    def create(self, validated_data):

        start_date = validated_data["start_date"]
        end_date = validated_data["end_date"]

        days = (end_date - start_date).days + 1

        validated_data["days"] = days

        return super().create(validated_data)