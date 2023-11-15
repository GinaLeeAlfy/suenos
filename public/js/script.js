const wishContainer = document.querySelector('.wish-container');
const spinner = document.querySelector('.loading-bar');
const textArea = document.querySelector('#new-wish');
const submit = document.querySelector('footer button');

const TOOLTIP_WIDTH = 293;
let totalWishes;
let isStarsAdded = false;
let waiting;
const wishesDisplayed = [];
let wishData = [];
const maxLines = 8;

function calcQuantityWishes() {
    let wishContainerHeight = wishContainer.offsetHeight;
    let wishContainerWidth = wishContainer.offsetWidth;
    totalWishes = Math.round(
        ((wishContainerHeight * wishContainerWidth) / 1600) * 0.1
    );
    return totalWishes;
}

async function getWishData(totalWishes) {
    const promise = await fetch('/api/wishes');
    const processedResponse = await promise.json();
    wishData = await processedResponse;

    for (let index = 0; index < wishData.length; index++) {
        createWishEl(wishData[index]);
    }
    addListenerOnStars();
    isStarsAdded = true;

    setLoading(false);
}

function createWishEl(apiWish) {
    //create wish element
    let wishContainerHeight = wishContainer.offsetHeight;
    let wishContainerWidth = wishContainer.offsetWidth;
    const wishStar = document.createElement('div');
    const tooltip = document.createElement('div');
    const wishContent = document.createElement('div');
    const wishLike = document.createElement('button');
    wishStar.classList.add('wish-star');
    tooltip.classList.add('wish-tooltip');
    wishContent.classList.add('wish-content');

    let splitWishText = apiWish.content.split('\n');
    splitWishText.forEach((element) => {
        let pTag = document.createElement('p');
        pTag.innerHTML = element;
        wishContent.append(pTag);
    });

    wishLike.innerHTML = '&#10084;';

    tooltip.append(wishContent);
    tooltip.append(wishLike);
    wishStar.append(tooltip);

    let topLocation = calcLocation(wishContainerHeight);
    let leftLocation = calcLocation(wishContainerWidth);

    wishStar.style.top = `${topLocation}px`;
    wishStar.style.left = `${leftLocation}px`;

    let halfWishContainerHeight = wishContainerHeight / 2;
    let halfWishContainerWidth = wishContainerWidth / 2;

    //position tooltip vertically
    if (topLocation >= halfWishContainerHeight) {
        tooltip.classList.add('tooltip-bottom');
    } else {
        tooltip.classList.add('tooltip-top');
    }

    //position tooltip horizontally
    if (leftLocation >= halfWishContainerWidth) {
        tooltip.classList.add('tooltip-right');
    } else {
        tooltip.classList.add('tooltip-left');
    }

    //if screen is too small position tooltip horizontal differently
    if (wishContainerWidth <= TOOLTIP_WIDTH * 2) {
        if (leftLocation >= halfWishContainerWidth) {
            tooltip.style.right = `${
                (wishContainerWidth - leftLocation) * -1 + 15
            }px`;
        } else {
            tooltip.style.left = `${leftLocation * -1 + 7}px`;
        }
        tooltip.classList.remove('tooltip-right', 'tooltip-left');
    }

    wishContainer.append(wishStar);

    const wishStarObject = {
        wishStar: wishStar,
        coordinates: [topLocation, leftLocation],
        id: apiWish.id,
        content: apiWish.content,
        votes: apiWish.votes,
    };

    //no duplicates
    if (wishesDisplayed < 1) {
        wishesDisplayed.push(wishStarObject);
    } else {
        let isExisting = false;
        wishesDisplayed.forEach((element) => {
            if (
                JSON.stringify(element.coordinates).includes(
                    JSON.stringify(wishStarObject.coordinates)
                )
            ) {
                isExisting = true;
            }
        });
        if (isExisting == false) {
            wishesDisplayed.push(wishStarObject);
        }
    }
}

function calcLocation(length) {
    let randomSpot = Math.floor((length - 40) * Math.random()) + 15;

    return randomSpot;
}

function removeStars() {
    while (wishesDisplayed.length > 0) {
        wishContainer.removeChild(wishesDisplayed.pop().wishStar);
    }
    isStarsAdded == false;
}

function addStars() {
    removeStars();
    calcQuantityWishes();
    getWishData();
}

function waitAddStars() {
    if (isStarsAdded == true) {
        waiting = setTimeout(() => {
            addStars();
        }, 1000);
    }
}

function addListenerOnStars() {
    wishesDisplayed.forEach((element) => {
        element.wishStar.addEventListener('click', (event) => {
            if (event.target.tagName == 'BUTTON') {
                event.target.classList.toggle('liked');
                if (!event.target.classList.contains('liked')) {
                    // grab element.id add like to api
                } else {
                    // grab element id remove like from api element.likes--;
                }
            } else {
                element.wishStar.classList.toggle('visible');
            }
            console.log(event.target.tagName);
        });
    });
}

function setLoading(isLoading) {
    spinner.classList.toggle('show', isLoading);
}

function checkLines() {
    let linesUsed = textArea.value.split('\n');
    console.log(linesUsed);
    if (linesUsed.length >= maxLines) {
        let newLines = linesUsed.slice(0, maxLines);
        let newValue = newLines.join('\n');
        textArea.value = newValue;
    }
}

addStars();

window.onresize = function () {
    clearTimeout(waiting);
    waitAddStars();
};
