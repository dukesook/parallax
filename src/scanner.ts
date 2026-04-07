import Rdf from './rdf_handler';
import { Iri, Label, Triple } from './aliases';
import { Voyage, Observation, Coordinate } from './models';
import * as GraphDB from './dependencies/graphdb';

export default class Scanner {
  static scan(): void {
    // Get Voyages
  }

  static async scanVoyage(voyage: Voyage, obserations: Observation[]): Promise<void> {
    // console.log('Scanning Voyage: ' + voyage.id);
    // console.log('Voyage Ship: ' + voyage.ship);

    // Extrac Coordinates
    const voyageCords: Coordinate[] = voyage.points.map((obs) => obs.location);
    const observatioCords: Coordinate[] = obserations.map((obs) => obs.location);

    const lingstring_wkt = GraphDB.make_linestring_wkt(voyageCords);

    for (const coordinate of observatioCords) {
      const point_wkt = GraphDB.make_point_wkt(coordinate);
      const distance: number | null = await GraphDB.computeDistance(lingstring_wkt, point_wkt);
      if (distance == null) {
        console.log('Distance is null for coordinate:', coordinate);
      } else {
        console.log(`Distance from voyage to observation: ${distance} meters`);
      }
    }
  }
}
