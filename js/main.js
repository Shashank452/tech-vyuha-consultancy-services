document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navbar = document.querySelector('.navbar');

    if (mobileMenuBtn && navbar) {
        mobileMenuBtn.addEventListener('click', function () {
            navbar.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.navbar ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navbar.classList.remove('active');
        });
    });

    // Custom project form toggle
    const customProjectBtn = document.getElementById('custom-project-btn');
    const customProjectForm = document.getElementById('custom-project-form');

    if (customProjectBtn && customProjectForm) {
        customProjectBtn.addEventListener('click', () => {
            if (customProjectForm.style.display === 'block') {
                customProjectForm.style.display = 'none';
                customProjectBtn.textContent = 'Submit Your Idea';
            } else {
                customProjectForm.style.display = 'block';
                customProjectBtn.textContent = 'Close Form';
                customProjectForm.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Form submission via fetch → keeps you on the page and still e-mails via FormSubmit.co
    const projectIdeaForm = document.getElementById('project-idea-form');
    if (projectIdeaForm) {
        projectIdeaForm.addEventListener('submit', function (e) {
            e.preventDefault();  // stop the normal navigation

            // package up the fields
            const formData = new FormData(this);

            // POST to FormSubmit
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' },
            })
            .then(response => {
                if (response.ok) {
                    alert('Thank you for your project idea! We will contact you soon.');
                    this.reset();
                    // hide form & reset button
                    customProjectForm.style.display = 'none';
                    customProjectBtn.textContent = 'Submit Your Idea';
                } else {
                    return response.json().then(data => Promise.reject(data));
                }
            })
            .catch(error => {
                console.error('Form submission error:', error);
                alert('Oops! There was a problem submitting your form. Please try again later.');
            });
        });
    }

    // Sticky header on scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function () {
        if (header) {
            header.style.boxShadow = window.scrollY > 100 ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none';
        }
    });

    // Initialize all carousels
    
    function initCarousels() {
        const carousels = document.querySelectorAll('.projects-carousel');
        
        carousels.forEach(carousel => {
            const container = carousel.querySelector('.projects-container');
            const track = carousel.querySelector('.projects-track');
            const prevBtn = carousel.querySelector('.prev-btn');
            const nextBtn = carousel.querySelector('.next-btn');
            const dotsContainer = carousel.closest('.category').querySelector('.carousel-dots');
            
            const projects = Array.from(track.children);
            const projectWidth = projects[0].getBoundingClientRect().width;
            const projectsPerView = Math.min(4, Math.floor(container.offsetWidth / projectWidth));
            
            let currentIndex = 0;
            let autoSlideInterval;
            
            // Clone first and last items for seamless looping
            const firstClone = projects[0].cloneNode(true);
            const lastClone = projects[projects.length - 1].cloneNode(true);
            
            track.appendChild(firstClone);
            track.insertBefore(lastClone, projects[0]);
            
            // Set up dots navigation
            function setupDots() {
                dotsContainer.innerHTML = '';
                const totalSlides = projects.length;
                
                for (let i = 0; i < totalSlides; i++) {
                    const dot = document.createElement('div');
                    dot.classList.add('dot');
                    if (i === 0) dot.classList.add('active');
                    dot.addEventListener('click', () => {
                        goToSlide(i);
                    });
                    dotsContainer.appendChild(dot);
                }
            }
            
            // Update dots active state
            function updateDots() {
                const dots = dotsContainer.querySelectorAll('.dot');
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentIndex);
                });
            }
            
            // Move to specific slide
            function goToSlide(index) {
                const totalSlides = projects.length;
                currentIndex = index;
                
                // Handle circular navigation
                if (index >= totalSlides) {
                    currentIndex = 0;
                    track.style.transition = 'none';
                    track.style.transform = `translateX(0)`;
                    // Force reflow
                    track.offsetHeight;
                    track.style.transition = 'transform 0.5s ease';
                } else if (index < 0) {
                    currentIndex = totalSlides - 1;
                    track.style.transition = 'none';
                    track.style.transform = `translateX(${-totalSlides * projectWidth}px)`;
                    // Force reflow
                    track.offsetHeight;
                    track.style.transition = 'transform 0.5s ease';
                }
                
                const offset = -currentIndex * projectWidth;
                track.style.transform = `translateX(${offset}px)`;
                
                updateDots();
            }
            
            // Move to next slide
            function nextSlide() {
                goToSlide(currentIndex + 1);
            }
            
            // Move to previous slide
            function prevSlide() {
                goToSlide(currentIndex - 1);
            }
            
            // Start auto sliding
            function startAutoSlide() {
                autoSlideInterval = setInterval(nextSlide, 3000);
            }
            
            // Stop auto sliding
            function stopAutoSlide() {
                clearInterval(autoSlideInterval);
            }
            
            // Handle transition end for seamless looping
            function handleTransitionEnd() {
                const totalSlides = projects.length;
                
                if (currentIndex >= totalSlides) {
                    currentIndex = 0;
                    track.style.transition = 'none';
                    track.style.transform = `translateX(0)`;
                    // Force reflow
                    track.offsetHeight;
                    track.style.transition = 'transform 0.5s ease';
                } else if (currentIndex < 0) {
                    currentIndex = totalSlides - 1;
                    track.style.transition = 'none';
                    track.style.transform = `translateX(${-totalSlides * projectWidth}px)`;
                    // Force reflow
                    track.offsetHeight;
                    track.style.transition = 'transform 0.5s ease';
                }
            }
            
            // Initialize carousel
            function init() {
                setupDots();
                
                // Set initial position
                track.style.transform = `translateX(${-projectWidth}px)`;
                
                // Event listeners for buttons
                nextBtn.addEventListener('click', () => {
                    stopAutoSlide();
                    nextSlide();
                    startAutoSlide();
                });
                
                prevBtn.addEventListener('click', () => {
                    stopAutoSlide();
                    prevSlide();
                    startAutoSlide();
                });
                
                // Handle transition end
                track.addEventListener('transitionend', handleTransitionEnd);
                
                // Pause on hover
                container.addEventListener('mouseenter', stopAutoSlide);
                container.addEventListener('mouseleave', startAutoSlide);
                
                // Start auto sliding
                startAutoSlide();
            }
            
            // Initialize on load and resize
            init();
            window.addEventListener('resize', init);
        });
    }
    
    // Initialize carousels when DOM is loaded
    initCarousels();

    // Animate elements when they come into view
    const animateOnScroll = function () {
        const elements = document.querySelectorAll('.category, .project-card, .contact-item, .form-container');

        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;

            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Set initial state for animated elements
    const animatedElements = document.querySelectorAll('.category, .project-card, .contact-item, .form-container');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.6s ease';
    });

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on page load
});
