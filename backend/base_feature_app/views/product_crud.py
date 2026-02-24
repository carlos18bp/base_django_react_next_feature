from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from base_feature_app.models import Product
from base_feature_app.serializers.product_create_update import ProductCreateUpdateSerializer
from base_feature_app.serializers.product_detail import ProductDetailSerializer
from base_feature_app.serializers.product_list import ProductListSerializer


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def products(request):
    if request.method == 'GET':
        queryset = Product.objects.all().order_by('-id')
        serializer = ProductListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = ProductCreateUpdateSerializer(data=request.data)
    if serializer.is_valid():
        product = serializer.save()
        detail = ProductDetailSerializer(product, context={'request': request})
        return Response(detail.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])
def product_detail(request, product_id: int):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProductDetailSerializer(product, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method in {'PUT', 'PATCH'}:
        serializer = ProductCreateUpdateSerializer(product, data=request.data, partial=(request.method == 'PATCH'))
        if serializer.is_valid():
            product = serializer.save()
            detail = ProductDetailSerializer(product, context={'request': request})
            return Response(detail.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    product.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
