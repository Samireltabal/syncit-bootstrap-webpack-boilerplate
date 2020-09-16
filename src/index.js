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
import { mqttInit } from './js/mqtt';
import { initWebRTCAdaptor, switchAudioMode, switchVideoMode, startPublishing, stopPublishing } from './js/stream'


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

mqttInit(config);
initWebRTCAdaptor(false, true);
$(document).ready(function(){
    $('#action_menu_btn').click(function(){
        $('.action_menu').toggle();
    });
    $('#action_menu_btn_2').click(function(){
        $('.action_menu_2').toggle();
    });
    $('#videoSource').on('change', function() {
        switchVideoMode(this.value)
    });
    $('#audiSource').on('change', function() {
        switchAudioMode(this.value)
    });
    $('#start_publish_button').on('click', function () {
        startPublishing(classId);
    })
    $('#stop_publish_button').on('click', function () {
        stopPublishing();
    })
});
function beep() {
    var snd = new Audio("./success.wav");  
    snd.play();
}
