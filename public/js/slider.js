// Slider configuration and data
const sliderConfig = {
    // Slider images and content
    slides: [
        {
            image: '/images/slider/1.jpg',
            title: 'Crime Investigation Bureau',
            description: 'Professional Investigation Services',
            buttonText: 'Learn More',
            buttonLink: '/services.html'
        },
        {
            image: 'https://via.placeholder.com/1920x600/c41e3a/ffffff?text=Crime+Prevention',
            title: 'Crime Prevention',
            description: 'Protecting Communities Through Prevention',
            buttonText: 'Our Approach',
            buttonLink: '/about.html'
        },
        {
            image: 'https://via.placeholder.com/1920x600/1a365d/ffffff?text=Public+Safety',
            title: 'Public Safety',
            description: 'Ensuring Safety for All Citizens',
            buttonText: 'Report Incident',
            buttonLink: '/contact.html'
        }
    ],

    // Swiper configuration
    swiperOptions: {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
            renderBullet: function (index, className) {
                return '<span class="' + className + '"></span>';
            }
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        on: {
            init: function () {
                updateSlideContent(this.realIndex);
            },
            slideChange: function () {
                updateSlideContent(this.realIndex);
            }
        }
    }
};

// Function to update slide content
function updateSlideContent(index) {
    const slide = sliderConfig.slides[index];
    const contentElement = document.querySelector('.slider-content');
    if (contentElement) {
        contentElement.innerHTML = `
            <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">${slide.title}</h2>
            <p class="text-xl text-gray-200 mb-6">${slide.description}</p>
            <a href="${slide.buttonLink}" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                ${slide.buttonText}
            </a>
        `;
    }
}

// Initialize slider
function initializeSlider() {
    // Create slider HTML structure
    const swiperContainer = document.querySelector('.swiper');
    if (swiperContainer) {
        const swiperWrapper = swiperContainer.querySelector('.swiper-wrapper');
        if (swiperWrapper) {
            // Clear existing slides
            swiperWrapper.innerHTML = '';
            
            // Add slides
            sliderConfig.slides.forEach(slide => {
                const slideDiv = document.createElement('div');
                slideDiv.className = 'swiper-slide relative';
                slideDiv.innerHTML = `
                    <img src="${slide.image}" alt="${slide.title}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-black bg-opacity-40"></div>
                `;
                swiperWrapper.appendChild(slideDiv);
            });
        }

        // Add content container if it doesn't exist
        if (!document.querySelector('.slider-content')) {
            const contentDiv = document.createElement('div');
            contentDiv.className = 'slider-content absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-4xl px-4';
            swiperContainer.appendChild(contentDiv);
        }

        // Initialize Swiper
        const swiper = new Swiper(swiperContainer, sliderConfig.swiperOptions);
        return swiper;
    }
    return null;
}

// Export functions and config
export {
    sliderConfig,
    initializeSlider,
    updateSlideContent
};
