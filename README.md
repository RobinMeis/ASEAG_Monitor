# ASEAG_Monitor
Displays ASEAG departures served by an MQTT server

## Requirements
* MQTT server with websocket support (mosquitto)
* aseag2mqtt.py -> https://github.com/RobinMeis/HomeScripts/blob/master/aseag2mqtt.py
* Web server

### Installation
1. Download and configure aseag2mqtt.py. Make sure to run it every few minutes
2. Download ASEAG_Monitor
3. Extract it to a webpage directory (Accessing using HTTP is required for websockets to work)
4. Configure ASEAG_Monitor using config.js
5. Have fun!

### Why MQTT?
Because I use the departure times at multiple systems and for multiple purposes. To avoid multiples requests to ASEAG servers, I download the data and publish it on my private MQTT server in my network

### I don't want to setup MQTT
Great! You can use services like test.mosquitto.org. I propose to publish the data to the following topic: `aseag/departures/[Stop name]`. This way others can use the data as well
