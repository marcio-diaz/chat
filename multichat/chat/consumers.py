import json
from django.contrib.auth.models import User
from channels import Channel, Group
from channels.auth import channel_session_user_from_http, channel_session_user

from .settings import MSG_TYPE_LEAVE, MSG_TYPE_ENTER, NOTIFY_USERS_ON_ENTER_OR_LEAVE_ROOMS, MSG_TYPE_MESSAGE
from .models import Message
from .utils import catch_client_error
from .exceptions import ClientError
import logging

@channel_session_user_from_http
def ws_connect(message):
  message.reply_channel.send({'accept': True})

@channel_session_user
def ws_receive(message):
  payload = json.loads(message['text'])
  payload['reply_channel'] = message.content['reply_channel']
  Channel("chat.receive").send(payload)


@channel_session_user
def ws_disconnect(message):
  group = Group("room-%s" % message.user.id)
  group.discard(message.reply_channel)

@channel_session_user
@catch_client_error
def chat_join(message):
  group = Group("room-%s" % message.user.id)
  group.add(message.reply_channel)
  logging.debug("[Server] User %s joined chat." % message.user.id)

@channel_session_user
@catch_client_error
def chat_leave(message):
    pass

@channel_session_user
@catch_client_error
def chat_send(message):

  logging.debug("[Server] Received message:%s from:%s to:%s"
                % (message["message"], message.user.username, message["to"]))

  group = Group("room-%s" % message["to"])
  final_msg = {'from': message.user.id,
               'username': message.user.username,
               'to': int(message["to"]),
               'message': message["message"],
               'msg_type': MSG_TYPE_MESSAGE}    
  group.send(
      {"text": json.dumps(final_msg)}
  )
  to_user = User.objects.get(id=int(message['to']))
  message.user.messages_sent.create(to_user=to_user,
                                    message=message['message'])
