import { WebRTCAdaptor } from './webrtc_adaptor';

var start_publish_button = document.getElementById("start_publish_button");
var stop_publish_button = document.getElementById("stop_publish_button");

var pc_config = {
    'iceServers' : [{
        'urls' : 'stun:stun.l.google.com:19302'
    }]
};

var sdpConstraints = {
    OfferToReceiveAudio : false,
    OfferToReceiveVideo : false
};

var mediaConstraints = {
    video : true,
    audio : true
};

var isMicMuted = false;
var isCameraOff = false;
var camera_button = $('#camera_toggle');
var audio_button = $('#audio_toggle');
export function toggle_camera() {
    if(isCameraOff)  {
        $(camera_button).addClass('device-online');
        $(camera_button).removeClass('device-offline');
        turnOnLocalCamera();
    } else { 
        $(camera_button).addClass('device-offline');
        $(camera_button).removeClass('device-online');
        turnOffLocalCamera();
    }
}
export function toggle_audio() {
    if(isMicMuted)  {
        $(audio_button).addClass('device-online');
        $(audio_button).removeClass('device-offline');
        unmuteLocalMic();
    } else { 
        $(audio_button).addClass('device-offline');
        $(audio_button).removeClass('device-online');
        muteLocalMic();
    }
}
function turnOffLocalCamera() {
    webRTCAdaptor.turnOffLocalCamera();
    isCameraOff = true;
    sendNotificationEvent("CAM_TURNED_OFF");
}

function turnOnLocalCamera() {
    webRTCAdaptor.turnOnLocalCamera();
    isCameraOff = false;
    sendNotificationEvent("CAM_TURNED_ON");
}

function muteLocalMic(){
    webRTCAdaptor.muteLocalMic();
    isMicMuted = true;
    sendNotificationEvent("MIC_MUTED");
}

function unmuteLocalMic() {
    webRTCAdaptor.unmuteLocalMic();
    isMicMuted = false;
    sendNotificationEvent("MIC_UNMUTED");
}

function sendNotificationEvent(eventType) {
    if(isDataChannelOpen) {
        var notEvent = { streamId: classId, eventType:eventType };

        webRTCAdaptor.sendData(classId, JSON.stringify(notEvent));
    }    else {
        console.log("Could not send the notification because data channel is not open.");
    }
}
export function startPublishing(classId, token = '12345678') {
    webRTCAdaptor.publish(classId, token);
}

export function stopPublishing() {
    if (autoRepublishIntervalJob != null) {
        clearInterval(autoRepublishIntervalJob);
        autoRepublishIntervalJob = null;
    }
    webRTCAdaptor.stop(streamId);
}

export function switchVideoMode(chbx) {
    console.log('data changed to : ', chbx)
    if(chbx == "screen") {
        webRTCAdaptor.switchDesktopCapture(streamId);
    }
    else if(chbx == "screen+camera"){
        webRTCAdaptor.switchDesktopCaptureWithCamera(streamId);
  }
  else {
        webRTCAdaptor.switchVideoCameraCapture(streamId, chbx);
    }
}

export function switchAudioMode(chbx) {
  webRTCAdaptor.switchAudioInputSource(streamId, chbx);
}

export function getCameraRadioButton(deviceName, deviceId) {
    return "<option value='" + deviceId + "'>" + deviceName + "</option>";
}

export function getAudioRadioButton(deviceName, deviceId) {
    return "<option value='" + deviceId + "'>" + deviceName + "</option>";
}

