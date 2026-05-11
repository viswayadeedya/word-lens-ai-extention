const input = document.getElementById('apiKey');
const status = document.getElementById('status');

// Load saved key
chrome.storage.sync.get('apiKey', ({ apiKey }) => {
  if (apiKey) input.value = apiKey;
});

document.getElementById('save').addEventListener('click', () => {
  const key = input.value.trim();
  if (!key) {
    status.textContent = 'Please enter an API key.';
    status.className = 'status error';
    return;
  }
  if (!key.startsWith('gsk_')) {
    status.textContent = 'Key should start with gsk_';
    status.className = 'status error';
    return;
  }
  chrome.storage.sync.set({ apiKey: key }, () => {
    status.textContent = '✓ Saved successfully';
    status.className = 'status success';
    setTimeout(() => { status.textContent = ''; status.className = 'status'; }, 2500);
  });
});
