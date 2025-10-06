// src/leaflet-plugins.ts
import * as L from 'leaflet';

// ⚠️ expose L sur window avant d'importer le plugin
(window as any).L = L;

// import du plugin markercluster
import 'leaflet.markercluster';

// export L pour réutilisation
export default L;
