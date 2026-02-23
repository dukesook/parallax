import { getElement } from './gui';
import { Triple } from '../aliases';
import { ObservableEntity } from '../models';

let g_table: HTMLTableElement | null = null;
let g_messageDiv: HTMLDivElement | null = null;

// graph.ts
export async function init() {
  g_table = getElement('knowledge-graph-table') as HTMLTableElement;
  g_messageDiv = getElement('graph-message') as HTMLDivElement;
}

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

  listShipsButton(callback: () => void): void {
    const listShipsButton = getElement('list-ships-button') as HTMLButtonElement;
    listShipsButton.addEventListener('click', callback);
  },

  scan(callback: () => void): void {
    const scanButton = getElement('scan') as HTMLButtonElement;
    scanButton.addEventListener('click', callback);
  },
};

export function displayTriples(triples: Triple[]): void {
  const table = get_table();

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
  const table = get_table();
  const messageDiv = get_messageDiv();
  table.innerHTML = '';
  messageDiv.innerHTML = '';
  items.forEach((item) => {
    const p = document.createElement('p');
    p.textContent = item;
    messageDiv.appendChild(p);
  });
}

export function displayGraphs(graphs: string[]): void {
  const messageDiv = get_messageDiv();
  messageDiv.innerHTML = '';
  graphs.forEach((graph) => {
    const p = document.createElement('p');
    p.textContent = graph;
    messageDiv.appendChild(p);

    p.addEventListener('click', () => {
      console.log('Graph clicked:', graph);
    });
  });
}

export function displayObservableEntities(entities: ObservableEntity[], onClick: () => void): void {
  const table = get_table();
  table.innerHTML = '';

  if (entities.length === 0) {
    table.innerHTML = '<tr><td>No observable entities found.</td></tr>';
    return;
  }

  // Create table header
  const headerRow = table.insertRow();
  const nameHeader = document.createElement('th');
  nameHeader.textContent = 'Name';
  const typeHeader = document.createElement('th');
  typeHeader.textContent = 'Type';
  headerRow.appendChild(nameHeader);
  headerRow.appendChild(typeHeader);

  entities.forEach((entity) => {
    const row = table.insertRow();
    const nameCell = row.insertCell();
    const typeCell = row.insertCell();

    nameCell.textContent = entity.label;
    typeCell.textContent = entity.type;

    row.addEventListener('click', onClick);

    table.appendChild(row);
  });
  console.log(entities);
}

function get_messageDiv(): HTMLDivElement {
  if (!g_messageDiv) {
    throw new Error('Message div element not found');
  }
  return g_messageDiv;
}

function get_table(): HTMLTableElement {
  if (!g_table) {
    throw new Error('Table element not found');
  }
  return g_table;
}
