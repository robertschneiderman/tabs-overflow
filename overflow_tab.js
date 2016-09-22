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
      case "FETCH_TAB":
        let list = document.getElementById("overflow-list");
        let url = list.lastChild.getAttribute('data-url');
        chrome.runtime.sendMessage({type: "OPEN_TAB", url: url});
        list.lastChild.remove();
        if (!list.lastChild) {
          chrome.runtime.sendMessage({type: "DESTROY_OVERFLOW"})
        }
        break;
    default:
      console.log('hooray!');
  }
});
chrome.runtime.sendMessage({type: "UPDATE_TITLE"})
chrome.runtime.sendMessage({type: "REQUEST_TABS"})

document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({type: "REQUEST_TABS"})
})
