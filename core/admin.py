from django.contrib import admin
from .models import *

class UserAdmin(admin.ModelAdmin):
    list_display = ['fname', 'lname', 'email']
    search_fields = ['fname']

class ChatAdmin(admin.ModelAdmin):
    list_display = ['title', 'user']
    search_fields = ['title']

class MessageAdmin(admin.ModelAdmin):
    list_display = ['role', 'chat']
    list_filter = ['role']

# Register
admin.site.register(User, UserAdmin)
admin.site.register(Chat, ChatAdmin)
admin.site.register(Message, MessageAdmin)