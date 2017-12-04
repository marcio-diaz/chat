from itertools import chain
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import Message


@login_required
def index(request):
    users = User.objects.exclude(id=request.user.id)
    user_name = request.user.username
    messages_sent = request.user.messages_sent.all()
    messages_received = request.user.messages_received.all()    
    
    messages = sorted(chain(messages_sent, messages_received), key=lambda inst: inst.timestamp)

    return render(request, "index.html", {
        "users": users,
        "messages": messages
    })