function checkAndRepublishIfRequired() {
    var iceState = webRTCAdaptor.signallingState(streamId);
     if (iceState == null || iceState == "failed" || iceState == "disconnected"){
         console.log("Publish has stopped and will try to re-publish");
         webRTCAdaptor.stop(streamId);
         webRTCAdaptor.closePeerConnection(streamId);
         webRTCAdaptor.closeWebSocket();
         initWebRTCAdaptor(true, autoRepublishEnabled);
     }
}
export function getStreamState(streamId) {
    var state = webRTCAdaptor.signallingState(streamId);
    var iceState = webRTCAdaptor.iceConnectionState(streamId);
    if (iceState != null && iceState != "failed" && iceState != "disconnected" && state != null && state != "closed") {
        return true;
    } else {
        return false;
    }
}
function startAnimation(value, state) {
    $('#broadcastingInfo').text(value)
    if( state === 'SUCCESS') {
        $("#broadcastingInfo").removeClass('badge-danger').addClass('badge-success')
        $("#broadcastingInfo").fadeIn(800, function () {
          $("#broadcastingInfo").fadeOut(800, function () {
                var state = webRTCAdaptor.signallingState(streamId);
            if (state != null && state != "closed") {
                var iceState = webRTCAdaptor.iceConnectionState(streamId);
                if (iceState != null && iceState != "failed" && iceState != "disconnected") {
                      startAnimation('مباشر', 'SUCCESS');
                }
            }
          });
        });   
    } else {
        $('#broadcastingInfo').removeClass('badge-success').addClass('badge-danger');
        $('#broadcastingInfo').show();
    }
  }
var isDataChannelOpen = false;
var rtmpForward = true;
var appName = "/WebRTCAppEE/";
var path =  "stream.futurelines.live" + ":5443" + appName + "websocket?rtmpForward=" + rtmpForward;
var websocketURL =  "wss://" + path;
if (location.protocol.startsWith("https")) {
	websocketURL = "wss://" + path;
}
var	webRTCAdaptor = null;

var autoRepublishEnabled = true;
var autoRepublishIntervalJob = 30;
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const classId = urlParams.get('classId');
var streamId = classId;

