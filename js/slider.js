import slidesList from './dataSlidesList.js';

const sliderContainer = document.querySelector('.slider__container');
const paginationList = document.querySelector('.slider__pagination');
const buttonsNavigation = document.querySelector('.slider__button');
const numberSlides = slidesList.length;
const urlImg = 'images/';
const urlLink = '';
const time = 3000;

let slides,
	active,
	isDragging = false,
	startPosition,
	resultPosition,
	indexInterval,
	size;

const createTemplateClone = function (template, element) {
	element.appendChild(template.content.cloneNode(true));
};
const disableContextMenu = function (element) {
	element.oncontextmenu = function (event) {
		event.preventDefault();
		event.stopPropagation();
		return false;
	};
};

const createAtributesPaginationButtons = function (index) {
	const paginationButtons = document.querySelectorAll('.slider__pagination-btn');
	paginationButtons[index].setAttribute('data-number', `${index}`);
	paginationButtons[0].classList.add('slider__pagination-btn--active');
};

const displayPagination = function () {
	const templateButtonElement = document.querySelector('#slider-pagination-item');

	for (let index = 0; index < numberSlides; index++) {
		createTemplateClone(templateButtonElement, paginationList);
		createAtributesPaginationButtons(index);
	}
};

const displaySlide = function (picture, link, active) {
	picture.item(0).srcset = `${urlImg}${slidesList[active].srcset}`;
	picture.item(1).srcset = `${urlImg}${slidesList[active].img}`;
	picture.item(2).src = `${urlImg}${slidesList[active].img}`;
	picture.item(2).alt = `${slidesList[active].alt}`;
	link.href = `${urlLink}${slidesList[active].link}`;
};

const displaySlides = function () {
	const templateSlideElement = document.querySelector('#slide-item');
	for (let index = 0; index <= numberSlides + 1; index++) {
		createTemplateClone(templateSlideElement, sliderContainer);

		slides = document.querySelectorAll('.slide');
		if (index === 0 || index === numberSlides + 1) {
			index === 0 ? slides[index].setAttribute('id', 'lastClone') : slides[index].setAttribute('id', 'firstClone');
		}

		const picture = [...slides][index].children[0].children;
		const link = [...slides][index].children[1];

		if (index === 0) {
			active = numberSlides - 1;
			displaySlide(picture, link, active);
		} else if (index === numberSlides + 1) {
			active = 0;
			displaySlide(picture, link, active);
		} else {
			active = index - 1;
			displaySlide(picture, link, active);
		}
	}
};

const changeTransformTranslate = function () {
	sliderContainer.style.transform = `translateX(${-size * active}px)`;
};

const startSlide = function () {
	size = sliderContainer.clientWidth;
	active = 1;
	changeTransformTranslate();
};

const nextChangeSlide = function () {
	if (active >= slides.length - 1) return;
	sliderContainer.classList.add('transition');
	active++;
	changeTransformTranslate();
	changeButtonPagination();
};

const prevChangeSlide = function () {
	if (active <= 0) return;
	sliderContainer.classList.add('transition');
	active--;
	changeTransformTranslate();
	changeButtonPagination();
};

const changeSlidePagination = function (e) {
	e.stopPropagation();

	if (e.target.tagName === 'A') {
		active = e.target.dataset.number;
		clearInterval(indexInterval);
		nextChangeSlide();
		indexInterval = setInterval(nextChangeSlide, time);
		changeButtonPagination();
	}
};

const changeButtonPagination = function () {
	const arrayPaginationButtons = [...paginationList.children];
	const activePaginationButton = arrayPaginationButtons.findIndex(paginationButton =>
		paginationButton.classList.contains('slider__pagination-btn--active'),
	);

	function changeStatusPagination(activePaginationButton, activeSlide) {
		arrayPaginationButtons[activePaginationButton].classList.remove('slider__pagination-btn--active');
		arrayPaginationButtons[activeSlide].classList.add('slider__pagination-btn--active');
	}

	if (active > arrayPaginationButtons.length) {
		changeStatusPagination(activePaginationButton, 0);
		return;
	}
	if (active <= 0) {
		changeStatusPagination(activePaginationButton, arrayPaginationButtons.length - 1);
		return;
	}

	changeStatusPagination(activePaginationButton, active - 1);
};

const getPositionX = function (event) {
	return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
};

const touchStart = function () {
	isDragging = true;
	startPosition = getPositionX(event);
};

const touchEnd = function () {
	isDragging = false;

	manualChangeSlide(resultPosition > 100, resultPosition < -100);
};

const touchMove = function (event) {
	if (isDragging) {
		const currentPosition = getPositionX(event);

		resultPosition = currentPosition - startPosition;
	}
};

const manualChangeSlide = function (prev, next) {
	if (prev || next) {
		clearInterval(indexInterval);
		prev ? prevChangeSlide() : nextChangeSlide();
		indexInterval = setInterval(nextChangeSlide, time);
	}
};

const initSlider = function () {
	displaySlides();
	startSlide();
	disableContextMenu(sliderContainer);
	displayPagination();
	indexInterval = setInterval(nextChangeSlide, time);

	paginationList.addEventListener('click', changeSlidePagination);

	slides.forEach(slide => {
		slide.addEventListener('dragstart', e => e.preventDefault());

		slide.addEventListener('touchstart', touchStart);
		slide.addEventListener('touchend', touchEnd);
		slide.addEventListener('touchmove', touchMove);

		slide.addEventListener('mousedown', touchStart);
		slide.addEventListener('mouseup', touchEnd);
		slide.addEventListener('mousemove', touchMove);
	});

	window.addEventListener('resize', () => {
		size = sliderContainer.clientWidth;
		sliderContainer.classList.remove('transition');
		changeTransformTranslate();
		sliderContainer.classList.add('transition');
	});

	sliderContainer.addEventListener('transitionend', () => {
		if (slides[active].id === 'firstClone') {
			sliderContainer.classList.remove('transition');
			active = slides.length - active;
			changeTransformTranslate();
		}
		if (slides[active].id === 'lastClone') {
			sliderContainer.classList.remove('transition');
			active = slides.length - 2;
			changeTransformTranslate();
		}
	});

	buttonsNavigation.addEventListener('click', e => {
		manualChangeSlide(e.target.className === 'slider__button-prev', e.target.className === 'slider__button-next');
	});

	window.addEventListener('keydown', e => {
		manualChangeSlide(e.key === 'ArrowLeft', e.key === 'ArrowRight');
	});
};

export default initSlider;
