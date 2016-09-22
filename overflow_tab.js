chrome.runtime.onMessage.addListener(message => {
  let title;
  let titleI;
  switch (message.type) {
      case "SET_TITLE":
        title = document.querySelector("title")
        titleI = title.innerHTML
        title.innerHTML = `${message.index + 1}` + " " + titleI
        break;
      case "AMEND_TITLE":
        title = document.querySelector("title")
        titleI = title.innerHTML
        titleI = titleI.split(" ").slice(1).join(" ")
        title.innerHTML = `${message.index + 1}` + " " + titleI
        break;
      case "FETCH_TAB":
        selId = nodeList.shift().getAttribute('data-id')
        selItem = document.querySelector(`[data-id="${selId}"]`)
        let url = selItem.getAttribute('data-url');
        chrome.runtime.sendMessage({type: "OPEN_TAB", url: url});
        selItem.remove();
        let li = document.querySelectorAll('li')
        if (li.length === 0) {
          chrome.runtime.sendMessage({type: "DESTROY_OVERFLOW"})
        }
        break;
    default:
      console.log('hooray!');
  }
});
chrome.runtime.sendMessage({type: "UPDATE_TITLE"})
