const canvas = document.getElementById("stars-canvas");
    const ctx = canvas.getContext("2d");

    const backgroundStars = [];
    const interactiveStars = [];
    const dimInteractiveStars = [];
    const shootingStars = [];

    const backgroundStarCount = 400;
    const interactiveStarCount = 150;
    const dimInteractiveStarCount = 1000;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // --- Background stars (with drift)
    for (let i = 0; i < backgroundStarCount; i++) {
        backgroundStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1,
            opacity: Math.random(),
            twinkle: Math.random() * 0.03 + 0.005,
            dx: (Math.random() - 0.5) * 0.1,
            dy: (Math.random() - 0.5) * 0.1
        });
    }

    // --- Main interactive stars
    for (let i = 0; i < interactiveStarCount; i++) {
        let star = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            baseX: 0,
            baseY: 0,
            size: Math.random() * 2 + 0.5,
            opacity: 1,
        };
        star.baseX = star.x;
        star.baseY = star.y;
        interactiveStars.push(star);
    }

    // --- Dim interactive stars
    for (let i = 0; i < dimInteractiveStarCount; i++) {
        let star = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            baseX: 0,
            baseY: 0,
            size: Math.random() * 0.8 + 0.2,
            opacity: Math.random() * 0.4 + 0.1,
        };
        star.baseX = star.x;
        star.baseY = star.y;
        dimInteractiveStars.push(star);
    }

    let mouse = {
        x: null,
        y: null,
        radius: 150 
    };

    window.addEventListener("mousemove", function(e) {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    function createShootingStar() {
        const angle = Math.random() * Math.PI / 3 - Math.PI / 6;
        const speed = Math.random() * 6 + 4;

        shootingStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height / 2,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            length: Math.random() * 100 + 50,
            life: 0,
            maxLife: 50
        });
    }

    setInterval(createShootingStar, 4000); // one every 4 sec

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- Background stars (twinkle + drift)
        for (let star of backgroundStars) {
            star.opacity += (Math.random() - 0.5) * star.twinkle;
            star.opacity = Math.max(0.1, Math.min(1, star.opacity));

            star.x += star.dx;
            star.y += star.dy;

            if (star.x < 0) star.x = canvas.width;
            if (star.x > canvas.width) star.x = 0;
            if (star.y < 0) star.y = canvas.height;
            if (star.y > canvas.height) star.y = 0;

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fill();
        }

        // --- Dim interactive stars (MORE!)
        for (let star of dimInteractiveStars) {
            const dx = mouse.x - star.x;
            const dy = mouse.y - star.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                const directionX = dx / distance;
                const directionY = dy / distance;

                star.x -= directionX * force * 2; 
                star.y -= directionY * force * 2;
            } else {
                const dx = star.baseX - star.x;
                const dy = star.baseY - star.y;
                star.x += dx * 0.015;
                star.y += dy * 0.015;
            }

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fill();
        }

        // --- Main interactive stars
        for (let star of interactiveStars) {
            const dx = mouse.x - star.x;
            const dy = mouse.y - star.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                const directionX = dx / distance;
                const directionY = dy / distance;

                star.x -= directionX * force * 2;
                star.y -= directionY * force * 2;
            } else {
                const dx = star.baseX - star.x;
                const dy = star.baseY - star.y;
                star.x += dx * 0.02;
                star.y += dy * 0.02;
            }

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fill();
        }


    for (let i = shootingStars.length - 1; i >= 0; i--) {
        let s = shootingStars[i];

        const progress = s.life / s.maxLife;
        const curveOffset = Math.sin(progress * Math.PI) * 30; // curve strength

        const xEnd = s.x - s.dx * s.length;
        const yEnd = s.y - s.dy * s.length + curveOffset;

        const gradient = ctx.createLinearGradient(s.x, s.y, xEnd, yEnd);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.6)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(xEnd, yEnd);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.shadowColor = "rgba(255, 255, 255, 0.3)";
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Update position with curve subtly applied to y
        s.x += s.dx;
        s.y += s.dy + Math.sin(progress * Math.PI) * 0.3; // curve affect on path

        s.life++;

        if (s.life > s.maxLife) {
            shootingStars.splice(i, 1);
        }
    }


        requestAnimationFrame(animate);
    }

    animate();

    // Intersection Observer for fade-in on scroll
    const aboutSection = document.querySelector(".about-container");

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            aboutSection.style.opacity = 1;
            aboutSection.style.transform = "translateY(0) scale(1)";
          }
        });
      },
      { threshold: 0.3 }
    );
    
    if (aboutSection) {
      observer.observe(aboutSection);
    }

    const skillItems = document.querySelectorAll(".skill-item");

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.getAttribute("data-delay") || "0s";
        el.style.transitionDelay = delay;
        el.classList.add("revealed");
        skillObserver.unobserve(el);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

skillItems.forEach((item) => skillObserver.observe(item));

const timelineItems = document.querySelectorAll(".timeline-item");

const timelineObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        timelineObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

timelineItems.forEach((item) => timelineObserver.observe(item));

const projectCards = document.querySelectorAll(".project-card");

const projectObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        projectObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

projectCards.forEach((card) => projectObserver.observe(card));

document.addEventListener("DOMContentLoaded", () => {
  const menuIcon = document.getElementById("menu-icon");
  const navbar = document.querySelector(".navbar");

  menuIcon.addEventListener("click", () => {
    navbar.classList.toggle("slide-in");
  });
});

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (loader) {
    setTimeout(() => {
      loader.style.transition = "opacity 1.2s ease";
      loader.style.opacity = 0;
      loader.style.pointerEvents = "none";
      setTimeout(() => loader.remove(), 1200);
    }, 3000);
  }
});






    
