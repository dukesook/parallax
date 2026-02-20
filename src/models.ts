import { Iri } from './aliases';

export interface Port {
  port_id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface SpatiotemporalCoordinate {
  Coordinate: Coordinate;
  time: Date;
}

export interface Coordinate {
  latitude: number; // Degrees
  longitude: number; // Degrees
}

export interface Observation {
  location: Coordinate;
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

export interface FabricatorOptions {
  n_boats: number;
  n_trips_per_boat: number;
  n_airplanes: number;
  n_trips_per_plane: number;
  n_vehicles: number;
  n_trips_per_vehicle: number;
}

export interface ObservableEntity {
  id: Iri;
  type: string;
  label: string;
}
