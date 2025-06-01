const messageDiv = document.getElementById("message") as HTMLElement;

export const Gui = {

  displayMessage: (message: string): void => {
    messageDiv.innerHTML = message;
  }

}