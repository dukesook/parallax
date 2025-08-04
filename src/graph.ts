// graph.ts
export function init() {
  console.log('Graph tab init()');
  const button = document.getElementById('list-triples-button');
  if (!button) {
    console.warn('logButton not found');
    return;
  }

  button.addEventListener('click', () => {
    console.log('hello world');
  });
}
