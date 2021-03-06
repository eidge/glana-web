import { defaults as interactionDefaults } from "ol/interaction";
import OlMap from "ol/Map";
import View, { AnimationOptions } from "ol/View";
import TileLayer from "ol/layer/Tile";
import TileImage from "ol/source/XYZ";
import { extentUnion, positionToOlPoint } from "./utils";
import Position from "glana/src/flight_computer/position";
import { Coordinate } from "ol/coordinate";
import { createEmpty, extend, Extent } from "ol/extent";
import XYZ from "ol/source/XYZ";
import Attribution from "ol/control/Attribution";

const ANIMATION_DURATION = 400;
const MINIMUM_USABLE_SIZE_IN_PX = 200;
const MAPBOX_ATTRIBUTION = `
  <div class="gl-attribution-container">
    <div>
      © <a href="https://www.mapbox.com/about/maps/">Mapbox</a>
      © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>
      <a href="https://www.mapbox.com/map-feedback/" target="_blank">
        Improve this map
      </a>
    </div>
    <div>
      <a href="http://mapbox.com/about/maps" target="_blank">
        <div class="mapbox-logo"></div>
      </a>
    </div>
  </div>
`;

interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export default class MapRenderer {
  private domElement: HTMLElement;
  private padding: Padding;
  private airspaceLayer!: TileLayer;
  private weatherLayer!: TileLayer;
  private resizeObserver: ResizeObserver;

  readonly olApi = require("ol");
  readonly olMap: OlMap;

  usableClientRect!: DOMRect;
  mapClientRect!: DOMRect;

  constructor(domElement: HTMLElement, padding: Padding) {
    this.domElement = domElement;
    this.padding = Object.assign({}, padding);
    this.olMap = this.buildMap();
    this.olMap.setTarget(this.domElement);
    this.resizeObserver = new ResizeObserver(this.resizeCallback.bind(this));
    this.resizeObserver.observe(domElement);
    this.calculateClientRects();
  }

  render() {}

  setAirspaceVisibility(visible: boolean) {
    this.airspaceLayer.setVisible(visible);
  }

  setCloudLayer(date: Date | null) {
    this.weatherLayer && this.olMap.removeLayer(this.weatherLayer);
    if (!date) return;

    this.weatherLayer = this.buildWeatherLayer(date);
    this.olMap.addLayer(this.weatherLayer);
  }

  isVisible(position: Position) {
    let coordinate = positionToOlPoint(position);
    let positionXY = this.olMap.getPixelFromCoordinate(coordinate);
    if (!positionXY) return true;

    return (
      positionXY[0] >= this.usableClientRect.left &&
      positionXY[1] >= this.usableClientRect.top &&
      positionXY[0] <= this.usableClientRect.right &&
      positionXY[1] <= this.usableClientRect.bottom
    );
  }

  centerOn(position: Position) {
    const coordinate = positionToOlPoint(position);
    const offsetCoordinate = this.offsetForUsableCenter(coordinate);

    this.olMap.getView().animate({
      center: offsetCoordinate,
      duration: ANIMATION_DURATION
    });
  }

  zoomIn(position?: Position) {
    let options: AnimationOptions = {
      zoom: this.olMap.getView().getZoom()! + 1,
      duration: ANIMATION_DURATION
    };

    if (position) {
      const coordinate = positionToOlPoint(position);
      options.center = this.offsetForUsableCenter(coordinate);
    }

    this.olMap.getView().animate(options);
  }

  zoomOut() {
    this.olMap.getView().animate({
      zoom: this.olMap.getView().getZoom()! - 1,
      duration: ANIMATION_DURATION
    });
  }

  zoomToFit(...extents: Extent[]) {
    let extent = extentUnion(...extents);

    if (extents.length < 1) {
      extent = this.visibleExtent();
    }

    if (extent[0] === Infinity) return;

    this.olMap.getView().fit(extent, {
      padding: [
        this.padding.top + 5,
        this.padding.right + 5,
        this.padding.bottom + 5,
        this.padding.left + 5
      ],
      duration: ANIMATION_DURATION
    });
  }

  private visibleExtent() {
    return this.getLayers().reduce(
      (extent, layer) => extend(extent, layer.getSource().getExtent()),
      createEmpty()
    );
  }

  private getLayers(): any[] {
    return this.olMap
      .getLayers()
      .getArray()
      .filter((layer: any) => !this.isTileLayer(layer));
  }

  private isTileLayer(layer: any) {
    return layer instanceof TileLayer;
  }

  destroy() {
    this.olMap.dispose();
    this.resizeObserver.unobserve(this.domElement);
  }

  private buildMap() {
    const interactions = interactionDefaults({
      altShiftDragRotate: false,
      pinchRotate: false
    });

    this.airspaceLayer = this.buildAirspaceLayer();

    return new OlMap({
      controls: [
        new Attribution({ collapsible: false, className: "gl-attribution" })
      ],
      interactions: interactions,
      layers: [this.buildMapLayer(), this.airspaceLayer],
      view: new View({
        center: [0, 0],
        zoom: 0
      })
    });
  }

  private buildMapLayer() {
    return new TileLayer({
      preload: Infinity,
      source: new XYZ({
        url:
          "https://api.mapbox.com/styles/v1/eidge/ckbtv1rde19ee1iqsvymt93ak/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZWlkZ2UiLCJhIjoiNjVmYTRkMWY0NzM0NDdhZThmYmY4MzI2ZjU2Njg5NTIifQ.7IevRmRnToydZ2fJMGLZRQ",
        tilePixelRatio: 2,
        attributions: MAPBOX_ATTRIBUTION
      })
    });
  }

  private buildAirspaceLayer() {
    return new TileLayer({
      visible: false,
      preload: Infinity,
      source: new TileImage({
        url:
          "https://{1-2}.tile.maps.openaip.net/geowebcache/service/tms/1.0.0/openaip_basemap@EPSG%3A900913@png/{z}/{x}/{-y}.png",
        projection: "EPSG:900913"
      }),
      opacity: 0.4,
      minZoom: 8,
      maxZoom: 14
    });
  }

  private buildWeatherLayer(date: Date) {
    const dateStr = date.toISOString().split("T")[0];
    return new TileLayer({
      visible: true,
      preload: Infinity,
      source: new TileImage({
        url: `https://gibs-{a-c}.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${dateStr}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
        projection: "EPSG:3857"
      }),
      opacity: 0.6
    });
  }

  private resizeCallback() {
    this.calculateClientRects();
    this.olMap.updateSize();
  }

  private calculateClientRects() {
    this.mapClientRect = this.domElement.getBoundingClientRect();
    this.usableClientRect = new DOMRect(
      this.mapClientRect.x + this.padding.left,
      this.mapClientRect.y + this.padding.top,
      this.mapClientRect.width - this.padding.left - this.padding.right,
      this.mapClientRect.height - this.padding.bottom - this.padding.top
    );

    if (this.usableClientRect.width < MINIMUM_USABLE_SIZE_IN_PX) {
      this.usableClientRect.x = this.mapClientRect.x;
      this.usableClientRect.width = this.mapClientRect.width;
      this.padding.left = 0;
      this.padding.right = 0;
    }

    if (this.usableClientRect.height < MINIMUM_USABLE_SIZE_IN_PX) {
      this.usableClientRect.y = this.mapClientRect.y;
      this.usableClientRect.height = this.mapClientRect.height;
      this.padding.top = 0;
      this.padding.bottom = 0;
    }
  }

  private offsetForUsableCenter(coordinate: Coordinate) {
    const coordinateAtCenter = this.olMap.getCoordinateFromPixel(
      this.clientRectCenter(this.mapClientRect)
    );
    const coordinateAtUsableCenter = this.olMap.getCoordinateFromPixel(
      this.clientRectCenter(this.usableClientRect)
    );
    const offsetXY = [
      coordinateAtCenter[0] - coordinateAtUsableCenter[0],
      coordinateAtCenter[1] - coordinateAtUsableCenter[1]
    ];

    const x = coordinate[0] + offsetXY[0];
    const y = coordinate[1] + offsetXY[1];

    return [x, y];
  }

  private clientRectCenter(clientRect: DOMRect) {
    const centerX = clientRect.x + clientRect.width / 2;
    const centerY = clientRect.y + clientRect.height / 2;
    return [centerX, centerY];
  }
}
