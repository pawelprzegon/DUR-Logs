export class Alerts {
  constructor(status, response, alertType) {
    this.status = status;
    this.response = response;
    this.alertType = alertType;
  }
  createNew() {
    let alerts = document.querySelector("#alerts");
    this.alert = document.createElement("div");
    this.alert.classList.add("alert");
    this.alert.id = "alert";

    this.alert.style.removeProperty("visibility");
    this.timer = document.createElement("span");
    this.timer.id = "timer";
    let alertClose = document.createElement("span");
    alertClose.classList.add("alert-close");
    alertClose.setAttribute("data-close", "alert");
    alertClose.title = "Close";
    alertClose.innerHTML = "&times;";
    alertClose.insertBefore(this.timer, alertClose.firstChild);

    let alertMsg = document.createElement("div");
    alertMsg.id = "alert-message";
    alertMsg.innerHTML = `<strong> ${this.status} </strong> - ${this.response}`;
    this.alert.appendChild(alertClose);
    this.alert.appendChild(alertMsg);
    this.alert.classList.add(this.alertType);
    alerts.insertBefore(this.alert, alerts.firstChild);
    alertClose.onclick = () => {
      this.alert.remove();
    };
    this.countDown();
  }
  countDown() {
    this.sec = 8;
    this.countDown = setInterval(() => {
      this.timer.innerHTML = this.sec + " ";
      this.sec -= 1;
      if (this.sec < 0) {
        this.alert.style.visibility = "hidden";
        this.alert.innerHTML = "";
        clearInterval(this.countDown);
      }
    }, 1000);
  }
}
