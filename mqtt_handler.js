var mqtt;
var reconnectTimeout = 2000;

function MQTTconnect() {
if (typeof path == "undefined") {
path = '/mqtt';
}
mqtt = new Paho.MQTT.Client(
  host,
  port,
  path,
  "web_" + parseInt(Math.random() * 100, 10)
);
    var options = {
        timeout: 3,
        useSSL: useTLS,
        cleanSession: cleansession,
        onSuccess: onConnect,
        onFailure: function (message) {
            $('#status').val("Connection failed: " + message.errorMessage + "Retrying");
            setTimeout(MQTTconnect, reconnectTimeout);
        }
    };

    mqtt.onConnectionLost = onConnectionLost;
    mqtt.onMessageArrived = onMessageArrived;

    if (username != null) {
        options.userName = username;
        options.password = password;
    }
    console.log("Host="+ host + ", port=" + port + ", path=" + path + " TLS = " + useTLS + " username=" + username + " password=" + password);
    mqtt.connect(options);
}

function onConnect() {
    $('#status').val('Connected to ' + host + ':' + port + path);
    // Connection succeeded; subscribe to our topic
    mqtt.subscribe(topic, {qos: 0});
}

function onConnectionLost(response) {
    setTimeout(MQTTconnect, reconnectTimeout);
    $('#status').val("connection lost: " + response.errorMessage + ". Reconnecting");

};

function onMessageArrived(message) {

    var topic = message.destinationName;
    var payload = message.payloadString;
    var payload_decoded = $.parseJSON(payload)

    for (n=payload_decoded.length; n>1; n--) {
      for (i=0; i<n-1; i++) {
        if (payload_decoded[i]["expectedTime"] == null) time_i = Date.parse(payload_decoded[i]["plannedTime"])
        else time_i = new Date(payload_decoded[i]["expectedTime"])

        if (payload_decoded[i+1]["expectedTime"] == null) time_ii = Date.parse(payload_decoded[i+1]["plannedTime"])
        else time_ii = new Date(payload_decoded[i+1]["expectedTime"])
        if (time_i > time_ii) {
          if (payload_decoded[i]["expectedTime"] == null) payload_decoded[i]["plannedTime"] = time_ii
          else payload_decoded[i]["expectedTime"] = time_ii

          if (payload_decoded[i+1]["expectedTime"] == null) payload_decoded[i]["plannedTime"] = time_i
          else payload_decoded[i+1]["expectedTime"] = time_i
        }
      }
    }

    $('#departures').html("<tr><th>Linie</th><th>Richtung</th><th>Abfahrt</th></tr>");
    payload_decoded.forEach(function (departure) {
      departure_expected = new Date(departure["expectedTime"])
      remaining_minutes = Math.floor((departure_expected - Date.now()) /1000/ 60)
      if (remaining_minutes > 0) {
        if (departure["realtime"] == true) {
          $('#departures').append('<tr><td>' + departure["route"]["name"] + '</td><td>' + departure["destinationStage"]["name"] + '</td><td>' + remaining_minutes + ' Min</td></tr>');
        } else {
          $('#departures').append('<tr><td>' + departure["route"]["name"] + '</td><td>' + departure["destinationStage"]["name"] + '</td><td>' + ('0' + departure_expected.getHours()).slice(-2) + ':' + ('0' + departure_expected.getMinutes()).slice(-2) + '</td></tr>');
        }

        if (remaining_minutes <= 5) {
          $( "tr" ).last().addClass("next");
        } else if (remaining_minutes <= 10) {
          $( "tr" ).last().addClass("soon");
        }
      } else if (remaining_minutes == 0) {
        $('#departures').append('<tr><td>' + departure["route"]["name"] + '</td><td>' + departure["destinationStage"]["name"] + '</td><td>Jetzt</td></tr>');
        $( "tr" ).last().addClass("next");
      }
    })
};


$(document).ready(function() {
    $('#stop_name').text(stop_name);
    $(document).attr("title", stop_name);
    MQTTconnect();
});
