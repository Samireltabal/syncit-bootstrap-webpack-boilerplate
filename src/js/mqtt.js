var mqtt = require('mqtt')
export function mqttInit (config) {
  var client  = mqtt.connect('wss://connect.futurelines.net:8084/mqtt', {
    clientId: 'fromExternalFile_',
    keepalive: 60,
    clean: false,
    username: config['user']['email'],
    password: config['token']
});
client.on('connect', function () {
    client.subscribe('presence', function (err) {
      if (!err) {
        client.publish('presence', 'Hello mqtt')
      }
    })
    client.subscribe('/class/' + config['classId'])
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