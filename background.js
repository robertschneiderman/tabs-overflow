let overflowExists = false;
let overflowId = 0;
let purgatoryTab;
let purgatoryHandled = false;

chrome.tabs.onCreated.addListener(tab => {
  getAllTabs(updateOverflowTab)
  moveOverflowRight();
});

const getAllTabs = (call) => {
  chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, call)
};

chrome.tabs.onRemoved.addListener(tab => {
  getAllTabs((tabs) => {
    updateOverflowTab(tabs);
    if (overflowExists && tabs.length < 9) {
      chrome.tabs.sendMessage(overflowId, {type: "FETCH_TAB"})
    }
  });
  updateTabTitles();
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


const updateTabTitles = () => {
  getAllTabs((tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {type: "AMEND_TITLE", index: tab.index})
    });
  });
};

const updateOverflowTab = (tabs) => {

  if (tabs.length > 8 && !overflowExists) {
    chrome.tabs.create({url: chrome.extension.getURL('overflow.html')},
    (tab) => {
      overflowId = tab.id;
      purgatoryTab = tabs[3];
    })
    overflowExists = true;
  }

  if (tabs.length > 9) {
    doomedTab = tabs[3]
    chrome.tabs.sendMessage(overflowId, {type: 'SEND_TAB', tab: doomedTab});
    chrome.tabs.remove(doomedTab.id);
  }
};


chrome.runtime.onMessage.addListener((message, sender) => {
  switch (message.type) {
    case "ACTIVATE_TAB":
      chrome.tabs.update(message.tabId, {active: true});
      break;
    case "UPDATE_TITLE":
      chrome.tabs.sendMessage(sender.tab.id, {type: "SET_TITLE", index: sender.tab.index});
      break;
    case "OPEN_TAB":
      chrome.tabs.create({url: message.url, index: 7});
      break;
    case "DESTROY_OVERFLOW":
      chrome.tabs.remove(overflowId);
      overflowExists = false;
      break;
    case "REQUEST_PURGATORY":
        chrome.tabs.sendMessage(overflowId, {type: "SEND_TAB", tab: purgatoryTab});
        purgatoryHandled = true;
      break;
    default:
  }
})
