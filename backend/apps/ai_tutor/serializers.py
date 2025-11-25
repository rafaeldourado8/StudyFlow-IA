from rest_framework import serializers
class AskTutorSerializer(serializers.Serializer):
    question = serializers.CharField()
    subject = serializers.CharField(default="Geral", required=False)