// Setting initial variables

let overflowId = 0;
let overflowWindow = 0;
let purgatoryTab;
let purgatoryHandled = false;
let active = true;
let numSafeTabs = 3;
let numTabs = 13

const penultimateTabNum = () => {
  return numTabs - 2
}
const permittedTabNum = () => {
  return numTabs - 1
}
const doomedTabNum = () => {
  return numTabs
}

// Fetching saved values

chrome.storage.sync.get('safeTabs', (data) => {
  if (Object.keys(data).length > 0) {
    numSafeTabs = data.safeTabs
  }
})

chrome.storage.sync.get('numTabs', (data) => {
  if (Object.keys(data).length > 0) {
    numTabs = data.numTabs
  }
})

let storedActive = chrome.storage.sync.get('activeStatus', (data) => {
  if (Object.keys(data).length > 0) {
    active = data.activeStatus;
    if (active) {
      listenOn();
    } else {
      chrome.browserAction.setIcon({path: "icons/icon-grey.png"});
    }
  } else {
    active = true;
    listenOn();
  }
})

// Helpers

let move = true;

const getAllTabs = (call) => {
  chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, call)
};

const moveOverflowRight = () => {
  if (overflowId > 0) {
    chrome.tabs.move(overflowId, {index: doomedTabNum()});
  }
};

const sendExtra = (tabs) => {
  tabs.forEach((tab) => {
    if (tab.index > (permittedTabNum()) && tab.id != overflowId) {
      chrome.tabs.sendMessage(overflowId, {type: "SEND_TAB", tab: tab,
    permittedTab: permittedTabNum()})
      chrome.tabs.remove(tab.id)
    }
  })
}

const createOverflow = (tabs) => {
  chrome.tabs.create({url: chrome.extension.getURL('overflow.html'), active: false},
  (tab) => {
    overflowId = tab.id;
    overflowWindow = tab.windowId;
    purgatoryTab = tabs[penultimateTabNum()];
  })
}

const doomedTab = (tabs, activeIndex) => {
  return (activeIndex === permittedTabNum()) ? tabs[penultimateTabNum()] : tabs[permittedTabNum()];
}

const updateOverflowTab = (tabs, tab) => {
  if (tabs.length > (permittedTabNum()) && overflowId === 0) createOverflow(tabs);
  chrome.tabs.query({active: true}, (activeTab) => {
    if (tabs.length > doomedTabNum()) {
      let activeIndex = activeTab[0].index;
      let dyingTab = doomedTab(tabs, activeIndex);
      chrome.tabs.sendMessage(overflowId, {type: 'SEND_TAB',
       tab:dyingTab, permittedTab: permittedTabNum()});
      chrome.tabs.remove(dyingTab.id);
    }
  })
};

// Listeners

const createdListen = (tab) => {
  if (overflowId > 0 && move) {
    chrome.tabs.move(tab.id, {index: numSafeTabs})
  }
  getAllTabs((tabs) => updateOverflowTab(tabs, tab))
  moveOverflowRight();
  move = true;
}

const removedListen = (tab, info) => {
  if (info.windowId === overflowWindow) {
    if (tab === overflowId) {
      overflowId = 0;
      overflowWindow = 0;
    }
    getAllTabs((tabs) => {
      if (overflowId > 0 && tabs.length < doomedTabNum()) {
        chrome.tabs.sendMessage(overflowId, {type: "FETCH_TAB", perm: permittedTabNum(),
      pen: penultimateTabNum()})
      }
    });
  }
}

const detachedListen = (tabId, info) => {
  if (tabId !== overflowId) {
    let dummy = {};
    dummy.windowId = info.oldWindowId
    removedListen(tabId, dummy)
  }
}

const attachedListen = (tabId, info) => {
  if (info.newWindowId === overflowWindow) {
    let dummy = {};
    dummy.id = tabId
    createdListen(dummy)
  }

  if (tabId === overflowId) {
    overflowWindow = info.newWindowId
    chrome.tabs.sendMessage(overflowId, {type: "UNPACK"})
  }
}


const messageListen = (message, sender) => {
  switch (message.type) {
    case "OPEN_TAB":
      if (message.idx) move = false;
      chrome.tabs.create({url: message.url, active: false, windowId: overflowWindow});
      break;
    case "DESTROY_OVERFLOW":
      chrome.tabs.remove(overflowId);
      overflowId = 0;
      overflowWindow = 0;
      break;
    case "REQUEST_PURGATORY":
      chrome.tabs.sendMessage(overflowId, {type: "SEND_TAB", tab: purgatoryTab,
    permittedTab: permittedTabNum()});
      purgatoryHandled = true;
      break;
    case "UNPACK_TABS":
      message.urlList.forEach((url) => {
        chrome.tabs.create({url: url, active: false, windowId: overflowWindow})
      })
      chrome.tabs.remove(overflowId)
      overflowId = 0;
      overflowWindow = 0;
      break;
    case "NUM_SAFE_TABS":
      numSafeTabs = message.num;
      break;
    case "NUM_TABS":
      numTabs = message.num;
      break;
    default:
      return true;
  }
}

// Activation/Deactivation

const pack = () => {
  getAllTabs((tabs) => {
    if (tabs.length > (permittedTabNum())) {
      chrome.tabs.create({url: chrome.extension.getURL('overflow.html'),
          active: false},
      (tab) => {
        overflowId = tab.id;
        overflowWindow = tab.windowId;
        setTimeout(() => {
          sendExtra(tabs)
        }, 100)
      })
    }
  })
}

const listenOn = () => {
  chrome.tabs.onRemoved.addListener(removedListen);
  chrome.runtime.onMessage.addListener(messageListen);
  chrome.tabs.onMoved.addListener(moveOverflowRight);
  chrome.tabs.onAttached.addListener(moveOverflowRight);
  chrome.tabs.onCreated.addListener(createdListen);
  chrome.tabs.onDetached.addListener(detachedListen);
  chrome.tabs.onAttached.addListener(attachedListen);
}

const closeListen = (message, sender) => {
  if (message.type = "UNPACK_TABS") {
    message.urlList.forEach((url) => {
      chrome.tabs.create({url: url, active: false})
    })
    chrome.tabs.remove(overflowId)
    overflowId = 0;
    overflowWindow = 0;
  }
}

chrome.browserAction.onClicked.addListener( () => {
  if (active) {
    chrome.storage.sync.set({activeStatus: false})
    chrome.runtime.onMessage.removeListener(messageListen);
    chrome.tabs.onCreated.removeListener(createdListen);
    chrome.tabs.onRemoved.removeListener(removedListen);
    chrome.tabs.onMoved.removeListener(moveOverflowRight);
    chrome.tabs.onAttached.removeListener(moveOverflowRight);
    chrome.tabs.onDetached.removeListener(detachedListen);
    chrome.tabs.onAttached.removeListener(attachedListen);
    chrome.runtime.onMessage.addListener(closeListen);
    chrome.browserAction.setIcon({path: "icons/icon-grey.png"});
    chrome.tabs.sendMessage(overflowId, {type: 'UNPACK'});
  } else {
    chrome.storage.sync.set({activeStatus: true})
    chrome.runtime.onMessage.removeListener(closeListen);
    listenOn();
    pack();
    chrome.browserAction.setIcon({path: "icons/icon.png"});
  }
  active = !active
})
