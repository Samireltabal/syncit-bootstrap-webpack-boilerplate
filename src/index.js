// document.addEventListener("DOMContentLoaded", function(event) {
//     const element = document.createElement('h1')
//     element.innerHTML = "Hello World"
//     document.body.appendChild(element)
// })

import $ from 'jquery';
import boostrap from 'bootstrap';
import moment from 'moment';
require('popper.js');
import './index.css';
import { ping } from './js/app';
import { mqttInit } from './js/mqtt';
import { initWebRTCAdaptor, switchAudioMode, switchVideoMode, startPublishing, stopPublishing, toggle_camera, toggle_audio, getStreamState } from './js/stream'
import { initClass, fetchStudents, fetchInfo, fetchChat } from './js/axios';
import axios from 'axios';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const classId = urlParams.get('classId')
const apiToken = urlParams.get('token')
var User;

initClass(apiToken).then((response) => {
    User = response.data
    localStorage.setItem('user', JSON.stringify(response.data));
    fetchStudents(apiToken, classId).then(() => {
        $(document).ready( function () {
            document.getElementsByClassName('StudentItem').on('click', function (event) {
                window.alert(event.id);
            });
        });
    });
    $('#userName').text(response.data.name);
    initWebRTCAdaptor(false, true);
    fetchChat(apiToken, classId, User);
    mqttInit(apiToken,classId, User);
    handleForm();
});

function handleForm (){
    $('#attachButton').click(function(){ $('#fileForm').trigger('click'); });
    $('#fileForm').on('change', function(e) {
        $('#fileName').text(e.target.files[0].name);
    });
    $('#sendChat').on('click', function() {
        const headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': apiToken
        }
        var data = new FormData();
        data.append('content', $('#chatMessage').val());
        data.append('stream_id', classId);
        data.append('file', $('input#fileForm')[0].files[0]);

        axios.post('https://api.futurelines.net/api/v2/class/chat/add', data, {headers: headers}).then((response) => {
            fetchChat(apiToken, classId, User).then(() =>{
                $('#chatMessage').val('')
                $('input#fileForm').val('')
            })
        }).catch((err) => {

        })
    })
}

setInterval(() => {
    if(getStreamState(classId)) {
        fetchInfo(apiToken, classId).then((response) => {
            $('#viewers').text(response.data.webRTCViewerCount);
            $('#speed').text(parseFloat(response.data.speed).toFixed(2) + ' X');
            $('#start').text(moment(moment(response.data.startTime).format('YYYYMMDDkkmmss'), 'YYYYMMDDkkmmss').fromNow());
        });
    } else {
        $('#viewers').text('N/A');
        $('#speed').text('N/A');
        $('#start').text('N/A');
    }
}, 30000);

$(document).ready(function(){
    $('#testJquery').on('click', function () {
        $('#remoteVideo').slideToggle();
    });
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
    $('#camera_toggle').on('click', function () {
        toggle_camera();
    })
    $('#audio_toggle').on('click', function () {
        toggle_audio();
    });
});

