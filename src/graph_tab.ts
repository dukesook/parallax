import { getElement } from './gui';
import { Triple } from './aliases';

// graph.ts
export async function init() {}

export function onListTriplesButton(callback: () => void): void {
  const listTriplesButton = getElement('list-triples-button') as HTMLButtonElement;
  listTriplesButton.addEventListener('click', callback);
}

export function displayTriples(triples: Triple[]): void {
  const table = document.getElementById('knowledge-graph-table') as HTMLTableElement;
  if (!table) {
    throw new Error('Table element not found');
  }

  // Clear existing table rows
  table.innerHTML = 'testing';

  // Create table header
}
