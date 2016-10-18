let overflowId = 0;
let overflowWindow = 0;
let purgatoryTab;
let purgatoryHandled = false;
let active = true;
let numSafeTabs = 3;
let penultimateTabNum = 11;
let permittedTabNum = 12;
let doomedTabNum = 13;


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

const removedListen = (tab, info) => {
  if (info.windowId === overflowWindow) {
    if (tab === overflowId) {
      overflowId = 0;
      overflowWindow = 0;
    }
    getAllTabs((tabs) => {
      updateOverflowTab(tabs, tab);
      if (overflowId > 0 && tabs.length < doomedTabNum) {
        chrome.tabs.sendMessage(overflowId, {type: "FETCH_TAB"})
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
    overflowWindow = info.newWIndowId
    chrome.tabs.sendMessage(overflowId, {type: "UNPACK"})
  }
}

const moveOverflowRight = () => {
  if (overflowId > 0) {
    chrome.tabs.move(overflowId, {index: doomedTabNum});
  }
};

const updateOverflowTab = (tabs, tab) => {

  if (tabs.length > (permittedTabNum) && overflowId === 0) {
    chrome.tabs.create({url: chrome.extension.getURL('overflow.html'), active: false},
    (tab) => {
      overflowId = tab.id;
      overflowWindow = tab.windowId;
      purgatoryTab = tabs[penultimateTabNum];
    })
  }

  let activeIndex = 0;

  chrome.tabs.query({active: true}, (babs) => {
    activeIndex = babs[0].index
    if (tabs.length > doomedTabNum) {
      let doomedTab;
      if (activeIndex === penultimateTabNum) {
        doomedTab = tabs[penultimateTabNum];
      } else {
        doomedTab = tabs[(permittedTabNum)];
      }

      if (activeIndex === (permittedTabNum)) {
        doomedTab = tabs[penultimateTabNum];
      }
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
    if (tabs.length > (permittedTabNum)) {
      chrome.tabs.create({url: chrome.extension.getURL('overflow.html'), active: false, index: (permittedTabNum)},
      (tab) => {
        overflowId = tab.id;
        overflowWindow = tab.windowId
        setTimeout(() => {
          tabs.forEach((tab) => {
            if (tab.index > (permittedTabNum)) {
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
