// document.addEventListener("DOMContentLoaded", function(event) {
//     const element = document.createElement('h1')
//     element.innerHTML = "Hello World"
//     document.body.appendChild(element)
// })

import $ from 'jquery'
import boostrap from 'bootstrap'
require('popper.js');
import './index.css';
import { ping } from './js/app'

$(document).ready(function(){
    $('#action_menu_btn').click(function(){
        $('.action_menu').toggle();
    });
});
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const classId = urlParams.get('classId')
const apiToken = urlParams.get('token')
function PlaySuccess() {
    $('#sound1').play();
}
function beep() {
    var snd = new Audio("./success.wav");  
    snd.play();
}
var mqtt = require('mqtt')
var client  = mqtt.connect('ws://connect.futurelines.net:8083/mqtt', {
    clientId: 'WS_New',
    keepalive: 60,
    clean: false,
    username: 'admin@example.com',
    password: apiToken
});
client.on('connect', function () {
    client.subscribe('presence', function (err) {
      if (!err) {
        client.publish('presence', 'Hello mqtt')
      }
    })
    client.subscribe('/class/' + classId)
  })
  
  client.on('message', function (topic, message) {
    if(topic.includes('class')) {
        beep();
    }
  })
  function sendMessage() {
    client.publish('testtopic/test', 'this is message');
}
$("#jqueryTest").on('click', function () {
    sendMessage();
})
