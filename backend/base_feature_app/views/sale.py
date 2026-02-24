from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from base_feature_app.serializers import SaleSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def create_sale(request):
    """
    Create a new sale with the provided data.
    
    Args:
        request (HttpRequest): The request object containing the data for the sale.

    Returns:
        Response: A response object containing the serialized sale data or errors.
    """
    if request.method == 'POST':
        serializer = SaleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)