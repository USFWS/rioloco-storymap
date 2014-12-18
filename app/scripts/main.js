'use strict';
$(function () {
  L.Icon.Default.imagePath= 'images';

  var map, imagery, labels, topo, projects, watershed, currentSlider,
      $tabs = $('.tab'),
      $map = $('#map'),
      $stats = $('#statistics'),
      $joinUs = $('#joinUs'),
      $consActions = $('#prjMap'),
      $title = $('#prjTitle'),
      $narrative = $('#prjDescription');
  
  $consActions.on('click', function () {
    projects.eachLayer(function (marker) {
      if (marker.feature.properties.Actions === 'Sustainable Practices in the Coffee Region') {
        // Hack so the map can zoom to the project extent before firing click event on first project point
        setTimeout(function() {
          marker.fire('click');
        }, 500);
      }
    });
  });

  $joinUs.on('click', function () {
    var content = '<p>At present, USCRTF members and its partners have invested more than $6.5 million as well as significant in-kind and technical assistance throughout the watershed. Over $1.1 million of that contribution is part of the Community Grants projects has been implemented to financial projects that support on-the-ground conservation activities, education and capacity building.</p>';
    
    content += '<p>To join this effort, please contact:<p>';
    content += '<ul><li>USDA-NRCS: <a href="mailto:mario.rodriguez@pr.usda.gov?Subject=Guanica%20Bay%20Rio Loco%20Watershed%20Partnership%20Initiative">Mario Rodriguez,</a> Resource Conservacionsit or visit <a href=http://www.pr.nrcs.usda.gov>pr.nrcs.usda.gov</a></li><li>NOAA: <a href="mailto:ivan_llerandi-roman@fws.gov?Subject=Guanica%20Bay%20Rio%20Loco%20Watershed%20Partnership%20Initiative">Rob Ferguson,</a> Atlantic/Caribbean Region Watershed Management Capacity Building Coordination</li><li>USFWS: <a href="mailto:ivan_llerandi-roman@fws.gov?Subject=Guanica%20Bay%20Rio Loco%20Watershed%20Partnership%20Initiative">Ivan Llerandi,</a> Caribbean Partners for Fish and Wildlife Coordinator or visit <a href=http://www.fws.gov/caribbean>fws.gov/caribbean</a></li></ul>';
    content += 'To learn more about similar USCRTF efforts in Maui and American Samoa please visit: <a href="http://www.coralreef.gov">www.coralreef.gov</a>';
    content += '<strong id="lastUpdate">Last Updated: December 2014</strong>';
    changeSlider(currentSlider, 'join-us-slider');
    currentSlider = 'join-us-slider';
    $title.html('<h1>Join the Effort</h1>');
    $narrative.html(content);
  });

  $tabs.on('click', function () {
    var $this = $(this);
    $tabs.removeClass('active');
    $this.addClass('active');

    if ($this.html() === 'Conservation Actions') {
      map.fitBounds([[17.9338, -67.0946], [18.2368, -66.7255]]);
      $map.show();
      $stats.hide();
    }
    if ($this.html() === 'About the Watershed') {
      map.fitBounds([[17.761, -67.3384],[18.6192, -65.5245]]);
      $map.show();
      $stats.hide();
    }
    if ($this.html() === 'Join the Effort') {
      $map.hide();
      $stats.show();
    }
  });

  function resizePanes(){
    var windowWidth   = $(window).width(),
        windowHeight  = $(window).height();

    $map.width(windowWidth - 600);
    $map.height(windowHeight - 120);
    $stats.width(windowWidth - 600);
    $stats.height(windowHeight - 120);

    var mapHeight = $map.height();
    $('.loading').css('top', mapHeight / 2);
    $('#infoWindow').height(mapHeight);
    $('#sidebar').height(mapHeight);
    $('#prjDescription').height(mapHeight - 530);
  }

  function createMap() {
    resizePanes();

    map = L.map('map')
      .fitBounds([
        [17.761, -67.3384],
        [18.6192, -65.5245]
      ]);
    addLayers();
    addControls();
  }

  function addControls() {
    var baseLayers = {
      'Imagery': imagery,
      'Topographic': topo
    };

    var overlays = {
      'Labels': labels,
      'Projects': projects,
      'Watershed': watershed
    };

    L.control.layers(baseLayers, overlays).addTo(map);
  }

  function addLayers() {
    var greenIcon = L.icon({
      iconUrl: 'images/marker.png',
      iconSize:     [50, 50], // size of the icon
      iconAnchor:   [25, 50], // point of the icon which will correspond to marker's location
      popupAnchor:  [-5, -50] // point from which the popup should open relative to the iconAnchor
    });
    imagery = L.esri.basemapLayer('Imagery').addTo(map);
    labels = L.esri.basemapLayer('ImageryLabels');
    topo = L.esri.basemapLayer('Topographic');
    projects = omnivore.csv('data/rioLocoSites.csv')
      .addTo(map)
      .on('ready', function () {
        projects.eachLayer(function (marker) {
          marker.bindPopup(marker.feature.properties.Actions);
          marker.setIcon(greenIcon);
        });
      })
      .on('click', function (e) {
        var props = e.layer.feature.properties;

        changeSlider(currentSlider, props.id);
        $title.html('<h1>' + props.Actions + '</h1>');
        $narrative.html('<p>' + props.Narrative + '</p><strong id="lastUpdate">Last Updated: December 2014</strong>');
      });
    watershed = L.esri.featureLayer('https://www.sciencebase.gov/arcgis/rest/services/Catalog/53c428ace4b03bbfc4d5458e/MapServer/0')
      .once('loading', function showLoader() {
        $('.loading').show();
      })
      .on('load', function hideLoader() {
        $('.loading').hide();
      })
      .on('click', function () {
        changeSlider(currentSlider, 'watershed-slider');
        $title.html('<h1>The Rio Loco Watershed</h1>');
        $narrative.html('<p>The Río Loco Watershed Project (RLWP) began in 2009 as a multiagency effort to support the USCRTF Local Action Strategies (LAS) as identified in the Guánica Bay Watershed Management Plan. NRCS work seeks to address LAS at Río Loco related to land based sources of pollution by reducing loss of coral reef cover through the promotion and application of integrated watershed and land use management practices on agricultural lands.</p><strong id="lastUpdate">Last Updated: December 2014</strong>');
      })
      .addTo(map)
      .bindPopup('The Río Loco Watershed');
  }

  function changeSlider (oldSlider, newSlider) {
    var $currentSlider = $('#' + currentSlider),
        $newSlider = $('#' + newSlider);

    $currentSlider.hide().cameraPause();
    if ($newSlider.children().hasClass('camera_fakehover')) {
      $newSlider.show().cameraResume();
    } else {
      $newSlider.show()
        .camera({
          playPause:false,
          height: '400px',
          pagination:false,
          fx: 'scrollLeft'
        });
    }
    currentSlider = newSlider;
  }

  function createCharts() {
    var contributions = {
      labels: ['USDA', 'USFWS', 'NOAA', 'EPA', 'PRDNER', '*NGO\'s & Academia', '**CRCI '],
      datasets: [
        {
          label: 'Agency Contributions',
          fillColor: 'rgba(255,133,0,1)',
          strokeColor: 'rgba(255,133,0,.5)',
          highlightFill: 'rgba(255,133,0,.5)',
          highlightStroke: 'rgba(255,133,0,.5)',
          data: [2676300, 398888, 563000, 1407000, 34500, 636141, 892241]
        }
      ]
    },
    barOptions = {
      scaleLabel: '$<%=value%>',
      scaleGridLineColor : 'rgba(255,255,255,.5)',
      scaleLineColor: 'rgba(255,255,255,.5)',
      scaleOverride: true,
      scaleSteps: 6,
      scaleStepWidth: 500000,
      scaleStartValue: 0
    };

    Chart.defaults.global.animation = false;
    Chart.defaults.global.scaleFontColor = '#fff';
    
    var ctb = $('canvas#contributions').get(0).getContext('2d');
    new Chart(ctb).Bar(contributions, barOptions);
  }

  $(window).resize( resizePanes );

  $('#watershed-slider')
    .fadeIn()
    .camera({
      playPause:false,
      height: '400px',
      pagination:false,
      fx: 'scrollLeft'
    });

  currentSlider = 'watershed-slider';

  $('#shedMap').click(function () {
    changeSlider(currentSlider, 'watershed-slider');
    $title.html('<h1>The Rio Loco Watershed</h1>');
    $narrative.html('<p>The Río Loco Watershed Project (RLWP) began in 2009 as a multiagency effort to support the USCRTF Local Action Strategies (LAS) as identified in the Guánica Bay Watershed Management Plan. NRCS work seeks to address LAS at Río Loco related to land based sources of pollution by reducing loss of coral reef cover through the promotion and application of integrated watershed and land use management practices on agricultural lands.</p><strong id="lastUpdate">Last Updated: December 2014</strong>');
  });

  $('.modal').modal();
  // setTimeout(resizePanes, 500);
  
  createMap();
  createCharts();
});