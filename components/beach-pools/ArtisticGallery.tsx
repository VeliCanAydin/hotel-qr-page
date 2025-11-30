"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImage {
    src: string;
    alt: string;
}

interface ArtisticGalleryProps {
    images: GalleryImage[];
}

// Predefined artistic layouts for scattered effect
const layoutPatterns = [
    { col: "col-span-2", row: "row-span-2", rotate: "-rotate-2", translate: "translate-y-4" },
    { col: "col-span-1", row: "row-span-1", rotate: "rotate-1", translate: "-translate-y-2" },
    { col: "col-span-1", row: "row-span-2", rotate: "rotate-2", translate: "translate-y-6" },
    { col: "col-span-1", row: "row-span-1", rotate: "-rotate-1", translate: "-translate-y-4" },
    { col: "col-span-2", row: "row-span-1", rotate: "rotate-1", translate: "translate-y-2" },
    { col: "col-span-1", row: "row-span-1", rotate: "-rotate-2", translate: "-translate-y-6" },
    { col: "col-span-1", row: "row-span-2", rotate: "rotate-3", translate: "translate-y-8" },
    { col: "col-span-2", row: "row-span-2", rotate: "-rotate-1", translate: "-translate-y-2" },
    { col: "col-span-1", row: "row-span-1", rotate: "rotate-2", translate: "translate-y-4" },
    { col: "col-span-1", row: "row-span-1", rotate: "-rotate-3", translate: "-translate-y-8" },
];

