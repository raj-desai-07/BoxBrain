from django.db import models
import random
import string

def generate_random_chat_id():
    characters = string.ascii_letters + string.digits
    return ''.join(random.choices(characters, k=24))

class User(models.Model):
    fname = models.CharField(max_length=150)
    lname = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=50)
    date_joined = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.fname + ' ' + self.lname
    

class TempUser(models.Model):
    fname = models.CharField(max_length=150)
    lname = models.CharField(max_length=150)
    email = models.EmailField(unique=False)
    password = models.CharField(max_length=50)
    otp = models.CharField(max_length=8, blank=True, null=True)

    def __str__(self):
        return self.fname + ' ' + self.lname

class Chat(models.Model):
    id = models.CharField(max_length=24, primary_key=True, default=generate_random_chat_id, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    role = models.CharField(max_length=50)
    msg = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)