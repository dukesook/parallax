console.log('Generating RDF data...');
import RdfHandler from '../../src/rdf_handler';
import * as XLSX from 'xlsx';
import { Coordinate, Observation, Voyage } from '../../src/models';
import { Iri } from '../../src/aliases';
import * as fs from 'fs';
import { readdir } from 'fs/promises';

type Ushant = {
  x: number; // longitude
  y: number; // latitude
  t: number; // seconds since beginning of trip
};

// Confirm File Exists

async function main() {
  const directoryPath: string = 'ushant_ais/csv';
  const filenames = await getCsvFilenames(directoryPath);
  // const filenames = ['traj_1956.csv'];

  for (const filename of filenames) {
    const path = `${directoryPath}/${filename}`;
    console.log('Processing file:', path);
    add_ushant_file(path);
  }

  export_instance_data();
}

main();

function add_ushant_file(filePath: string) {
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
}

function export_instance_data() {
  const ttl: string = RdfHandler.get.instanceDataTurtle();

  const outputPath: string = '../rdf/test-data.ttl';
  fs.writeFile(outputPath, ttl, (err) => {
    if (err) {
      console.error('Error writing Turtle file:', err);
    } else {
      console.log('Turtle file has been saved as output.ttl');
    }
  });
}

async function getCsvFilenames(directory: string): Promise<string[]> {
  const files = await readdir(directory);

  return files.filter((f) => f.toLowerCase().endsWith('.csv'));
}
