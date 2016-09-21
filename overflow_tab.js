chrome.runtime.onMessage.addListener(message => {
  let title;
  let titleI;
  switch (message.type) {
    case "SEND_TABS":
      let tabList = document.getElementById("overflow-list");
      tabList.innerHTML = '';
      message.tabs.forEach(tab => {
        if (tab.index > 9) {
          let listItem = document.createElement('li');
          listItem.classList.add('oveflowItem');
          listItem.setAttribute('data-id', tab.id);
          listItem.innerHTML = tab.title;
          listItem.addEventListener('click', () => {
            chrome.runtime.sendMessage({type: "ACTIVATE_TAB", tabId: tab.id});
          });

          tabList.appendChild(listItem);
        }
      });
      break;
      case "SET_TITLE":
        title = document.querySelector("title")
        titleI = title.innerHTML
        console.log(title);
        title.innerHTML = `${message.index + 1}` + " " + titleI
        break;
      case "AMEND_TITLE":
        title = document.querySelector("title")
        titleI = title.innerHTML
        titleI = titleI.split(" ").slice(1).join(" ")
        console.log(title);
        title.innerHTML = `${message.index + 1}` + " " + titleI
        break;
    default:
      console.log('hooray!');
  }
});

console.log("hi");
chrome.runtime.sendMessage({type: "UPDATE_TITLE"})
chrome.runtime.sendMessage({type: "REQUEST_TABS"})

document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({type: "REQUEST_TABS"})
})
