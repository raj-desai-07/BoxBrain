"""
URL configuration for BoxBrain project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from core import views
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),
    path('new-chat/', views.new_chat, name='new_chat'),
    path('chat/<str:chat_id>/', views.chat, name='chat'),
    path('chat/<str:chat_id>/reply/', views.chat_reply, name='chat_reply'),
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
    path('profile/', views.profile, name='profile'),
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('reset-password/', views.reset_password, name='reset_password'),
    path('verify-email/', views.verify_email, name='verify_email'),
    path('get-started/', views.started, name='get_started'),
    path('logout/', views.logout, name='logout'),
    path('delete-chat/<str:chat_id>/', views.delete_chat, name='delete_chat'),
    path('rename-chat/<str:chat_id>/', views.rename_chat, name='rename_chat'),
    path('delete-all-chats/', views.delete_all_chats, name='delete_all_chats'),
    path('forgot-password/verify/', views.forgot_verify, name='forgot_verify'),
    path('forgot-password/resend/', views.forgot_resend, name='forgot_resend'),
    path('forgot-password/new/', views.forgot_reset, name='forgot_reset'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
