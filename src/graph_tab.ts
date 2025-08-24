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