export default function ArtisticGallery({ images }: ArtisticGalleryProps) {
    const [previewImage, setPreviewImage] = useState<number | null>(null);
    const [modalImage, setModalImage] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const galleryRef = useRef<HTMLDivElement>(null);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPress = useRef(false);

    // Handle scroll-based animations
    useEffect(() => {
        const handleScroll = () => {
            if (!galleryRef.current) return;
            
            const rect = galleryRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const elementTop = rect.top;
            const elementHeight = rect.height;
            
            // Calculate how much of the gallery is in view
            const progress = Math.max(0, Math.min(1, 
                (windowHeight - elementTop) / (windowHeight + elementHeight)
            ));
            
            setScrollProgress(progress);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Clear timer on unmount
    useEffect(() => {
        return () => {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
            }
        };
    }, []);

    // Touch handlers for press-and-hold (mobile)
    const handleTouchStart = useCallback((index: number) => {
        isLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            setPreviewImage(index);
        }, 300);
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        
        if (isLongPress.current) {
            // Was a long press, close preview
            setPreviewImage(null);
            e.preventDefault(); // Prevent click from firing
        }
        isLongPress.current = false;
    }, []);

    const handleTouchMove = useCallback(() => {
        // Cancel long press if user moves finger
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    // Mouse handlers for press-and-hold (desktop)
    const handleMouseDown = useCallback((index: number) => {
        isLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            setPreviewImage(index);
        }, 300);
    }, []);

    const handleMouseUp = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        
        if (isLongPress.current) {
            setPreviewImage(null);
        }
        isLongPress.current = false;
    }, []);

    // Click handler for modal (works for both desktop and mobile tap)
    const handleClick = useCallback((index: number, e: React.MouseEvent) => {
        // Don't open modal if it was a long press
        if (isLongPress.current) {
            e.preventDefault();
            return;
        }
        setModalImage(index);
        setIsModalOpen(true);
    }, []);

    // Close modal
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        // Small delay before clearing modalImage to allow animation
        setTimeout(() => {
            setModalImage(null);
        }, 100);
    }, []);

    // Navigate to next/previous image in modal
    const goToNext = useCallback(() => {
        setModalImage((prev) => (prev !== null ? (prev + 1) % images.length : 0));
    }, [images.length]);

    const goToPrev = useCallback(() => {
        setModalImage((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : 0));
    }, [images.length]);

    // Keyboard navigation in modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isModalOpen) return;
            
            if (e.key === "Escape") {
                closeModal();
            } else if (e.key === "ArrowRight") {
                goToNext();
            } else if (e.key === "ArrowLeft") {
                goToPrev();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isModalOpen, closeModal, goToNext, goToPrev]);

    // Manage body scroll when modal is open
    useEffect(() => {
        if (isModalOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = "100%";
            document.body.style.overflow = "hidden";
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || "0") * -1);
            }
        }
        
        return () => {
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
        };
    }, [isModalOpen]);

    const getLayoutPattern = (index: number) => {
        return layoutPatterns[index % layoutPatterns.length];
    };

    const getParallaxStyle = (index: number) => {
        const offset = (index % 5) * 0.1;
        const parallaxY = (scrollProgress - 0.5) * 50 * (1 + offset);
        const scale = 0.95 + (scrollProgress * 0.1);
        
        return {
            transform: `translateY(${parallaxY}px) scale(${scale})`,
        };
    };

    return (
        <>
            <div ref={galleryRef} className="relative py-12 px-4 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    {/* Gallery Grid with scattered artistic layout */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-[120px] md:auto-rows-[180px] lg:auto-rows-[200px]">
                        {images.map((image, index) => {
                            const pattern = getLayoutPattern(index);
                            const parallaxStyle = getParallaxStyle(index);
                            
                            return (
                                <div
                                    key={index}
                                    className={cn(
                                        "relative group cursor-pointer transition-all duration-500 ease-out",
                                        pattern.col,
                                        pattern.row,
                                        "hover:z-20"
                                    )}
                                    style={parallaxStyle}
                                    onMouseDown={() => handleMouseDown(index)}
                                    onMouseUp={handleMouseUp}
                                    onTouchStart={() => handleTouchStart(index)}
                                    onTouchEnd={handleTouchEnd}
                                    onTouchMove={handleTouchMove}
                                    onClick={(e) => handleClick(index, e)}
                                >
                                    <div
                                        className={cn(
                                            "relative w-full h-full rounded-lg md:rounded-xl overflow-hidden shadow-lg transition-all duration-300",
                                            pattern.rotate,
                                            pattern.translate,
                                            "hover:rotate-0 hover:translate-y-0 hover:scale-105 hover:shadow-2xl",
                                            "before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/30 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 before:z-10"
                                        )}
                                    >
                                        <Image
                                            src={image.src}
                                            alt={image.alt}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        />
                                        
                                        {/* Shimmer effect on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-20" />
                                        
                                        {/* Image number indicator */}
                                        <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                                            {index + 1}/{images.length}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Decorative floating elements */}
                    <div 
                        className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"
                        style={{ transform: `translateY(${scrollProgress * 100}px)` }}
                    />
                    <div 
                        className="absolute bottom-20 right-10 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"
                        style={{ transform: `translateY(${-scrollProgress * 80}px)` }}
                    />
                    <div 
                        className="absolute top-1/2 left-1/3 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"
                        style={{ transform: `translateY(${scrollProgress * 60}px) rotate(${scrollProgress * 45}deg)` }}
                    />
                </div>
            </div>

            {/* Press-and-hold preview overlay */}
            {previewImage !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none animate-in fade-in duration-200">
                    <div className="relative w-[90vw] h-[80vh] max-w-5xl animate-in zoom-in-95 duration-200">
                        <Image
                            src={images[previewImage].src}
                            alt={images[previewImage].alt}
                            fill
                            className="object-contain"
                            sizes="90vw"
                            priority
                        />
                        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                            Release to close • Tap to open gallery
                        </p>
                    </div>
                </div>
            )}

            {/* Full modal gallery */}
            {isModalOpen && modalImage !== null && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={closeModal}
                >
                    {/* Close button */}
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>

                    {/* Navigation arrows */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            goToPrev();
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            goToNext();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Main image */}
                    <div 
                        className="relative w-[90vw] h-[80vh] max-w-6xl animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={images[modalImage].src}
                            alt={images[modalImage].alt}
                            fill
                            className="object-contain"
                            sizes="90vw"
                            priority
                        />
                    </div>

                    {/* Image counter */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                        {modalImage + 1} / {images.length}
                    </div>

                    {/* Thumbnail strip */}
                    <div 
                        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-2 px-4 scrollbar-hide"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setModalImage(index);
                                }}
                                className={cn(
                                    "relative w-16 h-12 md:w-20 md:h-14 rounded-md overflow-hidden flex-shrink-0 transition-all duration-200",
                                    modalImage === index 
                                        ? "ring-2 ring-white scale-110" 
                                        : "opacity-50 hover:opacity-100"
                                )}
                            >
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
