// document.addEventListener("DOMContentLoaded", function(event) {
//     const element = document.createElement('h1')
//     element.innerHTML = "Hello World"
//     document.body.appendChild(element)
// })

import $ from 'jquery';
import boostrap from 'bootstrap';
require('popper.js');
import './index.css';
import { ping } from './js/app';
import { WebRTCAdaptor } from './js/webrtc_adaptor';
import { mqttInit } from './js/mqtt';

$(document).ready(function(){
    $('#action_menu_btn').click(function(){
        $('.action_menu').toggle();
    });
    $('#action_menu_btn_2').click(function(){
        $('.action_menu_2').toggle();
    });

});
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const classId = urlParams.get('classId')
const apiToken = urlParams.get('token')
function PlaySuccess() {
    $('#sound1').play();
}
var config = {
  'user' : {
    email: 'admin@example.com'
  },
  'token': apiToken,
  'classId': classId
};
function beep() {
    var snd = new Audio("./success.wav");  
    snd.play();
}
mqttInit(config);
