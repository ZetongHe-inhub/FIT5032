<template>
  <div class="container-fluid p-0">
    <div class="map-toolbar">
      <h1 class="h5 m-0">Explore Map</h1>
      <small class="text-muted">Search places • Plan routes • Locate me</small>
    </div>

    <!-- map container -->
    <div id="map" class="mapbox"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'

// read from environment variable
const token = import.meta.env.VITE_MAPBOX_TOKEN

let map

onMounted(() => {
  mapboxgl.accessToken = token
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [144.9631, -37.8136], // Melbourne
    zoom: 11
  })

  // top-right：zoom function
  map.addControl(new mapboxgl.NavigationControl(), 'top-right')

  // top right: location function
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showAccuracyCircle: false
    }),
    'top-right'
  )

  // top-left：location search box
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    marker: false,
    placeholder: 'Search places'
  })
  map.addControl(geocoder, 'top-left')

  // route planning function
  const directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    unit: 'metric',
    profile: 'mapbox/driving',
    interactive: true,
    alternatives: true,
    controls: { instructions: true, profileSwitcher: true }
  })
  map.addControl(directions, 'top-left')

  // click on map to set destination (quick way)
  map.on('click', (e) => {
    const { lng, lat } = e.lngLat
    directions.setDestination([lng, lat])
  })
})

onBeforeUnmount(() => {
  if (map) map.remove()
})
</script>

<style scoped>
.mapbox {
  height: calc(100vh - 56px);
  width: 100%;
}

:deep(.mapboxgl-ctrl-top-left) {
  margin-top: 64px; 
}

:deep(.mapboxgl-ctrl-top-right) {
  margin-top: 64px;
}

.map-toolbar {
  position: absolute;
  z-index: 2;
  left: 12px;
  top: 64px;            
  background: rgba(255, 255, 255, 0.92);
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, .1);
}
</style>
