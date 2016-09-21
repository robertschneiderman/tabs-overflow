let overflowExists = false;
let overflowId = 0;

chrome.tabs.onCreated.addListener(tab => {
  handleTabCreate(tab)
});

const handleTabCreate = (tab) => {
  getAllTabs(updateOverflowTab)
}

const getAllTabs = (call) => {
  chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, call)
}

chrome.tabs.onRemoved.addListener(tab => {
  getAllTabs((tabs) => {
    updateOverflowTab(tabs)
    if (overflowExists && tabs.length < 9) {
      chrome.tabs.sendMessage(overflowId, {type: "FETCH_TAB"})
    }
  })
  updateTabTitles()
})

const updateTabTitles = () => {
  getAllTabs((tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {type: "AMEND_TITLE", index: tab.index})
    })
  })
}

const updateOverflowTab = (tabs) => {

  if (tabs.length > 8 && !overflowExists) {
    chrome.tabs.create({url: chrome.extension.getURL('overflow.html'), active: true},
    (tab) => {
      overflowId = tab.id;
    })
    overflowExists = true;
  }

  if (tabs.length > 9) {
    doomedTab = tabs[3]
    chrome.tabs.sendMessage(overflowId, {type: 'SEND_TABS', tabs: [doomedTab]});
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
    case "REQUEST_TABS":
      chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, updateOverflowTab)
      break;
    case "OPEN_TAB":
      chrome.tabs.create({url: message.url, index: 7});
      break;
    default:
      console.log('hooray!');
  }
})
