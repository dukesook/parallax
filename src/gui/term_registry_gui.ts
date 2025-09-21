export function onShowTermRegistryButton(callback: () => void): void {
  const showTermRegistryButton = document.getElementById('term-registry-button') as HTMLButtonElement;
  showTermRegistryButton.addEventListener('click', callback);
}

export function displayTerms(terms: string[]): void {
  // Clear existing table rows
  const table = document.getElementById('term-registry-table') as HTMLTableElement;
  table.innerHTML = '';

  // Create table header
  const header = table.createTHead();
  const headerRow = header.insertRow(0);
  const th1 = document.createElement('th');
  th1.innerText = 'Registered Term';
  headerRow.appendChild(th1);

  // Populate table with terms
  const tbody = table.createTBody();
  terms.forEach((term) => {
    const row = tbody.insertRow();
    const cell = row.insertCell(0);
    cell.innerText = term;
  });
}
