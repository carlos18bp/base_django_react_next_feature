from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from base_feature_app.models import Blog
from base_feature_app.serializers.blog_create_update import BlogCreateUpdateSerializer
from base_feature_app.serializers.blog_detail import BlogDetailSerializer
from base_feature_app.serializers.blog_list import BlogListSerializer


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def blogs(request):
    if request.method == 'GET':
        queryset = Blog.objects.all().order_by('-id')
        serializer = BlogListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = BlogCreateUpdateSerializer(data=request.data)
    if serializer.is_valid():
        blog = serializer.save()
        detail = BlogDetailSerializer(blog, context={'request': request})
        return Response(detail.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])
def blog_detail(request, blog_id: int):
    try:
        blog = Blog.objects.get(id=blog_id)
    except Blog.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = BlogDetailSerializer(blog, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method in {'PUT', 'PATCH'}:
        serializer = BlogCreateUpdateSerializer(blog, data=request.data, partial=(request.method == 'PATCH'))
        if serializer.is_valid():
            blog = serializer.save()
            detail = BlogDetailSerializer(blog, context={'request': request})
            return Response(detail.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    blog.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
