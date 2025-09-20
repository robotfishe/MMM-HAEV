/* Magic Mirror
 * Module: MMM-HAEV
 * 
 * by robotfishe https://github.com/robotfishe
 * 
 * MIT license
 */
 
Module.register("MMM-HAEV", {
  
  requiresVersion: '2.14.0',
  defaults: {
    text: 'HAEV',
    updateInterval: 5 * 60 * 1000,
    metricRange: true,
	map: false,
	mapboxStyle: "satellite-streets-v11",
	width: 360,
    rangeEntity: '',
    batteryEntity: '',
    pluggedEntity: '',
    powerEntity: '',
    locationEntity: ''
  },

  carData: [],
  intervalId: 0,


  init: function () {
    Log.log("MMM-HAEV is initialising");
  },

  /**
   * Starts the module
   */
  start: function () {
    Log.info(this.name + ' is starting');
    this.sendSocketNotification('SET_CONFIG', this.config);
  },

  /**
   * Module loaded event
   */
  loaded: function (callback) {
    this.finishLoading();
    Log.info(this.name + ' is loaded!');
    callback();
  },

  /**
   * Returns css style, below css classes can be overridden in custom.css
   */
  getStyles: function () {
    return [
      'MMM-HAEV.css',
    ]
  },

  /**
   * Returns header to be shown on module
   */
  getHeader: function () {
    return this.data.header || "Vehicle Status";
  },

  getDom: function () {
	  var self = this;
	  if (this.carData.length === 0) {
		  const wrapper = document.createElement("div");
		  wrapper.innerHTML = "Initialising MMM-HAEV...";
		  return wrapper;
	  } else {
        var range = parseInt(this.carData.find(entity => entity.entity_id === this.config.rangeEntity)?.state);
        var level = parseInt(this.carData.find(entity => entity.entity_id === this.config.batteryEntity)?.state);
        if (this.carData.find(entity => entity.entity_id === this.config.pluggedEntity)?.state == "on") {
          var plugged = true;
        } else {
          var plugged = false;
        }
        if (plugged) {
          var kW = this.carData.find(entity => entity.entity_id === this.config.powerEntity)?.state;
        } else {
          var kW = 0;
        };
        var blue = '#009BF3';
        var green = '#07D800';
        var yellow = '#F1E300';
        var red = '#E00000';
	  
        console.log("Creating MMM-HAEV div");
        const wrapper = document.createElement("table");
        const rowOne = document.createElement("tr");
        const rowTwo = document.createElement("tr");
        const canCell = document.createElement("td");
        canCell.setAttribute("rowspan","2");
        const can = document.createElement("canvas");
        can.id = "can";
        can.style.position="absolute";
        can.style.left="0";
        can.style.top="0";
        const rangeCell = document.createElement("td");
        const chargeCell = document.createElement("td");
        const rangeIconCell = document.createElement("td");
        const chargeIconCell = document.createElement("td");
        const c = can.getContext('2d');

        can.width = .4*this.config.width;
        can.height = .4*this.config.width;

        var posX = can.width / 2,
        posY = can.height / 2,
        onePercent = 360 / 100,
        degrees = onePercent * level;

        c.lineCap = 'round';
        c.clearRect( 0, 0, can.width, can.height );
        percent = degrees / onePercent;

        canCell.innerHTML = `<span class="medium bright">` + level + `%</span>`;

        c.beginPath();
        c.arc( posX, posY, can.width/2-5, (Math.PI/180) * 270, (Math.PI/180) * (270 + 360) );
        c.strokeStyle = '#444444';
        c.lineWidth = '8';
        c.stroke();

        c.beginPath();
        if (plugged) {
            c.strokeStyle = blue;
        } else if (level >= 80) {
              c.strokeStyle = green;
        } else if (level >= 30) {
              c.strokeStyle = yellow;
        } else {
              c.strokeStyle = red;
        };
        c.lineWidth = '10';
        c.arc( posX, posY, can.width/2-5, (Math.PI/180) * 270, (Math.PI/180) * (270 + degrees) );
        c.stroke();

        rangeIconCell.innerHTML = `<span class = "fa fa-fw fa-road"></span>`;

        if (this.config.metricRange == true) {
            rangeCell.innerHTML = range + `km`;
        } else {
            rangeCell.innerHTML = range + ` miles`;
        };

        chargeIconCell.innerHTML = `<span class="fa fa-fw fa-bolt"></span>`

        if (plugged == true) {
            if (kW>=1) {
                chargeCell.innerHTML = `Charging ` + kW + ` kW</span>`;
                chargeCell.classList.add("bright");
                chargeIconCell.classList.add("bright");
            } else {
                chargeCell.innerHTML = `Plugged in`;
            };
        } else {
            chargeCell.innerHTML = `Unplugged`;
            chargeCell.classList.add("dimmed");
            chargeIconCell.classList.add("dimmed");
        }

        wrapper.appendChild(rowOne);
        wrapper.style.width=this.config.width;
        rowOne.appendChild(canCell);
        canCell.style.width=can.width+"px";
        canCell.style.height=can.width+"px";
        canCell.classList.add("canCell");
        canCell.appendChild(can);
        rowOne.appendChild(rangeIconCell);
        rangeIconCell.classList.add("iconCell");
        rowOne.appendChild(rangeCell);
        //rangeCell.style.width=this.config.width-can.width+"px";
        //rangeCell.style.height="75px";
        wrapper.appendChild(rowTwo);
        rowTwo.appendChild(chargeIconCell);
        chargeIconCell.classList.add("iconCell");
        rowTwo.appendChild(chargeCell);
        //chargeCell.style.width=this.config.width-can.width+"px";
        chargeCell.style.height="75px";
        wrapper.id = "wrapper";

        if (this.config.map == true) {

            var latitude = self.carData.find(entity => entity.entity_id === this.config.locationEntity)?.attributes.latitude;
            var longitude = self.carData.find(entity => entity.entity_id === this.config.locationEntity)?.attributes.longitude;

            const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/` + self.config.mapboxStyle + `/static/geojson(%7B%22type%22:%22Feature%22,%22properties%22:%7B%22marker-color%22:%222e7ebb%22,%22marker-size%22:%22medium%22,%22marker-symbol%22:%22car%22%7D,%22geometry%22:%7B%22type%22:%22Point%22,%22coordinates%22:[` + longitude + `,` + latitude + `]%7D%7D)/` + longitude + `,` + latitude + `,17/400x200?access_token=` + self.config.mapboxApiKey;

            const rowThree = document.createElement("tr");

            const mapCell = document.createElement("td");
            mapCell.setAttribute("colspan","3");

            mapCell.innerHTML = `<img src = "` + mapUrl + `" style="border-radius:16px;margin-top:10px;"/>`

            wrapper.appendChild(rowThree);
            rowThree.appendChild(mapCell);

        }

        return wrapper;
	}
  },


  notificationReceived: function (notification, payload, sender) {
    if (notification === 'UPDATE_CAR_DATA') {
      this.sendSocketNotification('GET_CAR_DATA');
    }
    else if (notification === 'MODULE_DOM_CREATED') {
      this.updateDom();
    }
  },


  socketNotificationReceived: function (notification, payload) {
    let self = this;
	console.log('Notification from helper: ' + notification);
	console.log('Payload received from helper: ' + JSON.stringify(payload));
	//console.log('Payload identifier: ' + payload.identifier);
	//console.log('Payload identifier  match: ' + this.identifier);
	
    //if (payload && payload.identifier !== this.identifier) return;

    if (notification == 'GET_CONFIG') {
      Log.debug('Get config received');
      this.sendSocketNotification('SET_CONFIG', this.config);
    }
    else if (notification == 'MMM_HAEV_READY') {
      Log.debug('MMM-HAEV is Ready');
      self.updateData();
      self.startLoop();
    }
    else if (notification == 'UPDATE_CAR_DATA') {
      Log.debug('Update car data');
      if (payload && payload.body && Array.isArray(payload.body)) {
        self.carData = payload.body;
      } else {
        Log.error("Received data is not a valid array of entities.");
        self.carData = []; // Assign an empty array to prevent further errors
      }
      //if (self.config.displayStyle.toLowerCase() === 'singledial') {
      //  if (!self.ticksInitilized) {
      //    self.initTicks();
      //  }
      //  else
      self.updateDom();
      //}
      //else {
      //  document.getElementById('fuelpath' + self.idSuffix).setAttribute("stroke-dasharray", payload.level.value + ", 100");
      //  document.getElementById('percent' + self.idSuffix).innerHTML = '&nbsp;' + payload.level.value + '%';
      //  document.getElementById('range' + self.idSuffix).innerHTML = payload.range.value;
      //  var rangePercent = (payload.range.value * 100 / self.config.maxRange);
      //  document.getElementById('rangepath' + self.idSuffix).setAttribute("stroke-dasharray", rangePercent + ", 100");
      //}
    }
  },

  /**
   * Starts the update loop
   */
  startLoop: function () {
    let self = this;
    if (self.intervalId != 0) return;
    self.intervalId = window.setInterval(() => {
      self.updateData();
	  self.updateDom();
    }, this.config.updateInterval);
  },

  /**
   * Updates vehicle data
   */
  updateData() {
    console.log('Requesting vehicle data from node_helper');
    this.sendSocketNotification('GET_CAR_DATA');
  },

});
