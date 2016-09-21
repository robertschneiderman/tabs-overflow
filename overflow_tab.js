chrome.runtime.onMessage.addListener(message => {
  let title;
  let titleI;
  switch (message.type) {
    case "SEND_TABS":
      let tabList = document.getElementById("overflow-list");
      message.tabs.forEach(tab => {
        let listItem = document.createElement('li');
        listItem.classList.add('oveflowItem');
        listItem.innerHTML = tab.title;
        listItem.setAttribute('data-url', tab.url);
        listItem.addEventListener('click', () => {
          listItem.remove();
          chrome.runtime.sendMessage({type: "OPEN_TAB", url: tab.url})
        })
        //Favicon?

        tabList.appendChild(listItem);
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
