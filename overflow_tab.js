let nodeList = [];

const favCompare = (a, b) => {
  aFav = a.children[1].getAttribute('src')
  bFav = b.children[1].getAttribute('src')

  if (aFav < bFav) {
    return -1
  } else {
    return 1
  }
}

const reverseSort = (callback) => {
  return (a, b) => (callback(b, a))
}

const stackCompare = (a,b) => {
  let aNode = nodeList.filter( el => (el.getAttribute('data-id') === a.getAttribute('data-id')))[0]
  let bNode = nodeList.filter( el => (el.getAttribute('data-id') === b.getAttribute('data-id')))[0]
  return nodeList.indexOf(aNode) - nodeList.indexOf(bNode)
}

const alphabetCompare = (a,b) => {
  aTitle = a.lastChild.innerHTML.toLowerCase();
  bTitle = b.lastChild.innerHTML.toLowerCase();
  if (aTitle < bTitle) {
    return -1
  } else {
    return 1
  }
}

const ruleList = [favCompare, stackCompare, alphabetCompare,
  reverseSort(favCompare), reverseSort(stackCompare), reverseSort(alphabetCompare)];

let selectedRule = 0;
chrome.storage.sync.get('selectedRule', (data) => {
  if (Object.keys(data).length > 0) {
    selectedRule = data.selectedRule;
    if (selectedRule === 0 || selectedRule === 3){
      document.getElementById('sort-value').innerHTML = 'Site'
    } else if (selectedRule === 1 || selectedRule === 4){
      document.getElementById('sort-value').innerHTML = 'Queue'
    } else {
      document.getElementById('sort-value').innerHTML = 'Title'
    }
    if (selectedRule > 2) {
      document.getElementById('sort-checkbox').checked = true;
    }
  }
})

let alreadyCreated = (tabList, message) => {
  for (let i = 0; i < tabList.children.length; i++) {
    let childId = tabList.children[i].getAttribute('data-id')
    if (childId == message.tab.id) {
      return true;
    }
  }
  return false;
}

const handleReverse = () => {
  selectedRule = (selectedRule + 3) % 6;
  chrome.storage.sync.set({selectedRule: selectedRule})
  tabList = document.getElementById('overflow-list')
  customArmageddon(tabList);
}

const handleRuleChange = (num) => {
  if (selectedRule > 2) {
    selectedRule = num + 3;
    chrome.storage.sync.set({selectedRule: selectedRule})
  } else {
    selectedRule = num;
    chrome.storage.sync.set({selectedRule: selectedRule})
  }
  tabList = document.getElementById('overflow-list')
  customArmageddon(tabList);
}

const handleSafeTabs = (num) => {
  chrome.storage.sync.set({safeTabs: num}, () => {
    chrome.runtime.sendMessage({type: "NUM_SAFE_TABS", num: num})
  })
}

chrome.storage.sync.get('safeTabs', (data) => {
  if (Object.keys(data).length > 0) {
    document.querySelector('.option-value').innerHTML = data.safeTabs;
  }
})

const createCloseBtn = (listItem, tab) => {
  let closeBtn = document.createElement('span');
  closeBtn.classList.add('overflow-item-close-btn');
  closeBtn.innerHTML = 'x';
  closeBtn.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    nodeList = nodeList.filter(el => (el.getAttribute('data-id') !== `${tab.id}`) )
    tabCount = document.querySelector('.header-tab-count')
    newCount = tabCount.innerHTML.slice(7) - 1
    tabCount.innerHTML = `Total: ${newCount}`
    document.querySelector('title').innerHTML = `(${nodeList.length}) Overflow Tab`;
    listItem.nextSibling.remove();
    listItem.remove();
  });
  return closeBtn;
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
  listItem.appendChild(createCloseBtn(listItem, tab));
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
  newNode.sort(ruleList[selectedRule])
  tabList.innerHTML = ""
  newNode.forEach((el) => {
    tabList.appendChild(el);
    let br = document.createElement('br');
    tabList.appendChild(br);
  })
}

chrome.runtime.onMessage.addListener((message) => {
  let tabList = document.getElementById("overflow-list");
  switch (message.type) {
    case "SEND_TAB":
      if (!alreadyCreated(tabList, message)) {
        let listItem = createListItem(message.tab);
        nodeList.push(listItem);
        customArmageddon(tabList);
        document.querySelector('.header-tab-count').innerHTML =
         `Total: ${message.permittedTabNum + nodeList.length} Tabs`
        document.querySelector('title').innerHTML = `(${nodeList.length}) Overflow Tab`;
      }
      return true;
      break;
    case "FETCH_TAB":
      let selId = nodeList.pop().getAttribute('data-id')
      let selItem = document.querySelector(`[data-id="${selId}"]`)
      let url = selItem.getAttribute('data-url');
      chrome.runtime.sendMessage({type: "OPEN_TAB", url: url, idx: message.pen});
      selItem.remove();
      document.querySelector('.header-tab-count').innerHTML = `Total: ${message.perm + nodeList.length} Tabs`
      document.querySelector('title').innerHTML = `(${nodeList.length}) Overflow Tab`;
      if (nodeList.length === 0) {
        chrome.runtime.sendMessage({type: "DESTROY_OVERFLOW"})
      }
      break;
    case "UNPACK":
      urlList = nodeList.map((el) => {
        return el.getAttribute('data-url');
      });
      chrome.runtime.sendMessage({type: "UNPACK_TABS", urlList: urlList})
      break;
    default:
      return true;
  }
})

document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({type: "REQUEST_PURGATORY"});

  let siteLi = document.getElementById('site-li')
  let queueLi = document.getElementById('queue-li')
  let titleLi = document.getElementById('title-li')
  let reverseCb = document.getElementById('sort-checkbox')

  siteLi.addEventListener("click", e => {
    e.preventDefault();
    setSelectValue('Site')
    handleRuleChange(0);
  });

  queueLi.addEventListener("click", e => {
    e.preventDefault();
    setSelectValue('Queue')
    handleRuleChange(1);
  });

  titleLi.addEventListener("click", e => {
    e.preventDefault();
    setSelectValue('Title')
    handleRuleChange(2);
  });

  reverseCb.addEventListener("click", e => {
    handleReverse();
  });

  let numOptions = document.querySelectorAll('.num');

  for (let i = 0; i < numOptions.length; i++) {
    numOptions[i].addEventListener('click', () => {
      idStr = numOptions[i].getAttribute('id');
      id = parseInt(idStr[idStr.length - 1],10)
      document.querySelector('.option-value').innerHTML = id;
      handleSafeTabs(id)
    })
  }
});

const setSelectValue = val => {
  document.getElementById('sort-value').innerHTML = val;
}
