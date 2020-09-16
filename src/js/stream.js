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

export function toggle_camera() {

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

function startAnimation() {

    $("#broadcastingInfo").fadeIn(800, function () {
      $("#broadcastingInfo").fadeOut(800, function () {
            var state = webRTCAdaptor.signallingState(streamId);
        if (state != null && state != "closed") {
            var iceState = webRTCAdaptor.iceConnectionState(streamId);
            if (iceState != null && iceState != "failed" && iceState != "disconnected") {
                  startAnimation();
            }
        }
      });
    });
  }

  var rtmpForward = true;
var appName = "/FutureLines/";
var path =  "stream.futurelines.live" + ":5080" + appName + "websocket?rtmpForward=" + rtmpForward;
var websocketURL =  "ws://" + path;
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
                console.log("initialized");
                start_publish_button.disabled = false;
                stop_publish_button.disabled = true;
                if (publishImmediately) {
                    webRTCAdaptor.publish(streamId, token)
                }
            } else if (info == "publish_started") {
                //stream is being published
                console.log("publish started");
                start_publish_button.disabled = true;
                stop_publish_button.disabled = false;
                startAnimation();
                if (autoRepublishEnabled && autoRepublishIntervalJob == null) 
                {
                    autoRepublishIntervalJob = setInterval(() => {
                        checkAndRepublishIfRequired();
                    }, 3000);
                    
                }
            } else if (info == "publish_finished") {
                //stream is being finished
                console.log("publish finished");
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
                    console.log("Connecton closed: " + JSON.stringify(obj));
                }
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
                $(videoHtmlContent).insertBefore("#screenOption");
                $("#videoSource").first().prop("selected");	
                
                $(audioHtmlContent).prependTo("#audioSource");
                $(".audio-source").first().prop("checked", true);	
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
                $(".video-source").first().prop("checked", true);						
            }
            else if (error.indexOf("WebSocketNotConnected") != -1) {
                errorMessage = "WebSocket Connection is disconnected.";
            }
            alert(errorMessage);
        }
    });
	}