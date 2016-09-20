chrome.runtime.onMessage.addListener(message => {
  switch (message.type) {
    case "SEND_TABS":
      let tabList = document.getElementById("overflow-list");
      message.tabs.forEach(tab => {
        let el = document.querySelector(`[data-id="${tab.id}"]`);
        if (!el) {
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
      case "ADJUST_TITLE":
        title = document.querySelector("title")
        tit = title.innerHTML
        title.innerHTML = `${message.index}` + " " + tit
        break;
    default:
      console.log('hooray!');
  }
});

document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({type: "UPDATE_TAB"})
})
