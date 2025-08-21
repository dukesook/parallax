import { getElement } from './gui';

// graph.ts
export async function init() {}

export function onListTriplesButton(callback: () => void): void {
  const listTriplesButton = getElement('list-triples-button') as HTMLButtonElement;
  listTriplesButton.addEventListener('click', callback);
}
