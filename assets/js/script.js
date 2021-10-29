var screenWidth = $(window).width();
var consoleWidth = $("#second-console").width();
var mapHeight = $("#wrapper").height();
var getPaddingRight = (consoleWidth + 90);
var midCoordLat;
var midCoordLong;
var midCoords;

    mapboxgl.accessToken = 'pk.eyJ1Ijoicm9zcGVhcmNlIiwiYSI6ImNqbGhxaTAwNDFnamYzb25qY2Jha2NrZWgifQ.xZMz-pe7wEEpARooTi6lkw';
     var map = new mapboxgl.Map({
         container: 'map',
         style: 'mapbox://styles/rospearce/ckrm67av93g7t17nsrb3h2wrh',
         center: [3.758069752666174, 40.58141176460601],
        zoom: 1.4,
        maxZoom: 6,
        minZoom: 1.4
     });
    var hoveredStateId = null;
    var clickedStateId = null;

    map.on('load', function () {
        map.addSource('national', {
                    'type': 'geojson',
                    'data': 'assets/data/countries.geojson',
                });
        map.addSource('initialnational', {
            'type': 'geojson',
            'data': 'assets/data/countries.geojson',
        });

        // map.addSource('regions', {
        //     'type': 'geojson',
        //     'data': 'assets/data/excess.geojson',
        // });

        // map.addSource('subnational', {
        //     'type': 'geojson',
        //     'data': 'https://docs.mapbox.com/mapbox-gl-js/assets/us_states.geojson'
        // });

        // The feature-state dependent fill-opacity expression will render the hover effect
        // when a feature's hover state is set to true.
       
        map.addLayer({
            'id': 'national-initial-fills',
            'type': 'fill',
            'source': 'initialnational',
            'layout': {
                // Make the layer visible by default.
                'visibility': 'visible'
                },
            'paint': {
                'fill-color': '#c7432b',
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'clicked'], false],
                    0.4,
                    0.1
                ]
            }
        });
        
        map.addLayer({
            'id': 'national-click-fills',
            'type': 'fill',
            'source': 'national',
            'layout': {
                // Make the layer visible by default.
                'visibility': 'visible'
                },
            'paint': {
                'fill-color': '#c7432b',
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'clicked'], false],
                    0.4,
                    0.1
                ]
            }
        });

        // map.addLayer({
        //     'id': 'regions-click-fills',
        //     'type': 'fill',
        //     'source': 'regions',
        //     'layout': {
        //         // Make the layer visible by default.
        //         'visibility': 'visible'
        //         },
        //     'paint': {
        //         'fill-color': '#c7432b',
        //         'fill-opacity': [
        //             'case',
        //             ['boolean', ['feature-state', 'clicked'], false],
        //             0.4,
        //             0.1
        //         ]
        //     }
        // });

        map.addLayer({
            'id': 'national-fills',
            'type': 'fill',
            'source': 'national',
            'layout': {
                // Make the layer visible by default.
                'visibility': 'visible'
                },
            'paint': {
                'fill-color': '#c7432b',
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    0.3,
                    0.1
                ]
            }
        });

        // map.addLayer({
        //     'id': 'regions-fills',
        //     'type': 'fill',
        //     'source': 'regions',
        //     'layout': {
        //         // Make the layer visible by default.
        //         'visibility': 'visible'
        //         },
        //     'paint': {
        //         'fill-color': '#c7432b',
        //         'fill-opacity': [
        //             'case',
        //             ['boolean', ['feature-state', 'hover'], false],
        //             0.3,
        //             0.1
        //         ]
        //     }
        // });

        // map.addLayer({
        //     'id': 'national-borders',
        //     'type': 'line',
        //     'source': 'national',
        //     'layout': {
        //         // Make the layer visible by default.
        //         'visibility': 'visible'
        //         },
        //     'paint': {
        //         'line-color': '#333333',
        //         'line-width': 0.3
        //     }
        // });

        // map.addLayer({
        //     'id': 'subnational-fills',
        //     'type': 'fill',
        //     'source': 'subnational',
        //     'layout': {
        //         // Make the layer visible by default.
        //         'visibility': 'none'
        //         },
        //     'paint': {
        //         'fill-color': '#c7432b',
        //         'fill-opacity': [
        //             'case',
        //             ['boolean', ['feature-state', 'hover'], false],
        //             0.5,
        //             0.3
        //         ]
        //     }
        // });

        // map.addLayer({
        //     'id': 'subnational-borders',
        //     'type': 'line',
        //     'source': 'subnational',
        //     'layout': {
        //         // Make the layer visible by default.
        //         'visibility': 'none'
        //         },
        //     'paint': {
        //         'line-color': '#f4f4f4',
        //         'line-width': 0.3
        //     }
        // });
        
        // function countryDropdown (){

        $('#country').on('change', function (e) {
            const countrycode = $(this).val();
            country = $(this).find('option:selected').text();
            $.ajax({
                //url: "https://api.mapbox.com/geocoding/v5/mapbox.places/"+country+".json?country="+countrycode+"&access_token="+mapboxgl.accessToken,
                url: "assets/data/countries.geojson",
                dataType: 'json',
                success: function(res) {
                    var newArray = res.features.filter(function (el){
                        return el.properties.ADMIN == country
                    });
                    // console.log(newArray)
                    let center = newArray[0].properties.bounds;
                    var lat = center[0]
                    var lng = center[1]
                    // map.flyTo({
                    //     center: [lng, lat],
                    //     zoom: 5
                    // });    

                    let zoom = map.getZoom();

                    if (['Canada','Brazil', 'Argentina','Russia','China','Greenland','Antarctica'].indexOf(country) !== -1){
                        map.flyTo({
                            center: [lng, lat],
                            zoom: 2.5,
                            speed: 0.8,
                            curve:1.4,
                            essential: true
                        });
                    } else if (zoom > 4){
                        map.flyTo({
                            center: [lng, lat],
                            zoom: zoom,
                            speed: 0.8,
                            curve:1.4,
                            essential: true
                        });
                    } else {
                        map.flyTo({
                            center: [lng, lat],
                            zoom: 4,
                            speed: 0.8,
                            curve:1.4,
                            essential: true
                        });
                    }
                    var countryPopulation = 'Population: XXX,XXX';
                    var countryArea = 'Area: XXX,XXX km2';
                    let countryFlag = newArray[0].properties.flag.toLowerCase();

                    let countryID = newArray[0].id

                    if (newArray.length > 0) {

                    // if(typeof countryID === 'number') { // Need to change this
                    //     map.removeFeatureState({
                    //         source: 'national',
                    //         id: countryID
                    //     });
                    // }
                    

                    map.setFeatureState({
                        source: 'initialnational',
                        id: countryID,
                    },{
                        clicked: true
                    });

                    var newArray = countryStats.filter(function(x) {
                        return x.name === country
                    });
    
                    var yearStart = (newArray[0]["year_start"]);
                    var yearEnd = (newArray[0]["year_end"]);
                    var historicalTemp = (newArray[0]["hist_temp"]);
                    var futureLowTemp = (newArray[0]["future_temp_low"])
                    var futureTempHigh = (newArray[0]["future_temp_high"]);
                    
                    };
                    $('#welcome-console').css('display', 'none');
                    document.getElementById('top-prompt').innerHTML = '<p>How has <span class="country-bold">'+country+'</span> warmed – and may continue to warm?</p>'
                    document.getElementById('country-name').innerHTML = '<h2>'+country+'</h2>';
                    document.getElementById('country-population').innerHTML = '<p>'+countryPopulation+'</p>';
                    document.getElementById('country-size').innerHTML = '<p>'+countryArea+'</p>';
                    document.getElementById('country-flag').innerHTML = '<img class="mx-auto d-block" src="https://www.worldometers.info/img/flags/'+countryFlag+'-flag.gif"/>';
                    document.getElementById('historical-warming').innerHTML = '<p>Warming since ' + yearStart + ': <b>'+historicalTemp+'</b>C' + '<br><span class="baseline"> ['+yearStart+ ' - ' +yearEnd+' baseline]</span></p>';
                    document.getElementById('future-warming').innerHTML = '<p>' +country+ ' is projected to warm by between <b>' + futureLowTemp + 'C - '+futureTempHigh+'C</b> by 2100' + '<br><span class="baseline"> ['+yearStart+ ' - ' +yearEnd+' baseline]</span></p>';
                    
                    csv = "./assets/data/charts/warming/country_" + country + ".csv";

                    updateChart1(csv);
                    updateChart2(csv);
                }
            });
            $("#home-button").click(function() {
                map.flyTo({
                    center: [0, 30],
                    zoom: 1,
                    speed: 1,
                    animate: true,
                    essential: true,
                });
            })
        });

        document.getElementById('map').addEventListener("click", function () {
            let countryName = document.getElementById('country-name').innerHTML.slice(4, -5)
            
            csv = "./assets/data/charts/warming/country_" + countryName + ".csv";
        
            updateChart1(csv);
            updateChart2(csv);

            var newArray = countryStats.filter(function(x) {
                return x.name === countryName
            });

            console.log(newArray)

            var country = (newArray[0]["name"]); 
            console.log(country);
            var yearStart = (newArray[0]["year_start"]);
            var yearEnd = (newArray[0]["year_end"]);
            var historicalTemp = (newArray[0]["hist_temp"]);
            var futureLowTemp = (newArray[0]["future_temp_low"])
            var futureTempHigh = (newArray[0]["future_temp_high"]);
        
            
            document.getElementById('historical-warming').innerHTML = '<p>Warming since ' + yearStart + ': <b>'+historicalTemp+'</b>C' + '<br><span class="baseline"> ['+yearStart+ ' - ' +yearEnd+' baseline]</span></p>';
            document.getElementById('future-warming').innerHTML = '<p>' +country+ ' is projected to warm by between <b>' + futureLowTemp + 'C - '+futureTempHigh+'</b>C by 2100' + '<br><span class="baseline"> ['+yearStart+ ' - ' +yearEnd+' baseline]</span></p>';
        
        
        });
    
        map.on('click', 'national-click-fills', function (e) {

            if (map.getLayer('national-initial-fills')) {
                map.removeLayer('national-initial-fills');
              }

              if (map.getSource('initialnational')) {
                map.removeSource('initialnational');
              }
            
            // Variables
            
            let center = e.features[0].properties.bounds;
            var latLng = center.split(","); 
            var lat = parseFloat(latLng[0].split("[")[1]);
            var lng = parseFloat(latLng[1]);
            var promptCountry = e.features[0].properties.ADMIN;    
            var countryPopulation = 'Population: XXX,XXX';
            var countryArea = 'Area: XXX,XXX km2';
            let countryFlag = e.features[0].properties.flag.toLowerCase();
            document.getElementById('country-name').innerHTML = '<h2>'+promptCountry+'</h2>';
            document.getElementById('country-flag').innerHTML = '<img class="mx-auto d-block" src="https://www.worldometers.info/img/flags/'+countryFlag+'-flag.gif"/>';

            let zoom = map.getZoom();
            
                if (['Canada','Brazil', 'Argentina','Russia','China','Greenland','Antarctica'].indexOf(promptCountry) !== -1){
                    map.flyTo({
                        center: [lng, lat],
                        zoom: 2.5,
                        speed: 0.8,
                        curve:1.4,
                        essential: true
                    });
                } else if (zoom > 4){
                    map.flyTo({
                        center: [lng, lat],
                        zoom: zoom,
                        speed: 0.8,
                        curve:1.4,
                        essential: true
                    });
                } else {
                    map.flyTo({
                        center: [lng, lat],
                        zoom: 4,
                        speed: 0.8,
                        curve:1.4,
                        essential: true
                    });
                }

        // ! POPUP - not sure if will use

            // new mapboxgl.Popup()
            //     .setLngLat(e.lngLat)
            //     .setHTML(e.features[0].properties.ADMIN)
            //     .addTo(map);
        });

        // When the user moves their mouse over the state-fill layer, we'll update the
        // feature state for the feature under the mouse.
        map.on('mousemove', 'national-fills', function (e) {
            map.getCanvas().style.cursor = 'pointer';
            
            if (e.features.length > 0) {
                if (hoveredStateId !== null) {
                    map.setFeatureState(
                        { source: 'national', id: hoveredStateId },
                        { hover: false }
                    );
                }
                hoveredStateId = e.features[0].id;
                map.setFeatureState(
                    { source: 'national', id: hoveredStateId },
                    { hover: true }
                );
            }

            let promptCountry = e.features[0].properties.ADMIN;
            document.getElementById('top-prompt').innerHTML = '<p>How has <span class="country-bold">'+promptCountry+'</span> warmed – and may continue to warm?</p>';

        });


        // map.on('mousemove', 'subnational-fills', function (e) {
        //     map.getCanvas().style.cursor = 'pointer';
            
        //     if (e.features.length > 0) {
        //         if (hoveredStateId !== null) {
        //             map.setFeatureState(
        //                 { source: 'subnational', id: hoveredStateId },
        //                 { hover: false }
        //             );
        //         }
        //         hoveredStateId = e.features[0].id;
        //         map.setFeatureState(
        //             { source: 'subnational', id: hoveredStateId },
        //             { hover: true }
        //         );
        //     }
        //     let promptCountry = e.features[0].properties.STATE_NAME;
        //     document.getElementById('top-prompt').innerHTML = '<p>How has <span class="country-bold">'+promptCountry+'</span> warmed – and may continue to warm?</p>';
        // });

        // When the mouse leaves the state-fill layer, update the feature state of the
        // previously hovered feature.
        map.on('mouseleave', 'national-fills', function () {
            map.getCanvas().style.cursor = '';
            if (hoveredStateId !== null) {
                map.setFeatureState(
                    { source: 'national', id: hoveredStateId },
                    { hover: false }
                );
            }
            hoveredStateId = null;
        });

    map.on('mouseleave', 'national-click-fills', function () {
        map.getCanvas().style.cursor = '';
        if (hoveredStateId !== null) {
            map.setFeatureState(
                { source: 'national', id: hoveredStateId },
                { hover: false }
            );
        }
        hoveredStateId = null;
    });
});


    $('#layer-switch').on('click', function () {
        $(this).val(this.checked ? 1 : 0);
        console.log($(this).val())

        if ($(this).val() == 1) {
            map.setLayoutProperty(
                'national-fills',
                'visibility',
                'none'
                );
            map.setLayoutProperty(
                'national-borders',
                'visibility',
                'none'
                );
            map.setLayoutProperty(
                'national-click-fills',
                'visibility',
                'none'
                );
            // map.setLayoutProperty(
            //     'subnational-fills',
            //     'visibility',
            //     'visible'
            //     );
            // map.setLayoutProperty(
            //     'subnational-borders',
            //     'visibility',
            //     'visible'
            //     );
        } else {
            map.setLayoutProperty(
                'national-fills',
                'visibility',
                'visible'
                );
            map.setLayoutProperty(
                'national-borders',
                'visibility',
                'visible'
                );
            map.setLayoutProperty(
                'national-click-fills',
                'visibility',
                'visible'
                );
            // map.setLayoutProperty(
            //     'subnational-fills',
            //     'visibility',
            //     'none'
            //     );
            // map.setLayoutProperty(
            //     'subnational-borders',
            //     'visibility',
            //     'none'
            //     );
        }
    
    });

    // stop accordion collapsing 
    // !REMOVE ? 
    // $('#accordion-button.btn.btn-link').click(function(e){
        
    //     target = $(this).attr('data-target')
    //     if ($(target).hasClass('show')) {
    //       e.preventDefault(); // to stop the page jump to the anchor target.
    //       e.stopPropagation()
    //     }
    //   })

    

     map.on('click', 'national-click-fills', function (e) {

        if (e.features.length > 0) {
            //removes previous highlight
            if (clickedStateId !== null) {
                map.setFeatureState(
                    { source: 'national', id: clickedStateId },
                    { clicked: false }
                );
            } 
            
            clickedStateId = e.features[0].id;
            map.setFeatureState(
                { source: 'national', id: clickedStateId },
                { clicked: true }
            );
            
        }
    });



    