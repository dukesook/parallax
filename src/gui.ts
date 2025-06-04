const messageDiv = document.getElementById("message") as HTMLElement;


export function displayMessage(message: string): void {
  messageDiv.innerHTML = message;
}