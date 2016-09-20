let flag = true;
let overflowId = 0;

chrome.tabs.onCreated.addListener(tab => {
  chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, updateOverflowTab)
});

const updateOverflowTab = (tabs) => {

  if (tabs.length > 8 && flag) {
    chrome.tabs.create({url: chrome.extension.getURL('overflow.html'), active: true},
    (tab) => {
      overflowId = tab.id;
      chrome.tabs.sendMessage(tab.id, {type: "SEND_TABS", tabs: tabs});
    })
    flag = false;
  } else {
    console.log(overflowId);
    chrome.tabs.sendMessage(overflowId, {type: "SEND_TABS", tabs: tabs});
  }
};


chrome.runtime.onMessage.addListener((message, sender) => {
  switch (message.type) {
    case "ACTIVATE_TAB":
      chrome.tabs.update(message.tabId, {active: true});
      break;
    case "UPDATE_TAB":
      chrome.tabs.sendMessage(sender.tab.id, {type: "ADJUST_TITLE", index: sender.tab.index});
      break;
    case "REQUEST_TABS":
      chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, updateOverflowTab)
      break;
    default:
      console.log('hooray!');
  }
})
