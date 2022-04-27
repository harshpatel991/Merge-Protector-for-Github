const DISABLED_COLOR = 'rgb(161 161 161)';
const DISABLED_BACKGROUND_COLOR = 'rgb(215 217 219)';
const SHEILD_CROSS_ICON_HTML = `<svg xmlns="http://www.w3.org/2000/svg" style="color: ${DISABLED_COLOR}; float: left; margin-right: 5px;" width="20" height="20" fill="currentColor" class="bi bi-shield-fill-x" viewBox="0 0 16 16"><path d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zM6.854 5.146 8 6.293l1.146-1.147a.5.5 0 1 1 .708.708L8.707 7l1.147 1.146a.5.5 0 0 1-.708.708L8 7.707 6.854 8.854a.5.5 0 1 1-.708-.708L7.293 7 6.146 5.854a.5.5 0 1 1 .708-.708z"/></svg>`;
const SHIELD_CHECK_ICON_HTML = '<svg xmlns="http://www.w3.org/2000/svg" style="color: white; float: left; margin-right: 5px;" width="20" height="20" fill="currentColor" class="bi bi-shield-fill-check" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zm2.146 5.146a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647z"/></svg>';
const MAX_SEARCH_FOR_BUTTON_ITERATIONS = 20;
const SLEEP_BETWEEN_SEARCH_MS = 800;
const SQUASH = 'squash';
const MERGE = 'merge';
const REBASE = 'rebase';
const MERGING_WAYS = [SQUASH, MERGE, REBASE];

var buttonVisibilityInterval;

let configs = {
    applyToRepositories: [],
    branchesAllowingOnlyMerge: ['master', 'PROD', 'UAT'],
    branchesAllowingOnlySquash: ['main'],
    branchesAllowingOnlyRebase: [],
    otherBranchesDefault: 'squash'
}

var currentSearchForButtonInteration = 0;

function main() {
    chrome.storage.sync.get('configs', function (data) {
        data = data["configs"];

        configs = { ...configs, ...data };

        //check if the repository is allowed
        if (configs !== undefined && configs.applyToRepositories !== undefined && configs.applyToRepositories.length != 0) {
            //get the repository name
            let repositoryName = $(document.querySelectorAll(`[itemprop='author']`)).text().trim() + "/" + $(document.querySelectorAll(`[itemprop='name']`)).text().trim();

            //check to see if the name is in the list
            if (!configs.applyToRepositories.includes(repositoryName)) {
                return;
            }
        }

        buttonVisibilityInterval = setInterval(pollForButtonVisibility, SLEEP_BETWEEN_SEARCH_MS);
    });

}

function pollForButtonVisibility() {
    const button = getElementByXpath('(//button[contains(@class,"btn-group-merge")])');
    if (button != null) {
        disableAndEnableButtons();
        clearInterval(buttonVisibilityInterval);
        return;
    }

    currentSearchForButtonInteration++;

    if (currentSearchForButtonInteration >= 10) {
        clearInterval(buttonVisibilityInterval);
    }
}

function disableAndEnableButtons() {
    const baseRef = $('.base-ref').text();

    if (configs.branchesAllowingOnlyMerge.includes(baseRef)) {
        enableSingleButtonDisableOthers(MERGE);
    } else if (configs.branchesAllowingOnlySquash.includes(baseRef)) {
        enableSingleButtonDisableOthers(SQUASH);
    } else if (configs.branchesAllowingOnlyRebase.includes(baseRef)) {
        enableSingleButtonDisableOthers(REBASE);
    } else {
        enableSingleButtonDisableOthers(configs.otherBranchesDefault);
    }
}

function enableSingleButtonDisableOthers(buttonToEnable) {
    MERGING_WAYS.forEach(element => {
        if (element == buttonToEnable) {
            enableWay(element);
        } else {
            disableWay(element);
        }
    });
}


function disableWay(mergeWay) {
    var icon1 = $(SHEILD_CROSS_ICON_HTML).get(0);
    var icon2 = $(SHEILD_CROSS_ICON_HTML).get(0);

    //find the dropdown button
    const selectButton = getElementByXpath('(//button[@value="' + mergeWay + '" and @type="button"])[1]');
    console.log(selectButton);

    //find the actual button that a user clicks on to perform the action (this button can be hidden depending on which option was selected)
    const button = getElementByXpath('(//button[contains(@class,"btn-group-' + mergeWay + '")])');
    console.log(button);

    selectButton.insertBefore(icon1, selectButton.firstChild);
    selectButton.style.pointerEvents = "none";
    selectButton.style.color = DISABLED_COLOR;
    selectButton.style.backgroundColor = DISABLED_BACKGROUND_COLOR;

    button.insertBefore(icon2, button.firstChild);
    button.style.pointerEvents = "none";
    button.style.cursor = 'not-allowed';
    button.style.color = DISABLED_COLOR;
    button.style.backgroundColor = DISABLED_BACKGROUND_COLOR;
}

function enableWay(mergeWay) {
    var icon = $(SHIELD_CHECK_ICON_HTML).get(0);

    const button = getElementByXpath('(//button[contains(@class,"btn-group-' + mergeWay + '")])');
    button.insertBefore(icon, button.firstChild);
}

function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

main();