const wishContainer = document.querySelector('.wish-container');
const textArea = document.querySelector('#new-wish');
const submit = document.querySelector('footer button');
const profanityAlert = document.querySelector('.profanity');
const profanityAlertButton = document.querySelector('.profanity button');

let isStarsAdded = false;
let waiting;
const wishesDisplayed = [];

//determine number of wishes based on area of wish container
function calcQuantityWishes() {
    let wishContainerHeight = wishContainer.offsetHeight;
    let wishContainerWidth = wishContainer.offsetWidth;
    const totalWishes = Math.round(
        ((wishContainerHeight * wishContainerWidth) / 1600) * 0.1
    );
    return totalWishes;
}

//get wishData from api
async function getWishData(totalWishes) {
    setLoading(true);
    const promise = await fetch(`/api/wishes?limit=${totalWishes}`);
    const wishData = await promise.json();

    for (let index = 0; index < wishData.length; index++) {
        createWishEl(wishData[index]);
    }
    addListenerOnStars();
    isStarsAdded = true;

    setLoading(false);
}

//add new wish to api
async function sendWish(wish) {
    setLoading(true);
    const promise = await fetch('/api/wishes', {
        method: 'POST',
        body: JSON.stringify({ content: wish }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    // ToDo when we check wishes
    const isWishValid = await promise.status;
    console.log(isWishValid);
    if (promise.ok) {
        //do animation
    } else if (promise.status === 400) {
        profanityAlert.classList.remove('hidden');
    } else {
        alert('Sorry there was a server error');
        //server error
    }

    setLoading(false);
}

//update votes for wish
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

//create wish element
function createWishEl(apiWish) {
    let starSize = `${determineStarSize(apiWish.votes / 30, 1, 8)}px`;
    let wishContainerHeight = wishContainer.offsetHeight;
    let wishContainerWidth = wishContainer.offsetWidth;

    const wish = document.createElement('div');
    const wishStar = document.createElement('div');
    const wishContent = document.createElement('div');
    const wishLike = document.createElement('button');
    const pTag = document.createElement('p');

    wish.classList.add('wish');
    wishStar.classList.add('wish-star');
    wishContent.classList.add('wish-content');

    //add wish text
    pTag.innerHTML = apiWish.content;
    wishLike.innerHTML = '&#10084;';

    //set star attributes
    wishStar.style.setProperty('--star-size', starSize);
    wishStar.style.setProperty(
        '--twinkle-duration',
        Math.ceil(genRandomNumber(1, 5)) + 's'
    );
    wishStar.style.setProperty(
        '--twinkle-delay',
        Math.ceil(genRandomNumber(1, 5)) + 's'
    );

    //append the content to wishes
    wishContent.append(pTag);
    wish.append(wishStar);

    //choose top and left location of wish
    let topLocation = calcLocation(wishContainerHeight);
    let leftLocation = calcLocation(wishContainerWidth);

    wish.style.top = `${topLocation}px`;
    wish.style.left = `${leftLocation}px`;

    //create tooltip based on location of wish
    let tooltip = createToolTip(
        topLocation,
        leftLocation,
        wishContainerHeight,
        wishContainerWidth
    );

    tooltip.append(wishContent);
    tooltip.append(wishLike);
    wish.append(tooltip);
    wishContainer.append(wish);

    //make wishStarObject to store in wishesDisplayed
    const wishStarObject = {
        wish: wish,
        coordinates: [topLocation, leftLocation],
        id: apiWish.id,
        content: apiWish.content,
        votes: apiWish.votes,
    };

    //no duplicates
    if (wishesDisplayed.length < 1) {
        wishesDisplayed.push(wishStarObject);
    } else {
        let isExisting = false;
        wishesDisplayed.forEach((element) => {
            if (
                JSON.stringify(element.coordinates) ===
                JSON.stringify(wishStarObject.coordinates)
            ) {
                isExisting = true;
            }
        });
        if (isExisting === false) {
            wishesDisplayed.push(wishStarObject);
        }
    }
}

function createToolTip(
    topLocation,
    leftLocation,
    wishContainerHeight,
    wishContainerWidth
) {
    const TOOLTIP_WIDTH = 293;
    const tooltip = document.createElement('div');
    tooltip.classList.add('wish-tooltip');

    // Set the tooltip styles and classes

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
    return tooltip;
}

//used to choose a location
function calcLocation(length) {
    let randomSpot = Math.floor((length - 40) * Math.random()) + 15;

    return randomSpot;
}

//remove current wishes from screen
function removeStars() {
    while (wishesDisplayed.length > 0) {
        wishContainer.removeChild(wishesDisplayed.pop().wish);
    }
    isStarsAdded = false;
}

//add wishes to page
function addStars() {
    removeStars();
    const totalWishes = calcQuantityWishes();
    getWishData(totalWishes);
}

//delay adding wishes
function waitAddStars() {
    if (isStarsAdded === true) {
        waiting = setTimeout(() => {
            addStars();
        }, 1000);
    }
}

function addListenerOnStars() {
    wishesDisplayed.forEach((element) => {
        element.wish.addEventListener('click', (event) => {
            //event listener for likes
            if (event.target.tagName === 'BUTTON') {
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
                //event listener to display tooltip on click
                element.wish.classList.toggle('visible');
            }
        });
    });
}

//loading spinner
function setLoading(isLoading) {
    const spinner = document.querySelector('.loading-bar');
    spinner.classList.toggle('show', isLoading);
}

//no enters or line breaks in wishes
function removeLineBreaks() {
    let newValue = textArea.value.split('\n').join('');
    textArea.value = newValue;
}

//star size between 1-8px
const determineStarSize = (likes, min, max) => {
    return Math.min(Math.max(likes, min), max);
};

//number between min and max
const genRandomNumber = (min, max) => {
    return Math.random() * (max - min) + min;
};

profanityAlertButton.addEventListener('click', () => {
    profanityAlert.classList.add('hidden');
});

//event listener for wish submit
submit.addEventListener('click', () => {
    //send new wish to api
    if (textArea.value.length > 0) {
        sendWish(textArea.value);
        textArea.value = '';
    }
});

//initial stars
addStars();

//if window size changes reload stars
window.onresize = function () {
    clearTimeout(waiting);
    waitAddStars();
};
