let overflowId = 0;
let purgatoryTab;
let purgatoryHandled = false;
let active = true;

const createdListen = (tab) => {
  getAllTabs((tabs) => updateOverflowTab(tabs, tab))
  if (overflowId > 0) {
    chrome.tabs.move(tab.id, {index: 3})
  }
  moveOverflowRight();
}

const getAllTabs = (call) => {
  chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, call)
};

const removedListen = (tab) => {
  if (tab === overflowId) {
    overflowId = 0;
  }
  getAllTabs((tabs) => {
    updateOverflowTab(tabs, tab);
    if (overflowId > 0 && tabs.length < 9) {
      chrome.tabs.sendMessage(overflowId, {type: "FETCH_TAB"})
    }
  });
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
      purgatoryTab = tabs[7];
    })
  }

  if (tabs.length > 9) {
    let doomedTab = tabs[7]
    if (tab.index === 8) {
      doomedTab = tabs[6];
    } else {
      doomedTab = tabs[7];
    }
    chrome.tabs.sendMessage(overflowId, {type: 'SEND_TAB', tab: doomedTab});
    chrome.tabs.remove(doomedTab.id);
  }
};

const messageListen = (message, sender) => {
  switch (message.type) {
    case "ACTIVATE_TAB":
      chrome.tabs.update(message.tabId, {active: true});
      break;
    case "OPEN_TAB":
      chrome.tabs.create({url: message.url, index: 3, active: false});
      break;
    case "DESTROY_OVERFLOW":
      chrome.tabs.remove(overflowId);
      overflowId = 0;
      break;
    case "REQUEST_PURGATORY":
      chrome.tabs.sendMessage(overflowId, {type: "SEND_TAB", tab: purgatoryTab});
      purgatoryHandled = true;
      break;
    case "SHOW_NUMBERS":
      getAllTabs(tabs => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {type: "PREPEND_TITLE", tab: tab});
        });
      });
      break;
    case "REMOVE_NUMBERS":
      getAllTabs(tabs => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {type: "SHORTEN_TITLE", tab: tab});
        });
      });
      break;
    default:
  }
}

const pack = () => {
  chrome.tabs.create({url: chrome.extension.getURL('overflow.html'), active: false, index: 8},
  (tab) => {
    overflowId = tab.id;
  })
  setTimeout( () => {
    getAllTabs((tabs) => {
      tabs.forEach((tab) => {
        if (tab.index > 8) {
          chrome.tabs.sendMessage(overflowId, {type: "SEND_TAB", tab: tab})
          chrome.tabs.remove(tab.id)
        }
      })
    })
  }, 1000)
}

const unpack = () => {
}

const listenOn = () => {
  chrome.tabs.onRemoved.addListener(removedListen);
  chrome.runtime.onMessage.addListener(messageListen);
  chrome.tabs.onMoved.addListener(moveOverflowRight);
  chrome.tabs.onAttached.addListener(moveOverflowRight);
  chrome.tabs.onCreated.addListener(createdListen);
}

listenOn()

chrome.browserAction.onClicked.addListener( () => {
  if (active) {
    chrome.runtime.onMessage.removeListener(messageListen);
    chrome.tabs.onCreated.removeListener(createdListen);
    chrome.tabs.onRemoved.removeListener(removedListen);
    chrome.tabs.onMoved.removeListener(moveOverflowRight);
    chrome.tabs.onAttached.removeListener(moveOverflowRight);
    upack();
  } else {
    listenOn();
    pack();
  }
  active = !active
})
