"use client"

import { useEffect } from "react"
import { initFlowbite } from "flowbite"

export default function HeroCarousel() {
    useEffect(() => {
        initFlowbite()
    }, [])

    return (
        <section className="relative flex justify-center w-full px-4">
            <div className="relative -mt-32 z-20 w-full max-w-4xl px-4">
                <div
                    id="default-carousel"
                    className="relative w-full max-w-4xl"
                    data-carousel="slide"
                >
                    <div className="relative h-56 overflow-hidden rounded-xl md:h-96 shadow-xl">
                        <div className=" hidden duration-700 ease-in-out" data-carousel-item="active">
                            <img
                                src="/images/carousel/gambar1.jpg"
                                className="absolute left-1/2 top-1/2 block w-full -translate-x-1/2 -translate-y-1/2 object-cover"
                                alt="Gambar 1"
                            />
                        </div>
                        <div className="hidden duration-700 ease-in-out" data-carousel-item>
                            <img
                                src="/images/carousel/gambar2.jpg"
                                className="absolute left-1/2 top-1/2 block w-full -translate-x-1/2 -translate-y-1/2 object-cover"
                                alt="Gambar 2"
                            />
                        </div>
                    </div>

                    <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 space-x-3 rtl:space-x-reverse">
                        <button
                            type="button"
                            className="h-3 w-3 rounded-full bg-white/70"
                            aria-current="true"
                            aria-label="Slide 1"
                            data-carousel-slide-to="0"
                        />
                        <button
                            type="button"
                            className="h-3 w-3 rounded-full bg-white/40"
                            aria-current="false"
                            aria-label="Slide 2"
                            data-carousel-slide-to="1"
                        />
                    </div>
                    <button
                        type="button"
                        className="group absolute start-0 top-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
                        data-carousel-prev
                    >
                       <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/50 group-hover:bg-black/70 group-focus:ring-4 group-focus:ring-black/50">
                            <svg
                                className="h-5 w-5 text-white rtl:rotate-180"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m15 19-7-7 7-7"
                                />
                            </svg>
                            <span className="sr-only">Previous</span>
                        </span>
                    </button>

                    <button
                        type="button"
                        className="group absolute end-0 top-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
                        data-carousel-next
                    >
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/50 group-hover:bg-black/70 group-focus:ring-4 group-focus:ring-black/50">
                            <svg
                                className="h-5 w-5 text-white rtl:rotate-180"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m9 5 7 7-7 7"
                                />
                            </svg>
                            <span className="sr-only">Next</span>
                        </span>
                    </button>
                </div>
            </div>
        </section>
    )
}