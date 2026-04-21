import { useState, useEffect } from "react";
import logo from "../assets/logo.png";

const slides = [
  { id: 1, image: "/img/MaheshJewellersImg.jpeg", title: "MAHESH JEWELLERS" },
  { id: 2, image: "/img/Jhumka earrings.png", title: "Jhumka Earrings" },
  { id: 3, image: "/img/SilverJewellery.jpeg", title: "Silver Jewellery" },
  { id: 4, image: "/img/choker.jpeg", title: "Thushi Necklace" },
  { id: 5, image: "/img/TempleNecklace.png", title: "Temple Necklace" },
];

const HomeCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div style={styles.carouselContainer}>
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          style={{
            ...styles.slideInner,
            opacity: currentIndex === index ? 1 : 0,
            pointerEvents: currentIndex === index ? "auto" : "none",
          }}
        >
          {/* Blurred Background Image */}
          <div
            style={{
              ...styles.blurredBackground,
              backgroundImage: `url('${slide.image}')`,
            }}
          />

          {/* Dark overlay for better text/button visibility */}
          <div style={styles.overlay} />

          {/* Main fully visible image without cropping */}
          <img src={slide.image} alt={slide.title} style={styles.mainImage} />

          {/* Shop Now Button */}
          <button
            style={styles.shopBtn}
            onClick={() => window.scrollTo({ top: 800, behavior: "smooth" })}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(1)")}
          >
            Shop Now
          </button>
        </div>
      ))}

      {/* Left Arrow */}
      <div style={styles.leftArrow} onClick={goToPrevious}>
        &#10094;
      </div>

      {/* Right Arrow */}
      <div style={styles.rightArrow} onClick={goToNext}>
        &#10095;
      </div>

      {/* Dots */}
      <div style={styles.dotsContainer}>
        {slides.map((_, slideIndex) => (
          <div
            key={slideIndex}
            style={{
              ...styles.dot,
              backgroundColor: currentIndex === slideIndex ? "#D4AF37" : "rgba(255, 255, 255, 0.5)",
            }}
            onClick={() => goToSlide(slideIndex)}
          ></div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  carouselContainer: {
    position: "relative" as const,
    width: "100%",
    height: "450px", // Fixed height requested
    margin: "0 auto",
    overflow: "hidden",
    backgroundColor: "#000",
  },
  slideInner: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.8s ease-in-out",
  },
  blurredBackground: {
    position: "absolute" as const,
    top: -20, // Negative offsets to prevent blur edges from showing
    left: -20,
    right: -20,
    bottom: -20,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(15px)",
    zIndex: 0,
  },
  overlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Dark shade
    zIndex: 1,
  },
  mainImage: {
    height: "100%",
    width: "auto",
    maxWidth: "100%",
    objectFit: "contain" as const,
    zIndex: 2,
    position: "relative" as const,
  },
  shopBtn: {
    position: "absolute" as const,
    bottom: "40px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "8px 16px", // px-4 py-2 equivalent
    fontSize: "14px", // small/medium
    fontWeight: "bold",
    backgroundColor: "#000", // Black background
    color: "#fff", // White text
    border: "1px solid #D4AF37", // Slight gold accent border
    borderRadius: "6px", // rounded-md
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0,0,0,0.5)", // Shadow
    transition: "transform 0.2s ease", // Hover transition
    zIndex: 3,
  },
  leftArrow: {
    position: "absolute" as const,
    top: "50%",
    transform: "translate(0, -50%)",
    left: "20px",
    fontSize: "30px",
    color: "rgba(255, 255, 255, 0.8)",
    zIndex: 4,
    cursor: "pointer",
    textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
    transition: "color 0.2s",
  },
  rightArrow: {
    position: "absolute" as const,
    top: "50%",
    transform: "translate(0, -50%)",
    right: "20px",
    fontSize: "30px",
    color: "rgba(255, 255, 255, 0.8)",
    zIndex: 4,
    cursor: "pointer",
    textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
    transition: "color 0.2s",
  },
  dotsContainer: {
    position: "absolute" as const,
    bottom: "15px",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    zIndex: 4,
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    cursor: "pointer",
    transition: "background-color 0.3s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
  },
};

export default HomeCarousel;
