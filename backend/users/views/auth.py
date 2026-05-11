from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from ..serializers import UserSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data["user"] = {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
        }
        return data


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            data = response.data
            response.set_cookie(
                key="tm_access",
                value=data.get("access"),
                httponly=True,
                samesite="Lax",
                max_age=8 * 60 * 60,
            )
            response.set_cookie(
                key="tm_refresh",
                value=data.get("refresh"),
                httponly=True,
                samesite="Lax",
                max_age=24 * 60 * 60,
            )
        return response


class LogoutView(APIView):
    def post(self, request, *args, **kwargs):
        response = Response({"detail": "Logged out."})
        response.delete_cookie("tm_access")
        response.delete_cookie("tm_refresh")
        return response


class TokenRefreshCookieView(APIView):
    permission_classes = []

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("tm_refresh")
        if not refresh_token:
            return Response(
                {"detail": "No refresh token."}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            token = RefreshToken(refresh_token)
            new_access = str(token.access_token)
            response = Response({"access": new_access})
            response.set_cookie(
                key="tm_access",
                value=new_access,
                httponly=True,
                samesite="Lax",
                max_age=8 * 60 * 60,
            )
            return response
        except TokenError:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
