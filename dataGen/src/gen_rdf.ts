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
    console.log('Adding file to Triple Store:', path);
    add_ushant_file(path);
  }

  const outputPath: string = '../rdf/ushant-10.ttl';
  // const outputPath: string = '../rdf/ushant-100.ttl';
  // const outputPath: string = '../rdf/large/ushant-1000.ttl';
  // const outputPath: string = '../rdf/large/ushant-10000.ttl';
  // const outputPath: string = '../rdf/large/ushant-100000.ttl';
  // const outputPath: string = '../rdf/large/ushant-1000000.ttl';

  console.log('Exporting instance data to Turtle file:', outputPath);
  export_instance_data(outputPath);
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

    const base: Date = fabricateUshantDate();
    for (const row of jsonData) {
      const longitude: number = row.x;
      const latitude: number = row.y;
      const seconds: number = row.t;
      const coordinate: Coordinate = { latitude, longitude };
      const time: Date = addDateOffset(base, seconds);

      const observationId: Iri = RdfHandler.generateIri();
      //prettier-ignore
      points.push({ 
        id: observationId,
        location: coordinate,
        time: time,
        entities: [voyageId],
      });
    }

    let shipCounter: number = 1;
    const shipName: string = 'vessel #' + shipCounter;
    const ship: Iri = RdfHandler.add.ship(shipName);

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

function export_instance_data(outputPath: string) {
  const ttl: string = RdfHandler.get.instanceDataTurtle();

  fs.writeFile(outputPath, ttl, (err) => {
    if (err) {
      console.error('Error writing Turtle file:', err);
    } else {
      console.log('Turtle file has been saved as ', outputPath);
    }
  });
}

async function getCsvFilenames(directory: string): Promise<string[]> {
  const files = await readdir(directory);

  return files.filter((f) => f.toLowerCase().endsWith('.csv'));
}

function fabricateUshantDate(): Date {
  // The Ushant dataset starts on July 1st, 2019 = 7/1/2019
  const start: Date = new Date('2019-07-01T00:00:00Z');
  const end: Date = new Date('2019-12-31T23:59:59Z');
  return randomDate(start, end);
}

function randomDate(start: Date, end: Date): Date {
  const startMs = start.getTime();
  const endMs = end.getTime();

  if (endMs < startMs) {
    throw new Error('end must be after start');
  }

  const randomMs = startMs + Math.random() * (endMs - startMs);

  return new Date(randomMs);
}

function addDateOffset(date: Date, seconds: number): Date {
  const offsetMs = seconds * 1000; // Convert seconds to milliseconds
  const absoluteTime: number = date.getTime() + offsetMs;
  const newDate: Date = new Date(absoluteTime);
  return newDate;
}
