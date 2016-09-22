chrome.runtime.onMessage.addListener(message => {
  let title;
  let titleI;
  switch (message.type) {
      case "SET_TITLE":
        title = document.querySelector("title")
        titleI = title.innerHTML
        title.innerHTML = `${message.index + 1}` + " " + titleI
        break;
      case "AMEND_TITLE":
        title = document.querySelector("title")
        titleI = title.innerHTML
        titleI = titleI.split(" ").slice(1).join(" ")
        title.innerHTML = `${message.index + 1}` + " " + titleI
        break;
    default:
  }
});
chrome.runtime.sendMessage({type: "UPDATE_TITLE"})
