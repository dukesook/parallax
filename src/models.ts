import { Iri } from './aliases';

export interface Port {
  port_id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface GeoPoint {
  latitude: number; // Degrees
  longitude: number; // Degrees
}

export interface Observation {
  location: GeoPoint;
  time: Date;
  Entities: string[];
}

export interface Voyage {
  ship: string;
  start_time: Date;
  end_time: Date;
  start_port: Iri;
  end_port: Iri;
}
