const wishContainer = document.querySelector('.wish-container');

const FOOTER_HEIGHT = 220;
const TOOLTIP_WIDTH = 293;
let totalWishes;
const wishesDisplayed = [];

function calcQuantityWishes() {
    totalWishes = Math.round(
        (((window.innerHeight - FOOTER_HEIGHT) * window.innerWidth) / 1600) *
            0.1
    );
}

function createWishEl() {
    const wishStar = document.createElement('div');
    const tooltip = document.createElement('div');
    const wishContent = document.createElement('div');
    const wishLike = document.createElement('button');
    wishStar.classList.add('wish-star');
    tooltip.classList.add('wish-tooltip');
    wishContent.classList.add('wish-content');
    wishLike.innerHTML = 'Like';

    tooltip.append(wishContent);
    tooltip.append(wishLike);
    wishStar.append(tooltip);

    let topLocation = calcLocation(window.innerHeight - FOOTER_HEIGHT);
    let leftLocation = calcLocation(window.innerWidth);

    wishStar.style.top = `${topLocation}px`;
    wishStar.style.left = `${leftLocation}px`;

    let halfWishContainerHeight = (window.innerHeight - FOOTER_HEIGHT) / 2;
    let halfWishContainerWidth = window.innerWidth / 2;

    if (topLocation >= halfWishContainerHeight) {
        tooltip.classList.add('tooltip-bottom');
    } else {
        tooltip.classList.add('tooltip-top');
    }

    console.log(wishStar.style.left);
    console.log(halfWishContainerWidth);

    if (leftLocation >= halfWishContainerWidth) {
        tooltip.classList.add('tooltip-right');
    } else {
        tooltip.classList.add('tooltip-left');
    }

    if (window.innerWidth <= TOOLTIP_WIDTH * 2) {
        tooltip.classList.remove('tooltip-right', 'tooltip-left');
        tooltip.style.left = `${leftLocation * -1 + 7}px`;
    }

    wishContainer.append(wishStar);
}

function calcLocation(length) {
    let randomSpot = Math.round((length * Math.random()) / 40) * 40;

    if (randomSpot < length - 88) {
        randomSpot = `${randomSpot + 16}`;
    } else {
        randomSpot = `${randomSpot - 64}`;
    }
    return randomSpot;
}

createWishEl();
