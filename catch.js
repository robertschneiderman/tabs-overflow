chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case "PURGATORY":
      console.log("yo");
      let purgatoryTab = message.tab;
      let tabList = document.getElementById("overflow-list");
      let listItem = document.createElement('li');
      let fav = document.createElement('img');
      fav.setAttribute('src', purgatoryTab.favIconUrl);
      listItem.classList.add('oveflow-item');
      let spn = document.createElement('span');
      spn.innerHTML = purgatoryTab.title;
      listItem.appendChild(fav);
      listItem.appendChild(spn);
      listItem.setAttribute('data-url', purgatoryTab.url);
      listItem.addEventListener('click', () => {
        listItem.remove();
        chrome.runtime.sendMessage({type: "OPEN_TAB", url: purgatoryTab.url})
      })

      tabList.appendChild(listItem);


      return true;
      break;
    default:
      return true;
  }
})

document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({type: "REQUEST_PURGATORY"})
})