# MMM-HAEV

This MagicMirror module is based on my older [MMM-Tronity](https://github.com/robotfishe/MMM-Tronity/) module, and uses the same style and layout, but this one is designed to pull its data from Home Assistant.

Minimal configuration:
You'll need to set the following config variables:
apiKey: a valid long-lived access token for your Home Assistant server
rangeEntity: Home Assistant entity containing your vehicle's current battery range
batteryEntity: HA entity containing your vehicle's current battery percentage
pluggedEntity: HA entity indicating whether or not your vehicle is plugged in (must report as "on"/"off")
powerEntity: HA entity containing current charging power

Map settings:
If you want to display a map of your vehicle's current location, set variable "map" to "true" and add an API key for Mapbox.com in variable "mapboxApiKey"
You can also change the display style of the map using "mapboxStyle"; defaults to "satellite-streets-v11"

Other settings:
updateInterval: in milliseconds; defaults to 5 minutes
metricRange: whether or not range is in kilometres; defaults to true
width: the width of the module container
