console.log('Generating RDF data...');
import RdfHandler from '../../src/rdf_handler';
import * as XLSX from 'xlsx';
import { Port, Coordinate, Observation, Voyage, SpatiotemporalCoordinate } from '../../src/models';
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
    // console.log('CSV data loaded successfully:', jsonData);

    const points: SpatiotemporalCoordinate[] = [];
    for (const row of jsonData) {
      const longitude: number = row.x;
      const latitude: number = row.y;
      const seconds: number = row.t;
      const coordinate: Coordinate = { latitude, longitude };
      const time: Date = new Date(seconds * 1000); // Convert seconds to milliseconds
      points.push({ Coordinate: coordinate, time });
    }

    const ship: Iri = RdfHandler.add.ship('Boat 1956, my favorite');

    const voyage: Voyage = {
      id: RdfHandler.generateIri(),
      ship: ship,
      start_time: new Date(0), // Placeholder, should be set to actual start time
      end_time: new Date(1000), // Placeholder, should be set to actual end time
      start_port: RdfHandler.generateIri(), // Placeholder, should be set to actual start port IRI
      end_port: RdfHandler.generateIri(), // Placeholder, should be set to actual end port IRI
      points: points,
    };
    RdfHandler.add.voyage(voyage);
  } catch (error) {
    console.error('Error loading CSV file:', error);
  }

  const ttl: string = RdfHandler.get.instanceDataTurtle();

  // console.log('Generated RDF in Turtle format:\n', ttl);
  // Write ttl to file:
  fs.writeFile('out/output.ttl', ttl, (err) => {
    if (err) {
      console.error('Error writing Turtle file:', err);
    } else {
      console.log('Turtle file has been saved as output.ttl');
    }
  });
}

main();
