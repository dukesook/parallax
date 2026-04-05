console.log('Generating RDF data...');
import RdfHandler from '../../src/rdf_handler';
import * as XLSX from 'xlsx';
import { Coordinate, Observation, Voyage } from '../../src/models';
import { Iri } from '../../src/aliases';
import * as fs from 'fs';

type Ushant = {
  x: number; // longitude
  y: number; // latitude
  t: number; // seconds since beginning of trip
};

// Confirm File Exists

async function main() {
  const filePath: string = 'ushant_ais/csv/traj_1956.csv';
  try {
    const workbook: XLSX.WorkBook = XLSX.readFile(filePath);
    const sheetName: string = workbook.SheetNames[0];
    const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
    const jsonData: Ushant[] = XLSX.utils.sheet_to_json<Ushant>(worksheet);

    const points: Observation[] = [];
    const voyageId: Iri = RdfHandler.generateIri();

    for (const row of jsonData) {
      const longitude: number = row.x;
      const latitude: number = row.y;
      const seconds: number = row.t;
      const coordinate: Coordinate = { latitude, longitude };
      const time: Date = new Date(seconds * 1000); // Convert seconds to milliseconds
      const observationId: Iri = RdfHandler.generateIri();
      //prettier-ignore
      points.push({ 
        id: observationId,
        location: coordinate,
        time: time,
        entities: [voyageId],
      });
    }

    const ship: Iri = RdfHandler.add.ship('Boat 1956, my favorite');

    const voyage: Voyage = {
      id: voyageId,
      ship: ship,
      points: points,
    };
    RdfHandler.add.voyage(voyage);
  } catch (error) {
    console.error('Error loading CSV file:', error);
  }

  const ttl: string = RdfHandler.get.instanceDataTurtle();

  // console.log('Generated RDF in Turtle format:\n', ttl);
  // Write ttl to file:
  const outputPath: string = '../rdf/test-data.ttl';
  fs.writeFile(outputPath, ttl, (err) => {
    if (err) {
      console.error('Error writing Turtle file:', err);
    } else {
      console.log('Turtle file has been saved as output.ttl');
    }
  });
}

main();
