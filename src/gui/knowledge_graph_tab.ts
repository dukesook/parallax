import { getElement } from './gui';
import { Triple } from '../aliases';

// graph.ts
export async function init() {}

export const On = {
  listInstanceData(callback: () => void): void {
    const listInstanceDataButton = getElement('list-instance-data') as HTMLButtonElement;
    listInstanceDataButton.addEventListener('click', callback);
  },

  listGraphsButton(callback: () => void): void {
    const listGraphsButton = getElement('list-graphs-button') as HTMLButtonElement;
    listGraphsButton.addEventListener('click', callback);
  },

  listTriplesButton(callback: () => void): void {
    const listTriplesButton = getElement('list-triples-button') as HTMLButtonElement;
    listTriplesButton.addEventListener('click', callback);
  },

  scan(callback: () => void): void {
    const scanButton = getElement('scan') as HTMLButtonElement;
    scanButton.addEventListener('click', callback);
  },
};

export function displayTriples(triples: Triple[]): void {
  const table = document.getElementById('knowledge-graph-table') as HTMLTableElement;
  if (!table) {
    throw new Error('Table element not found');
  }

  if (triples.length === 0) {
    table.innerHTML = '<tr><td colspan="3">No triples found.</td></tr>';
    return;
  }

  // Clear existing table rows
  table.innerHTML = '';

  // Create table header
  // Print first 10 triples
  for (let i = 0; i < Math.min(triples.length, 1000); i++) {
    // for (let i = 0; i < triples.length; i++) {
    const triple = triples[i];
    const row = table.insertRow();
    const subjectCell = row.insertCell();
    const predicateCell = row.insertCell();
    const objectCell = row.insertCell();

    subjectCell.textContent = triple.subject;
    predicateCell.textContent = triple.predicate;
    objectCell.textContent = triple.object;

    table.appendChild(row);
  }

  // triples.forEach((triple) => {
  //   const row = table.insertRow();
  //   const subjectCell = row.insertCell();
  //   const predicateCell = row.insertCell();
  //   const objectCell = row.insertCell();

  //   subjectCell.textContent = triple.subject;
  //   predicateCell.textContent = triple.predicate;
  //   objectCell.textContent = triple.object;
  // });
}

export function displayList(items: string[]): void {
  const table = document.getElementById('knowledge-graph-table') as HTMLTableElement;
  table.innerHTML = '';
  const outputDiv = getElement('graph-output') as HTMLDivElement;
  outputDiv.innerHTML = '';
  items.forEach((item) => {
    const p = document.createElement('p');
    p.textContent = item;
    outputDiv.appendChild(p);
  });
}

export function displayGraphs(graphs: string[]): void {
  const outputDiv = getElement('graph-output') as HTMLDivElement;
  outputDiv.innerHTML = '';
  graphs.forEach((graph) => {
    const p = document.createElement('p');
    p.textContent = graph;
    outputDiv.appendChild(p);

    p.addEventListener('click', () => {
      console.log('Graph clicked:', graph);
    });
  });
}
