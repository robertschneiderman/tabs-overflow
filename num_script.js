// chrome.runtime.onMessage.addListener(message => {
//   let title = document.querySelector("title")
//   switch (message.type) {
//     case "PREPEND_TITLE":
//       title.innerHTML = `${message.tab.index + 1} ${message.tab.title}`
//       break;

//     case "SHORTEN_TITLE":
//       title.innerHTML = `${message.tab.title}`.slice(2);
//       break;
//     default:
//   }
// });


// document.addEventListener('keydown', (e) => {
//   if (e.which === 18) {
//     chrome.runtime.sendMessage(null, {type: 'SHOW_NUMBERS'})
//   }
// });

// document.addEventListener('keyup', (e) => {
//   if (e.which === 18) {
//     chrome.runtime.sendMessage(null, {type: 'REMOVE_NUMBERS'});
//   }
// });