export function initWebRTCAdaptor(publishImmediately, autoRepublishEnabled) {
	webRTCAdaptor = new WebRTCAdaptor({
        websocket_url : websocketURL,
        mediaConstraints : mediaConstraints,
        peerconnection_config : pc_config,
        sdp_constraints : sdpConstraints,
        localVideoId : "localVideo",
        debug:false,
        bandwidth:900,
        callback : function(info, obj) {
            if (info == "initialized") {
                isDataChannelOpen = true;
                console.log("initialized");
                start_publish_button.disabled = false;
                stop_publish_button.disabled = true;
                if (publishImmediately) {
                    webRTCAdaptor.publish(streamId, null)
                }
            } else if (info == "publish_started") {
                //stream is being published
                console.log("publish started");
                start_publish_button.disabled = true;
                stop_publish_button.disabled = false;
                startAnimation('مباشر','SUCCESS');
                if (autoRepublishEnabled && autoRepublishIntervalJob == null) 
                {
                    autoRepublishIntervalJob = setInterval(() => {
                        checkAndRepublishIfRequired();
                    }, 3000);
                    
                }
            } else if (info == "publish_finished") {
                //stream is being finished
                console.log("publish finished");
                startAnimation('انهيت البث','failed');
                start_publish_button.disabled = false;
                stop_publish_button.disabled = true;
            }
            else if (info == "browser_screen_share_supported") {
                $(".video-source").prop("disabled", false);
                
                console.log("browser screen share supported");
                browser_screen_share_doesnt_support.style.display = "none";
            }
            else if (info == "screen_share_stopped") {
                //choose the first video source. It may not be correct for all cases. 
                $(".video-source").first().prop("checked", true);	
                console.log("screen share stopped");
            }
            else if (info == "closed") {
                //console.log("Connection closed");
                if (typeof obj != "undefined") {
                    isDataChannelOpen = false
                    console.log("Connecton closed: " + JSON.stringify(obj));
                }
                startAnimation('راجع الانترنت','failed');
                checkAndRepublishIfRequired();
            }
            else if (info == "pong") {
                //ping/pong message are sent to and received from server to make the connection alive all the time
                //It's especially useful when load balancer or firewalls close the websocket connection due to inactivity
            }
            else if (info == "refreshConnection") {
                checkAndRepublishIfRequired();
            }
            else if (info == "ice_connection_state_changed") {
                console.log("iceConnectionState Changed: ",JSON.stringify(obj));
            }
            else if (info == "updated_stats") {
                //obj is the PeerStats which has fields
                    //averageOutgoingBitrate - kbits/sec
                    console.log(obj)
                //currentOutgoingBitrate - kbits/sec
                console.log("Average outgoing bitrate " + obj.averageOutgoingBitrate + " kbits/sec"
                        + " Current outgoing bitrate: " + obj.currentOutgoingBitrate + " kbits/sec");

            }
            else if (info == "data_channel_opened") {

                 console.log("data channel is open");

             }
             else if (info == "data_received") {

                 console.log("Message received ", description.event.data );

                 handleData(description);
             }

             else if (info == "data_channel_error") {

                 handleError(description);
                 initWebRTCAdaptor(true, true);

             } else if (info == "data_channel_closed") {
                startAnimation('راجع الانترنت','failed'); 
                checkAndRepublishIfRequired();
                 initWebRTCAdaptor(true, true);
                 console.log("Data channel closed " );
             }
            else if (info == "data_received") {
                console.log("Data received: " + obj.event.data + " type: " + obj.event.type + " for stream: " + obj.streamId);
                chats.push(obj);
                renderChats();
                $("#dataMessagesTextarea").append("Received: " + obj.event.data + "\r\n");
            }
            else if (info == "available_devices") {
                var videoHtmlContent = "";
                var audioHtmlContent = "";
                obj.forEach(function(device) {
                    if (device.kind == "videoinput") {
                        videoHtmlContent += getCameraRadioButton(device.label, device.deviceId);
                    }
                    else if (device.kind == "audioinput"){
                        audioHtmlContent += getAudioRadioButton(device.label, device.deviceId);
                    }
                }); 
                $(videoHtmlContent).prependTo("#videoSource");
                $("#videoSource").find('option:eq(0)').prop('selected', true);
                
                $(audioHtmlContent).prependTo("#audioSource");
                $(".audio-source").find('option:eq(0)').prop("selected", true);	
            }
            else {
                console.log( info + " notification received");
            }
        },
        callbackError : function(error, message) {
            //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError

            console.log("error callback: " +  JSON.stringify(error));
            var errorMessage = JSON.stringify(error);
            if (typeof message != "undefined") {
                errorMessage = message;
            }
            var errorMessage = JSON.stringify(error);
            if (error.indexOf("NotFoundError") != -1) {
                errorMessage = "Camera or Mic are not found or not allowed in your device";
            }
            else if (error.indexOf("NotReadableError") != -1 || error.indexOf("TrackStartError") != -1) {
                errorMessage = "Camera or Mic is being used by some other process that does not let read the devices";
            }
            else if(error.indexOf("OverconstrainedError") != -1 || error.indexOf("ConstraintNotSatisfiedError") != -1) {
                errorMessage = "There is no device found that fits your video and audio constraints. You may change video and audio constraints"
            }
            else if (error.indexOf("NotAllowedError") != -1 || error.indexOf("PermissionDeniedError") != -1) {
                errorMessage = "You are not allowed to access camera and mic.";
            }
            else if (error.indexOf("TypeError") != -1) {
                errorMessage = "Video/Audio is required";
            }
            else if (error.indexOf("ScreenSharePermissionDenied") != -1) {
                errorMessage = "You are not allowed to access screen share";
                $("#videoSource").find('option:eq(0)').prop('selected', true);
            }
            else if (error.indexOf("WebSocketNotConnected") != -1) {
                initWebRTCAdaptor(true, true);
                errorMessage = "WebSocket Connection is disconnected.";
            }
            alert(errorMessage);
        }
    });
	}