//  console.log("hello")
const socket = io();

// Initialize the map with a default view
const map = L.map("map").setView([28.7041, 77.1025], 13); // Default view of Delhi, India with zoom level 13

// Store all markers in an object with socket ID as the key
const markers = {};

// Add a tile layer (base map)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: "Ankur Jain"
}).addTo(map);

// Set up geolocation tracking
if(navigator.geolocation){
 navigator.geolocation.watchPosition(
    (position) => {
        const {latitude, longitude} = position.coords;
        
        // Send location to server
        socket.emit("send-location", {latitude, longitude});
        
        // Update map view to user's current position
        map.setView([latitude, longitude], 15);
        
        // Add or update marker for current user
        if (markers[socket.id]) {
            markers[socket.id].setLatLng([latitude, longitude]);
        } else {
            markers[socket.id] = L.marker([latitude, longitude]).addTo(map);
            markers[socket.id].bindPopup("You are here!").openPopup();
        }
    },
    (error) => {
        console.log("Error getting location:", error);
    },
    {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    }
 );
}

// Listen for location updates from other users
socket.on("receive-location", (data) => {
    const {id, latitude, longitude} = data;
    
    // Skip if this is our own location (already handled above)
    if (id === socket.id) return;
    
    console.log(`Received location from ${id}: ${latitude}, ${longitude}`);
    
    // Add or update marker for the user
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
        markers[id].bindPopup(`User ${id.substring(0, 5)}...`);
    }
});

// // Handle user disconnections
// socket.on("user-disconnected", (data) => {
//     const {id} = data;
    
//     console.log(`User disconnected: ${id}`);
    
//     // Remove the marker if it exists
//     if (markers[id]) {
//         map.removeLayer(markers[id]);
//         delete markers[id];
//     }
// });


