let flag = true;
let overflowId = 0;

chrome.tabs.onCreated.addListener(tab => {
  chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, updateOverflowTab)
});

chrome.tabs.onRemoved.addListener(tab => {
  chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, updateOverflowTab);
  updateTabTitles()
})

const updateTabTitles = () => {
  chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {type: "AMEND_TITLE", index: tab.index})
    })
  })
}

const updateOverflowTab = (tabs) => {

  if (tabs.length > 8 && flag) {
    chrome.tabs.create({url: chrome.extension.getURL('overflow.html'), active: true},
    (tab) => {
      overflowId = tab.id;
    })
    flag = false;
  } else {
    chrome.tabs.sendMessage(overflowId, {type: "SEND_TABS", tabs: tabs});
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
    default:
      console.log('hooray!');
  }
})
