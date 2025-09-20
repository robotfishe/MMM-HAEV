var NodeHelper = require("node_helper");
const request = require('request');

var authToken = null;

const apiUrl = "https://homeassistant.julian.fish/api/states"

module.exports = NodeHelper.create({

  defaults: {
    debug: false,
    apiKey: '',
  },

  start: function () {
    console.log('Starting node_helper for MMM-HAEV');
  },

  socketNotificationReceived: function (notification, payload) {
    var self = this;
	console.log('Socket notification received ' + notification);
	
	if (notification == 'SET_CONFIG') {
      this.config = Object.assign(this.defaults, payload);
      self.sendSocketNotification('MMM_HAEV_READY');
	  return;
    }
	
	if (self.config.apiKey.length < 2) {
		console.log('Config info missing!')
        self.sendSocketNotification('GET_CONFIG');
        return;
    }

    else if (notification == 'GET_CAR_DATA') {
		  self.getVehicleData();
    }
  },
  
  getVehicleData: function () {
	  var self = this;
      if (apiUrl.length == 0) {
        self.sendSocketNotification('GET_CONFIG');
        return;
      }
      const options = {
        url: apiUrl,
        method: 'GET',
		json: true,
        headers: {
          'Authorization': 'Bearer ' + self.config.apiKey
        }
      };
		console.log('Sending GET request with auth token: ' + authToken);
      request(options, function (error, response, body) {
        if (!error) {
			console.log('Response status code ' + response.statusCode);
          if (response.statusCode == 200) {
            self.sendSocketNotification('UPDATE_CAR_DATA', response);
			//self.debug('Received response: ' + JSON.stringify(response));
          }
		  else if (response.statusCode == 401) {
			  console.log('Unauthorised! Check apiKey.');
			  return;
          } else {
            console.log(response.statusCode + ' - ' + response.statusMessage);
          }
        } else if (error) {
          console.log(error);
        }
      });
	  
  },

  debug: function (msg) {
    var shouldLog = true;
    if (this.config && typeof this.config.debug !== 'undefined') shouldLog = this.config.debug;
    if (shouldLog) console.log(msg);
  }
});
