import json
from django.db import models
from django.utils import timezone
from django.utils.six import python_2_unicode_compatible
from django.contrib.auth.models import User
from channels import Group
from .settings import MSG_TYPE_MESSAGE

class Message(models.Model):
    from_user = models.ForeignKey(User, related_name='messages_sent')
    to_user = models.ForeignKey(User, related_name='messages_received')    
    message = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
                
    def __str__(self):
        return "{}->{}: {}".format(self.from_user.username,
                                   self.to_user.username,
                                   self.message)
