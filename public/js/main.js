document.addEventListener('DOMContentLoaded', function() {
    // Initialize Hero Slider
    const heroSlider = new Swiper('.hero-slider', {
        loop: true,
        effect: 'fade',
        speed: 1000,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        on: {
            slideChangeTransitionStart: function() {
                // Add animation to slide content
                const activeSlide = this.slides[this.activeIndex];
                const content = activeSlide.querySelector('.slide-content');
                if (content) {
                    content.style.opacity = '0';
                    content.style.transform = 'translateY(20px)';
                }
            },
            slideChangeTransitionEnd: function() {
                // Animate slide content
                const activeSlide = this.slides[this.activeIndex];
                const content = activeSlide.querySelector('.slide-content');
                if (content) {
                    content.style.transition = 'all 0.8s ease-out';
                    content.style.opacity = '1';
                    content.style.transform = 'translateY(0)';
                }
            }
        }
    });

    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileDropdowns = document.querySelectorAll('.mobile-dropdown');

    if (mobileMenuBtn && mobileMenu && mobileMenuClose) {
        // Toggle mobile menu with animation
        function toggleMobileMenu() {
            if (mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.remove('hidden');
                document.body.classList.add('overflow-hidden');
                // Trigger animation after removing hidden
                requestAnimationFrame(() => {
                    mobileMenu.classList.add('translate-x-0');
                    mobileMenu.classList.remove('-translate-x-full');
                });
            } else {
                mobileMenu.classList.add('-translate-x-full');
                mobileMenu.classList.remove('translate-x-0');
                document.body.classList.remove('overflow-hidden');
                // Wait for animation to complete before hiding
                setTimeout(() => {
                    mobileMenu.classList.add('hidden');
                }, 300);
            }
        }

        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileMenu();
        });

        mobileMenuClose.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileMenu();
        });

        // Handle mobile dropdowns with smooth animations
        mobileDropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            const submenu = dropdown.querySelector('.mobile-submenu');
            const icon = dropdown.querySelector('svg');

            if (link && submenu && icon) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Toggle active state for the link
                    link.classList.toggle('text-white');
                    link.classList.toggle('bg-white/10');
                    
                    // Animate the dropdown icon
                    icon.style.transform = submenu.classList.contains('hidden') 
                        ? 'rotate(180deg)' 
                        : 'rotate(0deg)';
                    
                    // Toggle submenu visibility
                    if (submenu.classList.contains('hidden')) {
                        submenu.classList.remove('hidden');
                        submenu.style.maxHeight = submenu.scrollHeight + 'px';
                    } else {
                        submenu.style.maxHeight = '0px';
                        setTimeout(() => {
                            submenu.classList.add('hidden');
                        }, 300);
                    }
                    
                    // Close other dropdowns
                    mobileDropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown) {
                            const otherLink = otherDropdown.querySelector('a');
                            const otherSubmenu = otherDropdown.querySelector('.mobile-submenu');
                            const otherIcon = otherDropdown.querySelector('svg');
                            
                            if (otherLink && otherSubmenu && otherIcon) {
                                otherLink.classList.remove('text-white', 'bg-white/10');
                                otherIcon.style.transform = 'rotate(0deg)';
                                otherSubmenu.style.maxHeight = '0px';
                                setTimeout(() => {
                                    otherSubmenu.classList.add('hidden');
                                }, 300);
                            }
                        }
                    });
                });
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target) && !mobileMenu.classList.contains('hidden')) {
                toggleMobileMenu();
            }
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                toggleMobileMenu();
            }
        });
    }

    // Handle marquee animation pause on hover
    const marqueeElements = document.querySelectorAll('.animate-marquee');
    marqueeElements.forEach(element => {
        element.addEventListener('mouseover', () => {
            element.style.animationPlayState = 'paused';
        });
        element.addEventListener('mouseout', () => {
            element.style.animationPlayState = 'running';
        });
    });

    // Back to Top Button
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.remove('opacity-0', 'invisible');
            } else {
                backToTopBtn.classList.add('opacity-0', 'invisible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
