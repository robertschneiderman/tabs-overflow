let overflowExists = false;
let overflowId = 0;
let purgatoryTab;
let purgatoryHandled = false;

chrome.tabs.onCreated.addListener(tab => {
  getAllTabs((tabs) => updateOverflowTab(tabs, tab))
  chrome.tabs.move(tab.id, {index: 3})
  moveOverflowRight();
});

const getAllTabs = (call) => {
  chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, call)
};

chrome.tabs.onRemoved.addListener(tab => {
  getAllTabs((tabs) => {
    updateOverflowTab(tabs, tab);
    if (overflowExists && tabs.length < 9) {
      chrome.tabs.sendMessage(overflowId, {type: "FETCH_TAB"})
    }
  });
});

const moveOverflowRight = () => {
  if (overflowId > 0) {
    chrome.tabs.move(overflowId, {index: 9});
  }
};

chrome.tabs.onMoved.addListener(() => {
  moveOverflowRight();
});

chrome.tabs.onAttached.addListener(() => {
  moveOverflowRight();
});

const updateOverflowTab = (tabs, tab) => {

  if (tabs.length > 8 && !overflowExists) {
    chrome.tabs.create({url: chrome.extension.getURL('overflow.html'), active: false},
    (tab) => {
      overflowId = tab.id;
      purgatoryTab = tabs[7];
    })
    overflowExists = true;
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


chrome.runtime.onMessage.addListener((message, sender) => {
  switch (message.type) {
    case "ACTIVATE_TAB":
      chrome.tabs.update(message.tabId, {active: true});
      break;
    // case "UPDATE_TITLE":
    //   chrome.tabs.sendMessage(sender.tab.id, {type: "SET_TITLE", index: sender.tab.index});
    //   break;
    case "OPEN_TAB":
      chrome.tabs.create({url: message.url, index: 3, active: false});
      break;
    case "DESTROY_OVERFLOW":
      chrome.tabs.remove(overflowId);
      overflowExists = false;
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
})
