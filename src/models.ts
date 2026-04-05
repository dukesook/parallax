import { Iri } from './aliases';

export interface Port {
  // TODO: Generalize to Place or Location
  port_id: Iri;
  name: string;
  country: string; // TODO: deprecate!
  latitude: number;
  longitude: number;
}

export interface Voyage {
  id: Iri;
  ship: Iri;
  points: Observation[];
}

export interface Observation {
  id: Iri;
  location: Coordinate;
  time: Date;
  entities: Iri[];
}

export interface Coordinate {
  latitude: number; // Degrees
  longitude: number; // Degrees
}

export interface FabricatorOptions {
  n_boats: number;
  n_trips_per_boat: number;
  n_valid_observations_per_trip: number;
  n_airplanes: number;
  n_trips_per_plane: number;
  n_vehicles: number;
  n_trips_per_vehicle: number;
}

export interface ObservableEntity {
  // Every Entity is observable
  id: Iri;
  type: string;
  label: string;
}
