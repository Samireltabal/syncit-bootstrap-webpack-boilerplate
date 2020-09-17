var mqtt = require('mqtt')
export function mqttInit (config) {
  var client  = mqtt.connect('wss://connect.futurelines.net:8084/mqtt', {
    clientId: config['user']['email'],
    keepalive: 60,
    clean: true,
    username: config['user']['email'],
    password: config['token']
});
client.on('connect', function () {
    client.subscribe('/class/' + config['classId']);
    client.subscribe('/class/' + config['classId'] + "/chat");
    client.subscribe('/class/' + config['classId'] + "/orders/" + config['classId']);
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
}