let alreadyCreated = (tabList, message) => {
  for (let i = 0; i < tabList.children.length; i++) {
    let childId = tabList.children[i].getAttribute('data-id')
    if (childId == message.tab.id) {
      return true;
    }
  }
  return false;
}

chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case "PURGATORY":
      let purgatoryTab = message.tab;
      let tabList = document.getElementById("overflow-list");

      if (!alreadyCreated(tabList, message)) {
        let listItem = document.createElement('li');
        listItem.setAttribute('data-id', message.tab.id);
        let fav = document.createElement('img');
        fav.classList.add('item-img');
        fav.setAttribute('src', purgatoryTab.favIconUrl);
        listItem.classList.add('oveflow-item');
        let spn = document.createElement('span');
        spn.innerHTML = purgatoryTab.title;
        spn.classList.add('item-text');
        listItem.appendChild(fav);
        listItem.appendChild(spn);
        listItem.setAttribute('data-url', purgatoryTab.url);
        listItem.addEventListener('click', () => {
          listItem.remove();
          chrome.runtime.sendMessage({type: "OPEN_TAB", url: purgatoryTab.url})
        });
        tabList.appendChild(listItem);
      }




      return true;
      break;
    default:
      return true;
  }
})

document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({type: "REQUEST_PURGATORY"})
})
