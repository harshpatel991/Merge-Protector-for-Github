let configs = {
  applyToRepositories: [],
  branchesAllowingOnlyMerge: ['master', 'PROD', 'UAT'],
  branchesAllowingOnlySquash: ['main'],
  branchesAllowingOnlyRebase: [],
  otherBranchesDefault: 'squash'
}

//load settings to display
chrome.storage.sync.get('configs', function (data) {
  data = data["configs"];

  configs = { ...configs, ...data };

  //now update the view
  for (const config in configs) {
    document.getElementById(config).value = configs[config];
  }
});

window.addEventListener('load', (event) => {
  document.getElementById("saveButton").addEventListener("click", onSaveClick);
});

//on click, save settings
function onSaveClick() {
  //get items from the view and update the configs
  for (const config in configs) {
    let saveValue = document.getElementById(config).value.split(",");
    saveValue = saveValue.map(value => value.trim());
    saveValue = saveValue.filter(function (el) { return saveValue != ""; });
    configs[config] = saveValue;
  }

  chrome.storage.sync.set({ configs: configs });

  document.getElementById("saveStatus").innerHTML = "Saved!";
}

