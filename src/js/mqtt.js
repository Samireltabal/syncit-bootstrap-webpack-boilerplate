var mqtt = require('mqtt')
import $ from 'jquery';
import moment from 'moment';
import { beep, raise } from './notifications';
var _ = require('underscore');
export function mqttInit (token, classId, User) {
  var client  = mqtt.connect('wss://connect.futurelines.net:8084/mqtt', {
    clientId: User.email,
    keepalive: 60,
    clean: true,
    username: User.email,
    password: token
});
client.on('connect', function () {
    client.subscribe('/class/' + classId);
    client.subscribe('/class/' + classId + "/chat");
    client.subscribe('/class/' + classId + "/orders");
    $('#connectStatus').removeClass('offline');
  })
  
  client.on('message', messageHandler);
  client.on('offline', function () {
    $('#connectStatus').addClass('offline');
  })
  function sendMessage() {
    client.publish('/class/' + classId + "/chat", 'this is message');
  }
  $("#jqueryTest").on('click', function () {
      sendMessage();
  })

  return client;
}

function messageHandler(topic, message) {
  if(topic.includes('class') && message.toString().includes('order')) {
    let data = message.toString();
    let obj = JSON.parse(data)
    if(obj.hasOwnProperty('order')) {
      if(obj.order === "RAISE_HAND") {
        handRaised(obj);
      }
      if(obj.order === "LOWER_HAND") {
        handLowered(obj);
      }
      if(obj.order === "ALLOW_STREAM") {
        var students = JSON.parse(localStorage.getItem('students'));
        var CurrentUser = JSON.parse(localStorage.getItem('user')).uuid
        console.log(students);
        console.log(obj.remoteStream);
      //   var out = _.filter(students, function(item) {
      //     return _.findWhere(item.uuid, obj.remoteStream);
      //  });
      var out = _.findWhere(students, {uuid: obj.remoteStream})
       console.log(out);
       $('#streamerName').text(out.name);
       if(out.uuid === CurrentUser.uuid) {
         console.log(local)
       } else {
        $('#remoteVideo').html(`
          <iframe width="100%" height="200" src="https://stream.futurelines.live:5443/WebRTCAppEE/play_embed.html?name=${obj.remoteStream}" frameborder="0" allowfullscreen></iframe>
        `);
       }
      }
      if(obj.order === "DENY_ALL") {
        $('#streamerName').text('');
        $('#remoteVideo').html('');
      }
      if(obj.order === "CLOSE_ROOM") {
        window.location.replace('https://futurelines.net');
      }
    }
  } else if (topic.includes('class') && topic.includes('chat')) {
    let data = message.toString();
    let obj = JSON.parse(data)
    var CurrentUser = JSON.parse(localStorage.getItem('user'));
    var date = moment(new Date(obj.created_at)).fromNow();
    var photo = obj.user.profile_picture;
    var message = obj.content;
    var sent = CurrentUser.id === obj.user_id ? true : false ;
    var name = obj.user.name;
    if(message.includes('متصل الأن')) {
      $('#chatbox').append(
        `<div class="d-flex justify-content-center mb-4">
            <div class="msg_cotainer_info">
                ${name} : ${message}
                <span class="msg_time">${date}</span>
            </div>
        </div>`);
      raise();
    } else {
    if(sent) {
      $('#chatbox').append(
          `<div class="d-flex justify-content-${sent ? 'end' : 'start'} mb-4">
              <div class="msg_cotainer_send">
                  انت : ${message}
                  <span class="msg_time">${date}</span>
              </div>
              <div class="img_cont_msg">
                  <img src="${photo}" class="rounded-circle user_img_msg">
              </div>
          </div>`)
      } else {
          $('#chatbox').append(
              `<div class="d-flex justify-content-${sent ? 'end' : 'start'} mb-4">
                  <div class="img_cont_msg">
                      <img src="${photo}" class="rounded-circle user_img_msg">
                  </div>    
                  <div class="msg_cotainer${sent ? '_send' : ''}">
                      ${name} : ${message}
                      <span class="msg_time">${date}</span>
                  </div>
              </div>`)
      }
     raise();
  }
  }
  $("#chatbox"). animate({ scrollTop: $('#chatbox').prop("scrollHeight")}, 1000);
}

function startStream(obj) {

}

function endStream(obj) {

}

function handRaised(obj) {
  let user = document.getElementById(obj.uuid);
  let listItem = document.getElementsByClassName(obj.uuid);
  $(user).addClass('text-success')
  $(listItem).addClass('active');
  raise();
}

function handLowered(obj) {
  let user = document.getElementById(obj.uuid);
  let listItem = document.getElementsByClassName(obj.uuid);
  $(user).removeClass('text-success')
  $(listItem).removeClass('active');
}