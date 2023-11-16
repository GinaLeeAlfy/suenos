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

async function sendWish(wish) {
    setLoading(true);
    const promise = await fetch('/api/wishes', {
        method: 'POST',
        body: JSON.stringify({ content: wish }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    //ToDo when we check wishes
    // const processedResponse = await promise.json();
    // isWishValid = await processedResponse.validWish;
    // if (isWishValid == true) {
    //     //do animation
    // }
    setLoading(false);
}
async function sendLike(id, votes) {
    setLoading(true);
    const promise = await fetch(`/api/wishes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ votes: votes }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    setLoading(false);
}

function createWishEl(apiWish) {
    let starSize = `${determineStarSize(apiWish.votes / 30, 1, 8)}px`;
    //create wish element
    let wishContainerHeight = wishContainer.offsetHeight;
    let wishContainerWidth = wishContainer.offsetWidth;
    const wish = document.createElement('div');
    const wishStar = document.createElement('div');
    const tooltip = document.createElement('div');
    const wishContent = document.createElement('div');
    const wishLike = document.createElement('button');
    const pTag = document.createElement('p');

    wish.classList.add('wish');
    wishStar.classList.add('wish-star');
    tooltip.classList.add('wish-tooltip');
    wishContent.classList.add('wish-content');

    pTag.innerHTML = apiWish.content;
    wishLike.innerHTML = '&#10084;';
    wishStar.style.setProperty('--star-size', starSize);
    wishStar.style.setProperty(
        '--twinkle-duration',
        Math.ceil(genRandomNumber(1, 5)) + 's'
    );
    wishStar.style.setProperty(
        '--twinkle-delay',
        Math.ceil(genRandomNumber(1, 5)) + 's'
    );

    wishContent.append(pTag);
    tooltip.append(wishContent);
    tooltip.append(wishLike);
    wish.append(wishStar);
    wish.append(tooltip);

    let topLocation = calcLocation(wishContainerHeight);
    let leftLocation = calcLocation(wishContainerWidth);

    wish.style.top = `${topLocation}px`;
    wish.style.left = `${leftLocation}px`;

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

    wishContainer.append(wish);

    const wishStarObject = {
        wish: wish,
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
        wishContainer.removeChild(wishesDisplayed.pop().wish);
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
        element.wish.addEventListener('click', (event) => {
            if (event.target.tagName == 'BUTTON') {
                if (!event.target.classList.contains('liked')) {
                    // grab element.id add like to api
                    element.votes++;
                    sendLike(element.id, element.votes);
                } else {
                    // grab element id remove like from api element.likes--;
                    element.votes--;
                    sendLike(element.id, element.votes);
                }
                event.target.classList.toggle('liked');
            } else {
                element.wish.classList.toggle('visible');
            }
        });
    });
}

function setLoading(isLoading) {
    spinner.classList.toggle('show', isLoading);
}

function removeLineBreaks() {
    let newValue = textArea.value.split('\n').join('');
    textArea.value = newValue;
}

const determineStarSize = (likes, min, max) => {
    return Math.min(Math.max(likes, min), max);
};

const genRandomNumber = (min, max) => {
    return Math.random() * (max - min) + min;
};

submit.addEventListener('click', () => {
    //send new wish to api
    if (textArea.value.length > 0) {
        sendWish(textArea.value);
        textArea.value = '';
    }
});

addStars();

window.onresize = function () {
    clearTimeout(waiting);
    waitAddStars();
};
