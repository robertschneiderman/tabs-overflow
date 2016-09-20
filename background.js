let flag = true;
let overflowId = 0;

chrome.tabs.onCreated.addListener(tab => {
  chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, updateOverflowTab)
  chrome.tabs.sendMessage(tab.id, {type: "ADJUST_TITLE", index: tab.index});
});

const updateOverflowTab = (tabs) => {

  if (tabs.length > 8 && flag) {
    chrome.tabs.create({url: chrome.extension.getURL('overflow.html'), active: true},
    (tab) => {
      overflowId = tab.id
      chrome.tabs.sendMessage(tab.id, {type: "SEND_TABS", tabs: tabs});
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
    case "UPDATE_TAB":
      // chrome.tabs.sendMessage(sender.id, {type: "ADJUST_TITLE", index: sender.index});
      // break;
    default:
      console.log('hooray!');
  }
})
