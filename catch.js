let nodeList = [];

const favCompare = (a, b) => {
  aFav = a.firstChild.getAttribute('src')
  bFav = b.firstChild.getAttribute('src')

  if (aFav < bFav) {
    return -1
  } else {
    return 1
  }
}

const stackCompare = (a,b) => {
  nodeList.indexOf(a) - nodeList.indexOf(b)
}

const reverseStackCompare = (a,b) => {
  nodeList.indexOf(b) - nodeList.indexOf(a)
}

const alphabetCompare = (a,b) => {
  aTitle = a.lastChild.innerHTML;
  bTitle = b.lastChild.innerHTML;
  if (aTitle < bTitle) {
    return -1
  } else {
    return 1
  }
}

const ruleList = [favCompare, stackCompare, reverseStackCompare, alphabetCompare];
let selectedRule = 0;

let alreadyCreated = (tabList, message) => {
  for (let i = 0; i < tabList.children.length; i++) {
    let childId = tabList.children[i].getAttribute('data-id')
    if (childId == message.tab.id) {
      return true;
    }
  }
  return false;
}

const createFav = (tab) => {
  let fav = document.createElement('img');
  fav.classList.add('item-img');
  fav.setAttribute('src', tab.favIconUrl);
  return fav;
}

const createSpan = (tab) => {
  let spn = document.createElement('span');
  spn.innerHTML = tab.title;
  spn.classList.add('item-text');
  return spn;
}

const createListItem = (tab) => {
  let listItem = document.createElement('li');
  listItem.setAttribute('data-id', tab.id);
  listItem.setAttribute('data-url', tab.url);
  listItem.classList.add('overflow-item');
  listItem.appendChild(createFav(tab));
  listItem.appendChild(createSpan(tab));
  listItem.addEventListener('click', () => {
    nodeList = nodeList.filter(el => (el.getAttribute('data-id') !== `${tab.id}`) )
    listItem.remove();
    chrome.runtime.sendMessage({type: "OPEN_TAB", url: tab.url})
  });
  return listItem;
}

const customArmageddon = (tabList) => {
  let newNode = nodeList.slice(0)
  newNode.sort(favCompare)
  tabList.innerHTML = ""
  newNode.forEach((el) => {
    tabList.appendChild(el)
  })
}

chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case "SEND_TAB":
      let tabList = document.getElementById("overflow-list");
      if (!alreadyCreated(tabList, message)) {
        let listItem = createListItem(message.tab);
        nodeList.push(listItem);
        customArmageddon(tabList);
      }
      return true;
      break;
      case "FETCH_TAB":
        selId = nodeList.pop().getAttribute('data-id')
        selItem = document.querySelector(`[data-id="${selId}"]`)
        let url = selItem.getAttribute('data-url');
        chrome.runtime.sendMessage({type: "OPEN_TAB", url: url});
        selItem.remove();
        if (nodeList.length === 0) {
          chrome.runtime.sendMessage({type: "DESTROY_OVERFLOW"})
        }
        break;
    default:
      return true;
  }
})

document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({type: "REQUEST_PURGATORY"})
})
