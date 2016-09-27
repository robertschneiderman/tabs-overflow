let overflowId = 0;
let overflowWindow = 0;
let purgatoryTab;
let purgatoryHandled = false;
let active = true;
let numSafeTabs = 3;

chrome.storage.sync.get('safeTabs', (data) => {
  if (Object.keys(data).length > 0) {
    numSafeTabs = data.safeTabs
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

let move = true;

const createdListen = (tab) => {
  if (overflowId > 0 && move) {
    chrome.tabs.move(tab.id, {index: numSafeTabs})
  }
  getAllTabs((tabs) => updateOverflowTab(tabs, tab))
  moveOverflowRight();
  move = true;
}

const getAllTabs = (call) => {
  chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, call)
};

const removedListen = (tab) => {
  if (tab === overflowId) {
    overflowId = 0;
    overflowWindow = 0;
  }
  getAllTabs((tabs) => {
    updateOverflowTab(tabs, tab);
    if (overflowId > 0 && tabs.length < 9) {
      chrome.tabs.sendMessage(overflowId, {type: "FETCH_TAB"})
    }
  });
}

const detachedListen = (tabId) => {
  if (tabId === overflowId) {
    chrome.tabs.sendMessage(overflowId, {type: "UNPACK"})
  } else {
    removedListen(tabId)
  }
}

const moveOverflowRight = () => {
  if (overflowId > 0) {
    chrome.tabs.move(overflowId, {index: 9});
  }
};

const updateOverflowTab = (tabs, tab) => {

  if (tabs.length > 8 && overflowId === 0) {
    chrome.tabs.create({url: chrome.extension.getURL('overflow.html'), active: false},
    (tab) => {
      overflowId = tab.id;
      overflowWindow = tab.windowId;
      purgatoryTab = tabs[7];
    })
  }

  let activeIndex = 0;

  chrome.tabs.query({active: true}, (babs) => {
    activeIndex = babs[0].index
    if (tabs.length > 9) {
      let doomedTab;
      if (activeIndex === 7) {
        doomedTab = tabs[7];
      } else {
        doomedTab = tabs[8];
      }

      if (activeIndex === 8) {
        doomedTab = tabs[7];
      }
      console.log([doomedTab.index, activeIndex]);
      chrome.tabs.sendMessage(overflowId, {type: 'SEND_TAB', tab: doomedTab});
      chrome.tabs.remove(doomedTab.id);
    }
  })
};

const messageListen = (message, sender) => {
  switch (message.type) {
    case "ACTIVATE_TAB":
      chrome.tabs.update(message.tabId, {active: true});
      break;
    case "OPEN_TAB":
      console.log(message.idx);
      if (message.idx) {
        move = false;
      }
      chrome.tabs.create({url: message.url, active: false, windowId: overflowWindow});
      break;
    case "DESTROY_OVERFLOW":
      chrome.tabs.remove(overflowId);
      overflowId = 0;
      overflowWindow = 0;
      break;
    case "REQUEST_PURGATORY":
      chrome.tabs.sendMessage(overflowId, {type: "SEND_TAB", tab: purgatoryTab});
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
    // case "SHOW_NUMBERS":
    //   getAllTabs(tabs => {
    //     tabs.forEach(tab => {
    //       chrome.tabs.sendMessage(tab.id, {type: "PREPEND_TITLE", tab: tab});
    //     });
    //   });
    //   break;
    // case "REMOVE_NUMBERS":
    //   getAllTabs(tabs => {
    //     tabs.forEach(tab => {
    //       chrome.tabs.sendMessage(tab.id, {type: "SHORTEN_TITLE", tab: tab});
    //     });
    //   });
    //   break;
    case "NUM_SAFE_TABS":
      numSafeTabs = message.num;
      break;
    default:
      return true;
  }
}

const pack = () => {
  getAllTabs((tabs) => {
    if (tabs.length > 8) {
      chrome.tabs.create({url: chrome.extension.getURL('overflow.html'), active: false, index: 8},
      (tab) => {
        overflowId = tab.id;
        overflowWindow = tab.windowId
        setTimeout(() => {
          tabs.forEach((tab) => {
            if (tab.index > 8) {
              chrome.tabs.sendMessage(overflowId, {type: "SEND_TAB", tab: tab})
              chrome.tabs.remove(tab.id)
            }
          })
        }, 1000)
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
    chrome.tabs.onDetached.removeListener(detachedListen)
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
