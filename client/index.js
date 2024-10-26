/**
 * Create map object on DOM and return a handle to it
 *
 * @async
 * @returns {google.maps.Map}
 */
async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");

    var latlng = { lat: 34.982, lng: -81.956 };

    var mapOptions = {
        center: latlng,
        zoom: 17,
        mapTypeId: "satellite",
        mapId: "testmap-1",
    };

    const map = new Map(document.getElementById("map"), mapOptions);

    console.log(map ? "map loaded" : "map load failed");

    return map
}

/**
 * Load geolocation data from server
 * Following GeoJSON standard - RFC 7946
 *
 * @async
 * @param {google.maps.Map} map
 * @returns {*} GeoJSON data
 */
async function loadData(map){

    //FETCH DATA FROM SERVER HERE !!
    let data = await fetch("../server/example-data.json", {
        method: "get"
    }).then((res) => res.json());

    console.log(data ? "data loaded" : "data load failed");

    return data
}

/**
 * Render given GeoJSON data onto given map.
 *
 * @async
 * @param {*} data
 * @param {google.maps.Map} map
 */
async function renderData(data, map) {
    let Popup = initPopups();

    for(const feature of data.features){
        let lat = feature.geometry.coordinates[1];
        let lng = feature.geometry.coordinates[0];
        let latlng = new google.maps.LatLng(lat, lng);
        
        const content = document.createElement('div');
        content.innerHTML = "<h2>" + feature.properties.plantname + "</h2>"
                            + "<div>date: " + feature.properties.date + "</div>";

        const dot = new google.maps.Circle({
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 7,
            fillColor: "#000000",
            fillOpacity: 0.4,
            map,
            center: latlng,
            radius: 4
        })

        const popup = new Popup(latlng, content);
        popup.setMap(map);

        dot.addListener("mouseover", () => {
            popup.show()
        })
        dot.addListener("mouseout", () => {
            popup.hide();
        })
    }
}

/**
 * Create and return Popup class to be used for tooltips on map data
 *
 * @returns {Popup}
 */
function initPopups() {
    //class 
    class Popup extends google.maps.OverlayView {
        position;
        containerDiv;
        constructor(position, content) {
            super();
            this.position = position;
            content.classList.add("popup-bubble");

    
            // This zero-height div is positioned at the bottom of the bubble.
            const bubbleAnchor = document.createElement("div");
    
            bubbleAnchor.classList.add("popup-bubble-anchor");
            bubbleAnchor.appendChild(content);
            // This zero-height div is positioned at the bottom of the tip.
            this.containerDiv = document.createElement("div");
            this.containerDiv.classList.add("popup-container");
            this.containerDiv.appendChild(bubbleAnchor);
            // Optionally stop clicks, etc., from bubbling up to the map.
            Popup.preventMapHitsAndGesturesFrom(this.containerDiv);

            this.hide();
        }
        /** Called when the popup is added to the map. */
        onAdd() {
            this.getPanes().floatPane.appendChild(this.containerDiv);
        }
        /** Called when the popup is removed from the map. */
        onRemove() {
            if (this.containerDiv.parentElement) {
                this.containerDiv.parentElement.removeChild(this.containerDiv);
            }
        }

        hide(){
            if (this.containerDiv) {
                this.containerDiv.style.visibility = "hidden";
            }
        }
        show(){
            if(this.containerDiv){
                this.containerDiv.style.visibility = "visible";
            }
        }
    
        /** Called each frame when the popup needs to draw itself. */
        draw() {
            const divPosition = this.getProjection().fromLatLngToDivPixel(
                this.position,
            );
            // Hide the popup when it is far out of view.
            const display =
                Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000
                ? "block"
                : "none";
    
            if (display === "block") {
                this.containerDiv.style.left = divPosition.x + "px";
                this.containerDiv.style.top = divPosition.y + "px";
            }
    
            if (this.containerDiv.style.display !== display) {
                this.containerDiv.style.display = display;
            }
        }
    }

    return Popup
}

/**
 * Creates map on webpage and populates with with geolocation data
 *
 * @async
 */
async function generateMap(){
    const map = await initMap();
    let data = await loadData();
    renderData(data, map);
}

//run
generateMap();