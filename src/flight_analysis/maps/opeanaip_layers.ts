export const OPENAIP_TOKEN = "33c125b3916beb39dc3835be89882a09";
export const OPENAIP_HOST = "https://api.tiles.openaip.net";
export const AIRSPACE_STYLE = `${OPENAIP_HOST}/api/styles/openaip-default-style.json`;

export const AIRSPACE_SOURCE = {
  id: "openaip-data",
  tiles: ["https://api.tiles.openaip.net/api/data/openaip/{z}/{x}/{y}.pbf"],
  type: "vector",
};

export const AIRSPACE_LAYERS = [
  {
    id: "obstacle_clicktarget",
    type: "circle",
    source: "openaip-data",
    "source-layer": "obstacles",
    minzoom: 11,
    maxzoom: 24,
    layout: {
      visibility: "visible",
    },
    paint: {
      "circle-opacity": 0,
    },
  },
  {
    id: "obstacle",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "obstacles",
    minzoom: 11,
    layout: {
      "icon-image": {
        stops: [[11, "obstacle_{type}"]],
      },
      "icon-rotation-alignment": "map",
      "icon-pitch-alignment": "map",
      "icon-allow-overlap": true,
      "text-field": {
        stops: [
          [10, "{name_label}"],
          [13, "{name_label_full}"],
        ],
      },
      "text-allow-overlap": false,
      "text-offset": {
        stops: [[11, [0, 2.5]]],
      },
      "text-size": 11,
      "text-font": ["DIN Offc Pro Regular", "Arial Unicode MS Regular"],
      "icon-ignore-placement": false,
      "text-ignore-placement": false,
      visibility: "visible",
    },
    paint: {
      "text-halo-width": 2,
      "text-color": "rgba(0, 0, 0, 1)",
      "text-halo-blur": 1,
      "text-halo-color": "rgba(255, 255, 255, 1)",
    },
  },
  {
    id: "hang_gliding_clicktarget",
    type: "circle",
    source: "openaip-data",
    "source-layer": "hangGlidings",
    minzoom: 0,
    maxzoom: 24,
    layout: {
      visibility: "visible",
    },
    paint: {
      "circle-opacity": 0,
    },
  },
  {
    id: "hang_gliding",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "hangGlidings",
    minzoom: 8,
    layout: {
      "icon-image": "hang_gliding_{type}",
      "icon-size": {
        stops: [
          [9, 0.5],
          [12, 0.8],
        ],
      },
      "icon-rotation-alignment": "auto",
      "icon-pitch-alignment": "auto",
      "text-field": {
        stops: [
          [10, "{name_label}"],
          [13, "{name_label_full}"],
        ],
      },
      "text-offset": {
        stops: [
          [10, [0, -3]],
          [12, [0, -4]],
        ],
      },
      "text-size": {
        stops: [
          [8, 9],
          [10, 10],
        ],
      },
      "symbol-placement": "point",
      "text-allow-overlap": false,
      "icon-allow-overlap": false,
      "text-optional": true,
      "text-ignore-placement": true,
      visibility: "visible",
    },
    paint: {
      "icon-opacity": {
        stops: [
          [8, 0.1],
          [9, 0.5],
          [13, 1],
        ],
      },
      "text-halo-color": "rgba(255, 255, 255, 1)",
      "text-halo-width": 1,
      "text-opacity": {
        stops: [
          [8, 0],
          [9, 0],
          [10, 1],
          [14, 1],
        ],
      },
    },
  },
  {
    id: "airport_clicktarget",
    type: "circle",
    source: "openaip-data",
    "source-layer": "airports",
    minzoom: 2,
    maxzoom: 24,
    layout: {
      visibility: "visible",
    },
    paint: {
      "circle-opacity": 0,
    },
  },
  {
    id: "airport_runway",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "airports",
    minzoom: 10,
    maxzoom: 24,
    filter: [
      "all",
      ["in", "runway_surface", "paved", "unpaved"],
      [
        "!in",
        "type",
        "ad_closed",
        "af_water",
        "heli_civil",
        "heli_mil",
        "intl_apt",
      ],
      ["!has", "icao_code"],
    ],
    layout: {
      "icon-image": {
        stops: [
          [10, "runway_{runway_surface}-small"],
          [12, "runway_{runway_surface}-medium"],
        ],
      },
      "icon-allow-overlap": true,
      "icon-rotate": {
        type: "identity",
        property: "runway_rotation",
      },
      "icon-rotation-alignment": "map",
      "icon-pitch-alignment": "map",
      "icon-padding": 0,
      visibility: "visible",
    },
    paint: {
      "icon-opacity": 1,
    },
  },
  {
    id: "airport_parachute",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "airports",
    minzoom: 8,
    maxzoom: 24,
    filter: ["all", ["==", "skydive_activity", true]],
    layout: {
      "icon-image": {
        stops: [
          [8, "parachute-small"],
          [10, "parachute-large"],
        ],
      },
      "icon-size": 1,
      "icon-allow-overlap": false,
      "icon-offset": {
        stops: [
          [8, [-20, 15]],
          [10, [-30, 20]],
          [17, [-40, 25]],
        ],
      },
      "icon-rotation-alignment": "map",
      "icon-pitch-alignment": "map",
      visibility: "visible",
    },
  },
  {
    id: "airport_gliding",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "airports",
    minzoom: 8,
    maxzoom: 24,
    filter: ["all", ["in", "type", "gliding"], ["==", "winch_only", false]],
    layout: {
      "icon-image": {
        stops: [
          [10, "{type}-small"],
          [12, "{type}-medium"],
        ],
      },
      "icon-rotation-alignment": "map",
      "icon-pitch-alignment": "map",
      "icon-size": 1,
      "text-allow-overlap": false,
      "text-ignore-placement": true,
      "icon-allow-overlap": true,
      "symbol-avoid-edges": false,
      "symbol-placement": "point",
      "text-field": {
        stops: [
          [8, "{name_label}"],
          [10, "{name_label_full}"],
        ],
      },
      "text-size": {
        stops: [
          [8, 9],
          [12, 12],
        ],
      },
      "text-offset": {
        stops: [
          [9, [0, -3.5]],
          [10, [0, -4]],
        ],
      },
      "text-optional": true,
      visibility: "visible",
    },
    paint: {
      "icon-color": "rgba(191, 45, 45, 1)",
      "text-halo-color": "rgba(255, 255, 255, 1)",
      "text-halo-width": 1,
      "text-halo-blur": 0,
      "icon-opacity": {
        stops: [
          [8, 0],
          [10, 1],
        ],
      },
      "text-opacity": {
        stops: [
          [8, 0],
          [10, 1],
        ],
      },
    },
  },
  {
    id: "airport_gliding_winch",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "airports",
    minzoom: 8,
    maxzoom: 24,
    filter: ["all", ["in", "type", "gliding"], ["==", "winch_only", true]],
    layout: {
      "icon-image": {
        stops: [
          [10, "gliding_winch-small"],
          [12, "gliding_winch-medium"],
        ],
      },
      "icon-rotation-alignment": "map",
      "icon-pitch-alignment": "map",
      "icon-size": 1,
      "icon-allow-overlap": true,
      "symbol-avoid-edges": false,
      "symbol-placement": "point",
      "text-offset": {
        stops: [
          [9, [0, -2.5]],
          [10, [0, -4]],
        ],
      },
      "text-size": {
        stops: [
          [8, 9],
          [12, 12],
        ],
      },
      "text-field": {
        stops: [
          [8, "{name_label}"],
          [10, "{name_label_full}"],
        ],
      },
      "text-allow-overlap": false,
      "text-ignore-placement": true,
      "text-optional": true,
      visibility: "visible",
    },
    paint: {
      "icon-color": "rgba(191, 45, 45, 1)",
      "text-halo-color": "rgba(255, 255, 255, 1)",
      "text-halo-width": 1,
      "text-halo-blur": 0,
      "icon-opacity": {
        stops: [
          [8, 0],
          [10, 1],
        ],
      },
      "text-opacity": {
        stops: [
          [8, 0],
          [10, 1],
        ],
      },
    },
  },
  {
    id: "airport_other",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "airports",
    minzoom: 8,
    maxzoom: 24,
    filter: [
      "all",
      ["!in", "type", "intl_apt", "gliding"],
      ["!has", "icao_code"],
    ],
    layout: {
      "icon-image": {
        stops: [
          [10, "{type}-small"],
          [17, "{type}-medium"],
        ],
      },
      "icon-rotation-alignment": "map",
      "icon-pitch-alignment": "map",
      "icon-size": 1,
      "text-allow-overlap": false,
      "text-ignore-placement": false,
      "icon-allow-overlap": true,
      "symbol-avoid-edges": false,
      "symbol-placement": "point",
      "text-field": {
        stops: [
          [8, "{name_label}"],
          [10, "{name_label_full}"],
        ],
      },
      "text-size": {
        stops: [
          [8, 9],
          [12, 12],
        ],
      },
      "text-offset": {
        stops: [
          [9, [0, -3.5]],
          [10, [0, -4]],
        ],
      },
      "icon-ignore-placement": false,
      "text-optional": true,
      visibility: "visible",
    },
    paint: {
      "icon-color": "rgba(191, 45, 45, 1)",
      "text-halo-color": "rgba(255, 255, 255, 1)",
      "text-halo-width": 1,
      "text-halo-blur": 0,
      "icon-opacity": {
        stops: [
          [8, 0],
          [10, 1],
        ],
      },
      "text-opacity": {
        stops: [
          [8, 0],
          [10, 1],
        ],
      },
    },
  },
  {
    id: "airport_with_code_runway",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "airports",
    minzoom: 9,
    maxzoom: 24,
    filter: [
      "all",
      ["in", "runway_surface", "paved", "unpaved"],
      [
        "!in",
        "type",
        "ad_closed",
        "af_water",
        "heli_civil",
        "heli_mil",
        "intl_apt",
      ],
      ["has", "icao_code"],
    ],
    layout: {
      "icon-image": {
        stops: [
          [9, "runway_{runway_surface}-medium"],
          [17, "runway_{runway_surface}-large"],
        ],
      },
      "icon-allow-overlap": true,
      "icon-rotate": {
        type: "identity",
        property: "runway_rotation",
      },
      "icon-rotation-alignment": "map",
      "icon-pitch-alignment": "map",
      "icon-padding": 0,
      "icon-size": {
        stops: [
          [9, 0.8],
          [10, 0.9],
          [15, 1],
        ],
      },
      "icon-ignore-placement": false,
      "icon-optional": false,
      visibility: "visible",
    },
  },
  {
    id: "airport_with_code",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "airports",
    minzoom: 7,
    maxzoom: 24,
    filter: ["all", ["!=", "type", "intl_apt"], ["has", "icao_code"]],
    layout: {
      "icon-image": {
        stops: [
          [7, "apt-dot"],
          [8, "{type}-small"],
          [9, "{type}-medium"],
          [17, "{type}-large"],
        ],
      },
      "icon-size": {
        stops: [
          [7, 0.3],
          [10, 1],
        ],
      },
      "icon-rotation-alignment": "map",
      "icon-pitch-alignment": "map",
      "text-allow-overlap": true,
      "text-ignore-placement": false,
      "icon-allow-overlap": true,
      "text-field": {
        stops: [
          [7, "{icao_code}"],
          [9, "{name_label_full}"],
        ],
      },
      "text-justify": "left",
      "text-anchor": "center",
      "text-offset": {
        stops: [
          [7, [0, -1.5]],
          [8, [0, -2]],
          [9, [0, -4]],
          [10, [0, -4]],
        ],
      },
      "text-size": {
        stops: [
          [7, 9],
          [8, 10],
          [10, 12],
        ],
      },
      "text-font": {
        stops: [
          [7, ["Roboto Mono Light", "Arial Unicode MS Regular"]],
          [9, ["Roboto Mono Regular", "Arial Unicode MS Regular"]],
        ],
      },
      "text-transform": "none",
      "text-padding": 2,
      "icon-ignore-placement": false,
      visibility: "visible",
    },
    paint: {
      "icon-color": "rgba(191, 45, 45, 1)",
      "text-halo-color": "rgba(255, 255, 255, 1)",
      "text-halo-width": 2,
      "text-halo-blur": 1,
      "icon-opacity": 1,
      "text-opacity": {
        stops: [
          [7, 0],
          [8, 1],
        ],
      },
    },
  },
  {
    id: "airport_runway_intl",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "airports",
    minzoom: 8,
    maxzoom: 24,
    filter: [
      "all",
      ["in", "runway_surface", "paved", "unpaved"],
      ["==", "type", "intl_apt"],
    ],
    layout: {
      "icon-image": {
        stops: [
          [7, "runway_{runway_surface}-small"],
          [8, "runway_{runway_surface}-medium"],
          [17, "runway_{runway_surface}-large"],
        ],
      },
      "icon-allow-overlap": true,
      "icon-rotate": {
        type: "identity",
        property: "runway_rotation",
      },
      "icon-rotation-alignment": "map",
      "icon-pitch-alignment": "map",
      "icon-padding": 0,
      "icon-size": 1,
      "text-allow-overlap": false,
      visibility: "visible",
    },
  },
  {
    id: "airport_intl",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "airports",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "intl_apt"]],
    layout: {
      "icon-image": {
        stops: [
          [5, "apt-dot"],
          [6, "apt-tiny"],
          [8, "apt-medium"],
        ],
      },
      "icon-size": {
        stops: [
          [3, 0.1],
          [5, 0.4],
          [8, 1],
        ],
      },
      "icon-rotation-alignment": "map",
      "icon-pitch-alignment": "map",
      "text-allow-overlap": true,
      "text-ignore-placement": false,
      "icon-allow-overlap": true,
      "text-field": {
        stops: [
          [6, "{icao_code}"],
          [8, "{name_label_full}"],
        ],
      },
      "text-justify": "left",
      "text-anchor": "center",
      "text-offset": {
        stops: [
          [7, [0, -2]],
          [8, [0, -4]],
          [10, [0, -5]],
        ],
      },
      "text-size": {
        stops: [
          [3, 0],
          [4, 5],
          [6, 12],
        ],
      },
      "text-font": ["Roboto Mono Regular", "Arial Unicode MS Bold"],
      "text-transform": "none",
      "icon-ignore-placement": false,
      "icon-optional": false,
      visibility: "visible",
    },
    paint: {
      "icon-color": "rgba(191, 45, 45, 1)",
      "text-halo-color": "rgba(255, 255, 255, 1)",
      "text-halo-width": 2,
      "text-halo-blur": 1,
      "icon-opacity": 1,
      "text-opacity": {
        stops: [
          [3, 0],
          [4, 0.5],
          [6, 1],
        ],
      },
    },
  },
  {
    id: "navaid_clicktarget",
    type: "circle",
    source: "openaip-data",
    "source-layer": "navaids",
    minzoom: 6,
    maxzoom: 24,
    layout: {
      visibility: "visible",
    },
    paint: {
      "circle-opacity": 0,
    },
  },
  {
    id: "navaid_other",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "navaids",
    minzoom: 6,
    filter: ["all", ["!in", "type", "ndb"]],
    layout: {
      "icon-image": {
        stops: [
          [6, "navaid_{type}-small"],
          [8, "navaid_{type}-medium"],
        ],
      },
      "icon-rotation-alignment": "map",
      "icon-pitch-alignment": "map",
      "icon-allow-overlap": true,
      "text-field": {
        stops: [
          [6, "{identifier}"],
          [9, "{name_label_full}"],
        ],
      },
      "text-allow-overlap": true,
      "text-offset": {
        stops: [
          [6, [0, 1.2]],
          [8, [0, 1.8]],
          [10, [0, 2.5]],
        ],
      },
      "text-size": 12,
      "text-font": ["DIN Offc Pro Regular", "Arial Unicode MS Regular"],
      "icon-ignore-placement": false,
      "text-ignore-placement": true,
      visibility: "visible",
    },
    paint: {
      "text-halo-width": 2,
      "text-color": "rgba(0, 0, 0, 1)",
      "text-halo-blur": 1,
      "text-halo-color": "rgba(255, 255, 255, 1)",
    },
  },
  {
    id: "navaid_ndb",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "navaids",
    minzoom: 6,
    filter: ["all", ["==", "type", "ndb"]],
    layout: {
      "icon-image": {
        stops: [
          [6, "navaid_{type}-small"],
          [10, "navaid_{type}-medium"],
        ],
      },
      "icon-rotation-alignment": "map",
      "icon-pitch-alignment": "map",
      "text-field": {
        stops: [
          [6, "{identifier}"],
          [9, "{name_label_full}"],
        ],
      },
      "symbol-placement": "point",
      "text-size": 12,
      "text-font": ["DIN Offc Pro Regular", "Arial Unicode MS Regular"],
      "text-justify": "left",
      "text-allow-overlap": true,
      "text-ignore-placement": true,
      "icon-allow-overlap": true,
      "icon-ignore-placement": false,
      "icon-optional": false,
      visibility: "visible",
    },
    paint: {
      "icon-opacity": {
        stops: [
          [6, 0.5],
          [10, 1],
        ],
      },
      "text-halo-color": "rgba(255, 255, 255, 1)",
      "text-halo-width": 1,
      "text-translate-anchor": "map",
      "text-translate": {
        stops: [
          [6, [0, -20]],
          [9, [0, -25]],
          [10, [0, -35]],
        ],
      },
      "icon-halo-color": "rgba(255, 255, 255, 1)",
      "icon-halo-width": 2,
      "icon-halo-blur": 1,
    },
  },
  {
    id: "navaid_beam_rose",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "navaids",
    minzoom: 6,
    filter: ["all", ["!in", "type", "dme", "tacan", "ndb"]],
    layout: {
      "icon-image": "navaid_rose-medium",
      "icon-allow-overlap": true,
      "icon-rotate": {
        type: "identity",
        property: "icon_rotation",
      },
      "icon-rotation-alignment": "map",
      "icon-pitch-alignment": "map",
      "text-allow-overlap": true,
      "text-ignore-placement": true,
      "icon-ignore-placement": true,
      "icon-optional": false,
      visibility: "visible",
    },
    paint: {
      "icon-opacity": {
        stops: [
          [6, 0],
          [10, 1],
        ],
      },
    },
  },
  {
    id: "hotspot_clicktarget",
    type: "circle",
    source: "openaip-data",
    "source-layer": "hotspots",
    minzoom: 0,
    maxzoom: 24,
    layout: {
      visibility: "none",
    },
    paint: {
      "circle-opacity": 0,
    },
  },
  {
    id: "hotspot_cloud",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "hotspots",
    minzoom: 8,
    layout: {
      "icon-image": {
        stops: [
          [8, "hotspot_{reliability}-small"],
          [11, "hotspot_{reliability}-medium"],
          [13, "hotspot_{reliability}-large"],
        ],
      },
      "icon-rotation-alignment": "auto",
      "icon-pitch-alignment": "auto",
      "text-field": {
        stops: [
          [10, "{name_label}"],
          [13, "{name_label_full}"],
        ],
      },
      "text-offset": {
        stops: [
          [10, [0, -2.2]],
          [12, [0, -3]],
          [13, [0, -6]],
        ],
      },
      "text-size": {
        stops: [
          [9, 11],
          [10, 12],
        ],
      },
      "symbol-placement": "point",
      "text-allow-overlap": true,
      "icon-allow-overlap": true,
      "text-optional": true,
      "text-ignore-placement": true,
      visibility: "none",
    },
    paint: {
      "icon-opacity": {
        stops: [
          [8, 0.1],
          [9, 0.5],
          [13, 1],
        ],
      },
      "text-halo-color": "rgba(255, 255, 255, 1)",
      "text-halo-width": 1,
      "text-opacity": {
        stops: [
          [8, 0],
          [9, 0],
          [10, 1],
          [14, 1],
        ],
      },
    },
  },
  {
    id: "hotspot_industrial",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "hotspots",
    minzoom: 13,
    filter: ["all", ["==", "type", "artificial"]],
    layout: {
      "icon-allow-overlap": true,
      "icon-image": "hotspot_industrial",
      "icon-offset": [0, 55],
      "icon-rotation-alignment": "auto",
      "icon-pitch-alignment": "auto",
      visibility: "none",
    },
  },
  {
    id: "airspace_clicktarget",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 5,
    maxzoom: 24,
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-opacity": 0,
      "fill-color": "rgba(0, 0, 0, 0)",
    },
  },
  {
    id: "airspace_tsa_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "tsa"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(154, 14, 14, 1)"]],
      },
      "line-width": {
        stops: [
          [3, 0.1],
          [10, 2],
        ],
      },
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 0.3],
        ],
      },
    },
  },
  {
    id: "airspace_tra_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "tra"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(154, 14, 14, 1)"]],
      },
      "line-width": {
        stops: [
          [3, 0.1],
          [10, 2],
        ],
      },
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 0.3],
        ],
      },
      "line-dasharray": {
        stops: [
          [0, [3, 1]],
          [3, [5, 2]],
          [12, [12, 4]],
        ],
      },
    },
  },
  {
    id: "airspace_tra_tsa_offset",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces_border_offset",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["in", "type", "tra", "tsa"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": "rgba(154, 14, 14, 1)",
      "fill-opacity": {
        stops: [
          [3, 0],
          [7, 0.3],
        ],
      },
      "fill-outline-color": "rgba(154, 14, 14, 0)",
      "fill-pattern": {
        stops: [
          [0, "diagonal_lines_red-2"],
          [8, "diagonal_lines_red-3"],
          [10, "diagonal_lines_red-6"],
        ],
      },
    },
  },
  {
    id: "airspace_rdp_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["in", "type", "restricted", "danger", "prohibited"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(154, 14, 14, 1)"]],
      },
      "line-width": {
        stops: [
          [3, 0.1],
          [10, 2],
        ],
      },
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 1],
        ],
      },
    },
  },
  {
    id: "airspace_rdp_offset",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces_border_offset",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["in", "type", "restricted", "danger", "prohibited"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": "rgba(154, 14, 14, 1)",
      "fill-opacity": {
        stops: [
          [3, 0],
          [7, 1],
        ],
      },
      "fill-outline-color": "rgba(154, 14, 14, 0)",
      "fill-pattern": {
        stops: [
          [0, "diagonal_lines_red-2"],
          [8, "diagonal_lines_red-3"],
          [10, "diagonal_lines_red-6"],
        ],
      },
    },
  },
  {
    id: "airspace_cd_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "other"], ["in", "icao_class", "c", "d"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(51, 158, 47, 1)"]],
      },
      "line-width": {
        stops: [
          [3, 0.1],
          [10, 2],
        ],
      },
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 1],
        ],
      },
    },
  },
  {
    id: "airspace_cd_offset",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces_border_offset_2x",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "other"], ["in", "icao_class", "c", "d"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-opacity": {
        stops: [
          [3, 0],
          [7, 1],
        ],
      },
      "fill-outline-color": "rgba(154, 14, 14, 0)",
      "fill-pattern": {
        stops: [
          [0, "diagonal_lines_green-2"],
          [8, "diagonal_lines_green-3"],
          [10, "diagonal_lines_green-6"],
        ],
      },
    },
  },
  {
    id: "airspace_ab_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "other"], ["in", "icao_class", "a", "b"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(51, 158, 47, 1)"]],
      },
      "line-width": {
        stops: [
          [3, 0.1],
          [10, 2],
        ],
      },
      "line-dasharray": [5],
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 0.5],
        ],
      },
    },
  },
  {
    id: "airspace_ab_offset",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces_border_offset_2x",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "other"], ["in", "icao_class", "a", "b"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": "rgba(51, 158, 47, 0.5)",
      "fill-opacity": {
        stops: [
          [3, 0],
          [7, 0.2],
        ],
      },
      "fill-outline-color": "rgba(118, 145, 195, 0)",
    },
  },
  {
    id: "airspace_e_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "other"], ["==", "icao_class", "e"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(21, 77, 154, 1)"]],
      },
      "line-width": {
        stops: [
          [3, 0.1],
          [10, 2],
        ],
      },
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 1],
        ],
      },
    },
  },
  {
    id: "airspace_f_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "other"], ["==", "icao_class", "f"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(21, 77, 154, 1)"]],
      },
      "line-width": {
        stops: [
          [3, 0.2],
          [10, 4],
        ],
      },
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 1],
        ],
      },
    },
  },
  {
    id: "airspace_f_offset",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces_border_offset_2x",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "other"], ["==", "icao_class", "f"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": "rgba(118, 145, 195, 1)",
      "fill-opacity": {
        stops: [
          [3, 0],
          [7, 0.5],
        ],
      },
      "fill-outline-color": "rgba(118, 145, 195, 0)",
    },
  },
  {
    id: "airspace_g_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "other"], ["==", "icao_class", "g"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(21, 77, 154, 0.5)"]],
      },
      "line-width": {
        stops: [
          [3, 0.1],
          [10, 2],
        ],
      },
      "line-dasharray": [5],
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 1],
        ],
      },
    },
  },
  {
    id: "airspace_g_offset",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces_border_offset_2x",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "other"], ["==", "icao_class", "g"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": "rgba(118, 145, 195, 0.2)",
      "fill-opacity": {
        stops: [
          [3, 0],
          [7, 0.5],
        ],
      },
      "fill-outline-color": "rgba(118, 145, 195, 0)",
    },
  },
  {
    id: "airspace_ctr_fill",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "ctr"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": "rgba(218, 111, 134, 1)",
      "fill-opacity": {
        stops: [
          [3, 0],
          [7, 0.2],
        ],
      },
    },
  },
  {
    id: "airspace_ctr_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "ctr"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(21, 77, 154, 1)"]],
      },
      "line-width": {
        stops: [
          [8, 1],
          [12, 3],
        ],
      },
      "line-dasharray": {
        stops: [
          [0, [3, 1]],
          [3, [5, 2]],
          [12, [12, 4]],
        ],
      },
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 1],
        ],
      },
    },
  },
  {
    id: "airspace_tmz_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "tmz"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(21, 77, 154, 1)"]],
      },
      "line-width": {
        stops: [
          [3, 0.1],
          [8, 2],
          [10, 4],
          [14, 10],
        ],
      },
      "line-dasharray": {
        stops: [
          [3, [5, 5]],
          [10, [10, 10]],
        ],
      },
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 1],
        ],
      },
    },
  },
  {
    id: "airspace_tmz_border_dot",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "tmz"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(21, 77, 154, 1)"]],
      },
      "line-width": {
        stops: [
          [3, 0.1],
          [8, 2],
          [10, 4],
          [14, 10],
        ],
      },
      "line-dasharray": {
        stops: [
          [3, [1.25, 2.5]],
          [10, [2, 5]],
        ],
      },
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 1],
        ],
      },
    },
  },
  {
    id: "airspace_rmz_tiz_tia_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["in", "type", "rmz", "tiz", "tia"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(21, 77, 154, 1)"]],
      },
      "line-width": {
        stops: [
          [3, 0.1],
          [14, 2],
        ],
      },
      "line-dasharray": [1, 1],
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 0.5],
        ],
      },
    },
  },
  {
    id: "airspace_rmz_tiz_tia_fill",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["in", "type", "rmz", "tiz", "tia"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-opacity": {
        stops: [
          [3, 0],
          [7, 0.1],
        ],
      },
      "fill-color": "rgba(101, 134, 175, 1)",
    },
  },
  {
    id: "airspace_trp_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "trp"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(21, 77, 154, 1)"]],
      },
      "line-width": {
        stops: [
          [3, 0.1],
          [8, 2],
          [10, 4],
          [14, 10],
        ],
      },
      "line-dasharray": {
        stops: [
          [3, [1, 1]],
          [10, [2, 2]],
        ],
      },
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 1],
        ],
      },
    },
  },
  {
    id: "airspace_tma_cta_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["in", "type", "tma", "cta"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(21, 77, 154, 1)"]],
      },
      "line-width": {
        stops: [
          [3, 0.1],
          [10, 2],
        ],
      },
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 1],
        ],
      },
    },
  },
  {
    id: "airspace_tma_cta_offset",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces_border_offset",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["in", "type", "tma", "cta"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": "rgba(218, 111, 134, 1)",
      "fill-opacity": {
        stops: [
          [3, 0],
          [7, 0.2],
        ],
      },
      "fill-outline-color": "rgba(218, 111, 134, 0)",
    },
  },
  {
    id: "airspace_fir_acc_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["in", "type", "fir", "acc"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(110, 201, 32, 0.4)"]],
      },
      "line-width": {
        stops: [
          [8, 2],
          [10, 4],
          [11, 6],
        ],
      },
      "line-opacity": 0.8,
      "line-dasharray": {
        stops: [
          [8, [5, 2.5]],
          [12, [10, 5]],
        ],
      },
    },
  },
  {
    id: "airspace_uir_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "uir"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(91, 156, 38, 0.4)"]],
      },
      "line-width": {
        stops: [
          [8, 2],
          [10, 4],
          [11, 6],
        ],
      },
      "line-opacity": 0.8,
      "line-dasharray": {
        stops: [
          [8, [5, 2.5]],
          [12, [10, 5]],
        ],
      },
    },
  },
  {
    id: "airspace_ways_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["in", "type", "awy"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(87, 87, 87, 1)"]],
      },
      "line-width": {
        stops: [
          [3, 0.1],
          [10, 0.5],
        ],
      },
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 0.2],
        ],
      },
    },
  },
  {
    id: "airspace_ways_offset",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces_border_offset",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["in", "type", "awy"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": "rgba(87, 87, 87, 1)",
      "fill-opacity": {
        stops: [
          [3, 0],
          [7, 0.2],
        ],
      },
      "fill-outline-color": "rgba(87, 87, 87, 0)",
      "fill-pattern": {
        stops: [
          [0, "diagonal_lines_gray-2"],
          [8, "diagonal_lines_gray-3"],
          [10, "diagonal_lines_gray-6"],
        ],
      },
    },
  },
  {
    id: "airspace_ways_fill",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["in", "type", "awy"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": "rgba(206, 206, 206, 1)",
      "fill-opacity": {
        stops: [
          [3, 0],
          [7, 0.1],
        ],
      },
    },
  },
  {
    id: "airspace_moa_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["in", "type", "mtr", "mta"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(255,146,0, 1)"]],
      },
      "line-width": {
        stops: [
          [3, 0.3],
          [10, 2],
        ],
      },
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 0.6],
        ],
      },
      "line-dasharray": {
        stops: [
          [3, [2, 2]],
          [10, [2, 2]],
        ],
      },
    },
  },
  {
    id: "airspace_moa_fill",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["in", "type", "mtr", "mta"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": "rgb(255,146,0)",
      "fill-opacity": {
        stops: [
          [3, 0],
          [7, 0.05],
        ],
      },
      "fill-outline-color": "rgb(255,146,0)",
    },
  },
  {
    id: "airspace_traffic_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["in", "type", "matz", "atz", "htz"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(21, 77, 154, 1)"]],
      },
      "line-width": {
        stops: [
          [3, 0.1],
          [10, 0.5],
        ],
      },
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 0.3],
        ],
      },
    },
  },
  {
    id: "airspace_traffic_offset",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces_border_offset",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["in", "type", "matz", "atz", "htz"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": "rgba(21, 77, 154, 1)",
      "fill-opacity": {
        stops: [
          [3, 0],
          [7, 0.3],
        ],
      },
      "fill-outline-color": "rgba(21, 77, 154, 0)",
      "fill-pattern": {
        stops: [
          [0, "diagonal_lines_blue-2"],
          [8, "diagonal_lines_blue-3"],
          [10, "diagonal_lines_blue-6"],
        ],
      },
    },
  },
  {
    id: "airspace_alwapro_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["in", "type", "alert", "warning", "protected"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgb(147,53,201)"]],
      },
      "line-width": {
        stops: [
          [3, 0.1],
          [10, 2],
        ],
      },
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 0.4],
        ],
      },
      "line-dasharray": {
        stops: [
          [0, [3, 1]],
          [3, [5, 2]],
          [12, [12, 4]],
        ],
      },
    },
  },
  {
    id: "airspace_alwapro_fill",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["in", "type", "alert", "warning", "protected"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": "rgb(147,53,201)",
      "fill-opacity": {
        stops: [
          [3, 0],
          [7, 0.1],
        ],
      },
      "fill-outline-color": "rgb(21, 77, 154)",
    },
  },
  {
    id: "airspace_adiz_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "adiz"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(86, 0, 150, 1)"]],
      },
      "line-width": {
        stops: [
          [3, 2],
          [10, 4],
        ],
      },
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 1],
        ],
      },
    },
  },
  {
    id: "airspace_adiz_offset",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces_border_offset_2x",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "adiz"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": "rgba(122, 0, 150, 1)",
      "fill-opacity": {
        stops: [
          [3, 0],
          [7, 0.2],
        ],
      },
      "fill-outline-color": "rgba(142, 0, 181, 0)",
    },
  },
  {
    id: "airspace_gliding_sector_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "gliding_sector"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgba(255, 215, 0, 1)"]],
      },
      "line-width": 1,
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 1],
        ],
      },
    },
  },
  {
    id: "airspace_gliding_sector",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "gliding_sector"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": "rgba(255, 215, 0, 0.8)",
      "fill-opacity": {
        stops: [
          [3, 0],
          [7, 0.1],
        ],
      },
      "fill-outline-color": "rgba(255, 215, 0, 0)",
    },
  },
  {
    id: "airspace_aerial_sporting_recreational_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "aerial_sporting_recreational"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgb(0,139,175)"]],
      },
      "line-width": {
        stops: [
          [3, 0.1],
          [10, 2],
        ],
      },
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 1],
        ],
      },
    },
  },
  {
    id: "airspace_aerial_sporting_recreational_offset",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces_border_offset",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "aerial_sporting_recreational"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": "rgb(0,139,175)",
      "fill-opacity": {
        stops: [
          [3, 0],
          [7, 1],
        ],
      },
      "fill-outline-color": "rgba(154, 14, 14, 0)",
      "fill-pattern": {
        stops: [
          [0, "diagonal_lines_blue-2"],
          [8, "diagonal_lines_blue-3"],
          [10, "diagonal_lines_blue-6"],
        ],
      },
    },
  },
  {
    id: "airspace_overflight_restriction_border",
    type: "line",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "overflight_restriction"]],
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": {
        stops: [[0, "rgb(119,21,154)"]],
      },
      "line-width": {
        stops: [
          [3, 0.05],
          [10, 3],
        ],
      },
      "line-opacity": {
        stops: [
          [3, 0],
          [7, 1],
        ],
      },
    },
  },
  {
    id: "airspace_overflight_restriction_symbol",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 3,
    maxzoom: 24,
    filter: ["all", ["==", "type", "overflight_restriction"]],
    layout: {
      "icon-image": "vertical_line_purple",
      "icon-allow-overlap": true,
      "icon-anchor": "top",
      "icon-size": {
        stops: [
          [7, 0.05],
          [18, 0.4],
        ],
      },
      "symbol-spacing": 30,
      "symbol-avoid-edges": true,
      "symbol-placement": "line",
      visibility: "visible",
    },
  },
  {
    id: "airspace_label_full",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 9,
    maxzoom: 24,
    filter: ["all"],
    layout: {
      "symbol-placement": "line",
      "text-field": "{name_label_full}",
      "symbol-spacing": 800,
      "text-optional": true,
      "text-size": {
        stops: [
          [9, 10],
          [10, 12],
        ],
      },
      "text-allow-overlap": false,
      "text-ignore-placement": false,
      "symbol-avoid-edges": true,
      "text-anchor": "center",
      "text-offset": [0, 1],
      "text-justify": "center",
      visibility: "visible",
    },
    paint: {
      "text-halo-width": 20,
      "text-halo-color": "rgba(193, 231, 255, 1)",
      "text-color": "rgba(27, 30, 94, 1)",
      "text-halo-blur": 0,
      "icon-halo-width": 0,
    },
  },
  {
    id: "airspace_label",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "airspaces",
    minzoom: 8,
    maxzoom: 9,
    filter: ["all"],
    layout: {
      "symbol-placement": "line",
      "text-field": "{name_label}",
      "symbol-spacing": 800,
      "text-optional": true,
      "text-size": 9,
      "text-allow-overlap": false,
      "text-ignore-placement": false,
      "symbol-avoid-edges": true,
      "text-anchor": "center",
      "text-offset": [0, 1],
      "text-justify": "center",
      visibility: "visible",
    },
    paint: {
      "text-halo-width": 20,
      "text-halo-color": "rgba(193, 231, 255, 1)",
      "text-color": "rgba(27, 30, 94, 1)",
      "text-halo-blur": 0,
      "icon-halo-width": 0,
    },
  },
  {
    id: "reporting_point_clicktarget",
    type: "circle",
    source: "openaip-data",
    "source-layer": "reporting_points",
    minzoom: 10,
    maxzoom: 24,
    layout: {
      visibility: "visible",
    },
    paint: {
      "circle-opacity": 0,
    },
  },
  {
    id: "reporting_point",
    type: "symbol",
    source: "openaip-data",
    "source-layer": "reporting_points",
    minzoom: 10,
    layout: {
      "icon-image": {
        stops: [[11, "reporting_point_{type}-medium"]],
      },
      "icon-rotation-alignment": "map",
      "icon-pitch-alignment": "map",
      "icon-allow-overlap": true,
      "text-field": {
        stops: [[11, "{name}"]],
      },
      "text-allow-overlap": true,
      "text-offset": {
        stops: [[11, [0, 2.5]]],
      },
      "text-size": 12,
      "text-font": ["DIN Offc Pro Regular", "Arial Unicode MS Regular"],
      "icon-ignore-placement": false,
      "text-ignore-placement": true,
      visibility: "visible",
    },
    paint: {
      "text-halo-width": 2,
      "text-color": "rgba(0, 0, 0, 1)",
      "text-halo-blur": 1,
      "text-halo-color": "rgba(255, 255, 255, 1)",
    },
  },
  {
    id: "highlighted-airspaces",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces",
    filter: ["in", ["get", "source_id"], ["literal", []]],
    paint: {
      "fill-color": "#ff0099",
      "fill-opacity": 0.1,
    },
  },
  {
    id: "highlighted-airports",
    type: "circle",
    source: "openaip-data",
    "source-layer": "airports",
    filter: ["in", ["get", "source_id"], ["literal", []]],
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        0,
        7,
        1,
        10,
        20,
        22,
        25,
      ],
      "circle-stroke-color": "#ad0067",
      "circle-stroke-opacity": 0.7,
      "circle-stroke-width": 1,
      "circle-opacity": 0.5,
      "circle-color": "#ff0099",
    },
  },
  {
    id: "highlighted-navaids",
    type: "circle",
    source: "openaip-data",
    "source-layer": "navaids",
    filter: ["in", ["get", "source_id"], ["literal", []]],
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        0,
        7,
        1,
        10,
        20,
        22,
        25,
      ],
      "circle-stroke-color": "#ad0067",
      "circle-stroke-opacity": 0.7,
      "circle-stroke-width": 1,
      "circle-opacity": 0.5,
      "circle-color": "#ff0099",
    },
  },
  {
    id: "highlighted-hotspots",
    type: "circle",
    source: "openaip-data",
    "source-layer": "hotspots",
    filter: ["in", ["get", "source_id"], ["literal", []]],
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        0,
        7,
        1,
        10,
        20,
        22,
        25,
      ],
      "circle-stroke-color": "#ad0067",
      "circle-stroke-opacity": 0.7,
      "circle-stroke-width": 1,
      "circle-opacity": 0.5,
      "circle-color": "#ff0099",
    },
  },
  {
    id: "highlighted-reporting-points",
    type: "circle",
    source: "openaip-data",
    "source-layer": "reporting_points",
    filter: ["in", ["get", "source_id"], ["literal", []]],
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        0,
        7,
        1,
        10,
        20,
        22,
        25,
      ],
      "circle-stroke-color": "#ad0067",
      "circle-stroke-opacity": 0.7,
      "circle-stroke-width": 1,
      "circle-opacity": 0.5,
      "circle-color": "#ff0099",
    },
  },
  {
    id: "highlighted-obstacles",
    type: "circle",
    source: "openaip-data",
    "source-layer": "obstacles",
    filter: ["in", ["get", "source_id"], ["literal", []]],
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        0,
        7,
        1,
        10,
        20,
        22,
        25,
      ],
      "circle-stroke-color": "#ad0067",
      "circle-stroke-opacity": 0.7,
      "circle-stroke-width": 1,
      "circle-opacity": 0.5,
      "circle-color": "#ff0099",
    },
  },
  {
    id: "highlighted-hang-glidings",
    type: "circle",
    source: "openaip-data",
    "source-layer": "hangGlidings",
    filter: ["in", ["get", "source_id"], ["literal", []]],
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        0,
        7,
        1,
        10,
        20,
        22,
        25,
      ],
      "circle-stroke-color": "#ad0067",
      "circle-stroke-opacity": 0.7,
      "circle-stroke-width": 1,
      "circle-opacity": 0.5,
      "circle-color": "#ff0099",
    },
  },
  {
    id: "selected-airspace",
    type: "fill",
    source: "openaip-data",
    "source-layer": "airspaces",
    filter: ["in", "source_id", ""],
    paint: {
      "fill-color": "#2973f8",
      "fill-opacity": 0.4,
    },
  },
  {
    id: "selected-navaid",
    type: "circle",
    source: "openaip-data",
    "source-layer": "navaids",
    filter: ["in", "source_id", ""],
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        0,
        7,
        1,
        10,
        20,
        22,
        25,
      ],
      "circle-stroke-color": "#0741a2",
      "circle-stroke-opacity": 0.7,
      "circle-stroke-width": 1,
      "circle-opacity": 0.5,
      "circle-color": "#2973f8",
    },
  },
  {
    id: "selected-airport",
    type: "circle",
    source: "openaip-data",
    "source-layer": "airports",
    filter: ["in", "source_id", ""],
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        0,
        7,
        1,
        10,
        20,
        22,
        25,
      ],
      "circle-stroke-color": "#0741a2",
      "circle-stroke-opacity": 0.7,
      "circle-stroke-width": 1,
      "circle-opacity": 0.5,
      "circle-color": "#2973f8",
    },
  },
  {
    id: "selected-hotspot",
    type: "circle",
    source: "openaip-data",
    "source-layer": "hotspots",
    filter: ["in", "source_id", ""],
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        0,
        7,
        1,
        10,
        20,
        22,
        25,
      ],
      "circle-stroke-color": "#0741a2",
      "circle-stroke-opacity": 0.7,
      "circle-stroke-width": 1,
      "circle-opacity": 0.5,
      "circle-color": "#2973f8",
    },
  },
  {
    id: "selected-hang-gliding",
    type: "circle",
    source: "openaip-data",
    "source-layer": "hangGlidings",
    filter: ["in", "source_id", ""],
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        0,
        7,
        1,
        10,
        20,
        22,
        25,
      ],
      "circle-stroke-color": "#0741a2",
      "circle-stroke-opacity": 0.7,
      "circle-stroke-width": 1,
      "circle-opacity": 0.5,
      "circle-color": "#2973f8",
    },
  },
];
