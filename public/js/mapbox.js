
export const displayMap = locations => {
        
    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9obnRlcHMiLCJhIjoiY201Z3ZzMzlpMGNmODJrcHdyd3YyeGQ2NyJ9.4Q9WVSmFLthYqe0x07SKJA';

    const map = new mapboxgl.Map({
        container: 'map', 
        style: 'mapbox://styles/johnteps/cm5idl5bt001e01sobcs7g4xu',
        scrollZoom: false
    });

    // set center and zoom given from the locations data in order to fit the markers
    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // create marker
        const el = document.createElement('div');
        el.className = 'marker';

        // add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
            .setLngLat(loc.coordinates)
            .addTo(map);
        
        // add popup
        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        // extend map bounds to include current location
        bounds.extend(loc.coordinates);

    });

    map.fitBounds(bounds,  {
        padding: {
            top: 150,
            bottom: 150,
            left: 100,
            right: 100 
        }
    });
}
