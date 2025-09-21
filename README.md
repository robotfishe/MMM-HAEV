# MMM-HAEV

"HAEV" stands for "Home Assistant Electric Vehicle". This MagicMirror module displays data on the current charge status and (optionally) location of your EV. It is based on my older [MMM-Tronity](https://github.com/robotfishe/MMM-Tronity/) module, and uses the same style and layout, but this one is designed to pull its data from Home Assistant.

To install:
- Run git clone https://github.com/robotfishe/MMM-Tronity.git
- Run npm install

Minimal configuration:
You'll need to set the following config variables:
- apiKey: a valid long-lived access token for your Home Assistant server
- rangeEntity: Home Assistant entity containing your vehicle's current battery range
- batteryEntity: HA entity containing your vehicle's current battery percentage
- pluggedEntity: HA entity indicating whether or not your vehicle is plugged in (must report as "on"/"off")
- powerEntity: HA entity containing current charging power

Map settings:
- map: set to "true" to display a map of your vehicle's current location; defaults to false
- mapboxApiKey: API key for [mapbox.com](https://mapbox.com); must be set if "map" is set to true
- mapboxStyle: set to one of mapbox.com's available [styles](https://docs.mapbox.com/api/maps/styles/); defaults to "satellite-streets-v11"
- locationEntity: Home Assistant entity with "latitude" and "longitude" attributes for your vehicle's location

Other settings:
- updateInterval: in milliseconds; defaults to 5 minutes
- metricRange: whether or not range is in kilometres; defaults to true
- width: the width of the module container
