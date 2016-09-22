document.addEventListener('keydown', (e) => {
  console.log("e:", e);
  console.log("e.which:", e.which);
  if (e.which === 91) {
    chrome.runtime.sendMessage(null, {type: 'SHOW_NUMBERS', showTabNumber: true})
  }
});

document.addEventListener('keyup', (e) => {
  chrome.runtime.sendMessage(null, {type: 'SHOW_NUMBERS', showTabNumber: false})
});