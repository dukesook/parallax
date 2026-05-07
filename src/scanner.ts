import Rdf from './rdf_handler';
import { Iri, Label, Triple } from './aliases';
import { Voyage, Observation, Coordinate, ObservationWithDistance } from './models';
import * as GraphDB from './dependencies/graphdb';
import { assert } from 'console';

export default class Scanner {
  static scan(): void {
    // Get Voyages
  }

  static async scanVoyage(voyage: Voyage, observations: Observation[], threshold: number): Promise<ObservationWithDistance[]> {
    // console.log('Scanning Voyage: ' + voyage.id);
    // console.log('Voyage Ship: ' + voyage.ship);

    // Extract Coordinates
    const voyageCords: Coordinate[] = voyage.points.map((obs) => obs.location);
    const startTime: Date = voyage.points[0].time;
    const endTime: Date = voyage.points[voyage.points.length - 1].time;
    const lingstring_wkt = GraphDB.make_linestring_wkt(voyageCords);

    const results: ObservationWithDistance[] = [];
    for (const observation of observations) {
      const time: Date = observation.time;
      if (time < startTime || time > endTime) {
        // Skip observations outside of time window
        console.log(`Skipping observation ${observation.id} at time ${time.toLocaleString()} outside of voyage time window (${startTime.toLocaleString()} - ${endTime.toLocaleString()})`);
        continue;
      }
      const coordinate: Coordinate = observation.location;
      const point_wkt = GraphDB.make_point_wkt(coordinate);
      const distance: number | null = await GraphDB.computeDistance(lingstring_wkt, point_wkt);
      if (distance === null) {
        throw new Error('Distance is null for coordinate: ' + JSON.stringify(coordinate));
      } else if (distance >= threshold) {
        const result: ObservationWithDistance = {
          ...observation,
          distance,
        };
        results.push(result);

        // console.log(`Observation ${observation.id} is within ${distance} meters of the voyage`);
      }
    }

    return results;

    // for (const coordinate of observatioCords) {
    //   const point_wkt = GraphDB.make_point_wkt(coordinate);
    //   const distance: number | null = await GraphDB.computeDistance(lingstring_wkt, point_wkt);
    //   if (distance == null) {
    //     console.log('Distance is null for coordinate:', coordinate);
    //   } else {
    //     console.log(`Distance from voyage to observation: ${distance} meters`);
    //   }
    // }
  }
}
