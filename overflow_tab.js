let nodeList = [];

// Sorting rules

const reverseSort = (callback) => {
  return (a, b) => (callback(b, a))
}

const favCompare = (a, b) => {
  aFav = a.children[1].getAttribute('src')
  bFav = b.children[1].getAttribute('src')

  if (aFav < bFav) {
    return -1
  } else {
    return 1
  }
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

// Sorting Interface

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

const handleReverse = () => {
  selectedRule = (selectedRule + 3) % 6;
  chrome.storage.sync.set({selectedRule: selectedRule})
  customArmageddon();
}

const handleRuleChange = (num) => {
  if (selectedRule > 2) {
    selectedRule = num + 3;
  } else {
    selectedRule = num;
  }
  chrome.storage.sync.set({selectedRule: selectedRule})
  customArmageddon();
}




let alreadyCreated = (tabList, message) => {
  for (let i = 0; i < tabList.children.length; i++) {
    let childId = tabList.children[i].getAttribute('data-id')
    if (childId == message.tab.id) {
      return true;
    }
  }
  return false;
}



const handleNumTabs = (num) => {
  chrome.storage.sync.set({numTabs: num}, () => {
    chrome.runtime.sendMessage({type: "NUM_TABS", num: num})
  })
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

chrome.storage.sync.get('numTabs', (data) => {
  if (Object.keys(data).length > 0) {
    document.querySelector('#num-tabs').innerHTML = data.numTabs
  }
})
// List item creation

const updateCounts = () => {
  tabCount = document.querySelector('.header-tab-count');
  newCount = parseInt(document.querySelector('#num-tabs').innerHTML) +
  nodeList.length - 1;
  console.log(tabCount.innerHTML);
  tabCount.innerHTML = `Total: ${newCount} Tabs`;
  document.querySelector('title').innerHTML = `(${nodeList.length}) Overflow Tab`;
}

const createCloseBtn = (listItem, tab) => {
  let closeBtn = document.createElement('span');
  closeBtn.classList.add('overflow-item-close-btn');
  closeBtn.innerHTML = 'x';
  closeBtn.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    nodeList = nodeList.filter(el => (el.getAttribute('data-id') !== `${tab.id}`) );
    updateCounts();
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

const customArmageddon = () => {
  let tabList = document.getElementById("overflow-list")
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
        customArmageddon();
        updateCounts();
      }
      break;
    case "FETCH_TAB":
      let selId = nodeList.pop().getAttribute('data-id')
      let selItem = document.querySelector(`[data-id="${selId}"]`)
      let url = selItem.getAttribute('data-url');
      chrome.runtime.sendMessage({type: "OPEN_TAB", url: url, idx: message.pen});
      selItem.remove();
      updateCounts();
      if (nodeList.length === 0) chrome.runtime.sendMessage({type: "DESTROY_OVERFLOW"})
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
      id = numOptions[i].getAttribute('id').slice(4)
      document.getElementById('safe-tabs').innerHTML = id;
      handleSafeTabs(parseInt(id))
    })
  }

  let tabOptions = document.querySelectorAll('.numb');

  for (let i = 0; i < tabOptions.length; i++) {
    tabOptions[i].addEventListener('click', () => {
      id = tabOptions[i].getAttribute('id').slice(8);
      document.getElementById('num-tabs').innerHTML = id;
      handleNumTabs(parseInt(id))
    })
  }
});

const setSelectValue = val => {
  document.getElementById('sort-value').innerHTML = val;
}
