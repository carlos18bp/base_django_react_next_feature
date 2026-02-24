from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from base_feature_app.models import Product
from base_feature_app.serializers.product import ProductSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def product_list(request):
    """
    API view to retrieve a list of products.
    
    :param request: The HTTP request object.
    :return: JSON response with the serialized list of products and HTTP status 200.
    """
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)