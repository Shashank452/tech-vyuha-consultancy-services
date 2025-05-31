document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navbar = document.querySelector('.navbar');

    if (mobileMenuBtn && navbar) {
        mobileMenuBtn.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevent click from bubbling to document
            navbar.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active'); // Add active state for icon
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!navbar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navbar.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.navbar ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                navbar.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
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
        // Create alert container if it doesn't exist
        let alertContainer = document.querySelector('.alert-container');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.className = 'alert-container';
            document.body.appendChild(alertContainer);
        }

        // Function to show alert
        function showAlert(type, title, message, duration = 5000) {
            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            
            const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
            
            alert.innerHTML = `
                <i class="fas fa-${icon} alert-icon"></i>
                <div class="alert-content">
                    <div class="alert-title">${title}</div>
                    <div class="alert-message">${message}</div>
                </div>
                <button class="alert-close">&times;</button>
                <div class="alert-progress"></div>
            `;
            
            // Close button functionality
            const closeBtn = alert.querySelector('.alert-close');
            closeBtn.addEventListener('click', () => {
                hideAlert(alert);
            });
            
            // Auto-hide after duration
            let timeoutId = setTimeout(() => {
                hideAlert(alert);
            }, duration);
            
            // Pause progress bar on hover
            alert.addEventListener('mouseenter', () => {
                const progress = alert.querySelector('.alert-progress');
                if (progress) {
                    progress.style.animationPlayState = 'paused';
                }
                clearTimeout(timeoutId);
            });
            
            alert.addEventListener('mouseleave', () => {
                const progress = alert.querySelector('.alert-progress');
                if (progress) {
                    progress.style.animationPlayState = 'running';
                }
                timeoutId = setTimeout(() => {
                    hideAlert(alert);
                }, 2000);
            });
            
            // Add to container and show
            alertContainer.appendChild(alert);
            // Trigger reflow to enable animation
            void alert.offsetWidth;
            alert.classList.add('show');
        }
        
        // Function to hide alert
        function hideAlert(alert) {
            alert.classList.remove('show');
            alert.addEventListener('transitionend', () => {
                if (alert.parentNode === alertContainer) {
                    alertContainer.removeChild(alert);
                }
            }, { once: true });
        }

        projectIdeaForm.addEventListener('submit', function (e) {
            e.preventDefault();  // stop the normal navigation
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            // Package up the fields
            const formData = new FormData(this);

            // POST to FormSubmit
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' },
            })
            .then(response => {
                if (response.ok) {
                    showAlert(
                        'success', 
                        'Success!', 
                        'Thank you for your project idea! We will contact you soon.'
                    );
                    this.reset();
                    // Hide form & reset button
                    const customProjectForm = document.getElementById('custom-project-form');
                    const customProjectBtn = document.getElementById('custom-project-btn');
                    if (customProjectForm && customProjectBtn) {
                        customProjectForm.style.display = 'none';
                        customProjectBtn.textContent = 'Submit Your Idea';
                    }
                } else {
                    return response.json().then(data => Promise.reject(data));
                }
            })
            .catch(error => {
                console.error('Form submission error:', error);
                showAlert(
                    'error',
                    'Error!',
                    'There was a problem submitting your form. Please try again later.'
                );
            })
            .finally(() => {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
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
            const containerWidth = container.offsetWidth;
            
            // Calculate number of projects per view based on screen size
            let projectsPerView;
            if (window.innerWidth <= 768) {
                projectsPerView = 1; // Show only 1 project on mobile
            } else {
                projectsPerView = Math.min(4, Math.floor(containerWidth / projectWidth));
            }
            
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
                
                // Calculate offset with center alignment for mobile
                const offset = -currentIndex * projectWidth;
                if (window.innerWidth <= 768) {
                    // Center single item on mobile
                    const centerOffset = (containerWidth - projectWidth) / 2;
                    track.style.transform = `translateX(${offset + centerOffset}px)`;
                    
                    // Add active class to current project card
                    projects.forEach((project, i) => {
                        project.classList.toggle('active', i === currentIndex);
                    });
                } else {
                    track.style.transform = `translateX(${offset}px)`;
                    // Remove active class for desktop view
                    projects.forEach(project => {
                        project.classList.remove('active');
                    });
                }
                
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
                const screenWidth = window.innerWidth;
                // Adjust interval based on screen size
                const interval = screenWidth <= 768 ? 5000 : 3000; // 5 seconds for mobile, 3 seconds for desktop
                autoSlideInterval = setInterval(nextSlide, interval);
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
