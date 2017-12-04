$(function () {

      function my_date_format(date) {
            var d = date.getUTCDate();
            var m = date.getUTCMonth() + 1; //Month from 0 to 11
            var y = date.getUTCFullYear();
            var h = date.getUTCHours();
            var ms = date.getUTCMinutes();
 
            return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d) 
                  + ' ' + (h<=9 ? '0' + h : h) + ':'+ (ms<=9 ? '0' + ms : ms) + ' ';
      }


      function message_to_html_str(date_str, username, msg) {
            return "<div class='message'>" +
                        "<span class=''>" + date_str + "</span>" + 
                        "<span class='username'>" + username + "</span>" +
                        "<span class='body'>" + msg + "</span>" +
                        "</div>";            
      }

      // Correctly decide between ws:// and wss://
      var ws_path = "/chat/stream/";
      console.log("Connecting to " + ws_path);

      var webSocketBridge = new channels.WebSocketBridge();
      webSocketBridge.connect(ws_path);

      // Handle incoming messages
      webSocketBridge.listen(function(data) {

            // Decode the JSON
            console.log("Got websocket message", data);

            // Handle errors
            if (data.error) {
                  alert(data.error);
                  return;
            }

            if (data.message || data.msg_type != 0) {
                  console.log("Message from " + data.username);
                  var msgdiv = $("#" + data.from + " .messages");
                  var ok_msg = "";

                  // msg types are defined in chat/settings.py
                  // Only for demo purposes is hardcoded, in production scenarios, consider call a service.
                  switch (data.msg_type) {
                        case 0:
                              // Message
                              var now = new Date();
                              var formated_date = my_date_format(now);
                              ok_msg = message_to_html_str(formated_date, 
                                                data.username, data.message);
                              break;
                        default:
                              console.log("Unsupported message type!");
                              return;
                  }
                  msgdiv.append(ok_msg);
                  msgdiv.scrollTop(msgdiv.prop("scrollHeight"));
            } else {
                  console.log("Cannot handle message!");
            }
      });

      webSocketBridge.socket.onopen = function () {
            console.log("Connected to chat socket");

            webSocketBridge.send({
                  "command": "join"
            });

            $('.user').find("form").on("submit", function () {

                  var msg = $(this).find("input").val();
                  $(this).find("input").val("");

                  var to_id = $(this).attr("data-to-user-id");
                  var to_username = $(this).attr("data-to-user-name");
                  var from_id = $(this).attr("data-from-user-id");
                  var from_username = $(this).attr("data-from-user-name");

                  webSocketBridge.send({
                        "command": "send",
                        "to": to_id,
                        "message": msg
                  });


                  console.log("[Client] Sending message:" + msg +
                        " to:" + to_username + " from:" + from_username);

                  var now = new Date();
                  var date_str = my_date_format(now);      
                  var msg_div = message_to_html_str(date_str, from_username, msg);
                  var div_for_msg = $("#" + to_id + " .messages");
                  div_for_msg.append(msg_div);
                  div_for_msg.scrollTop(div_for_msg.prop("scrollHeight"));

                  return false;
            });

      };

      webSocketBridge.socket.onclose = function () {
            console.log("Disconnected from chat socket");
      };

});
