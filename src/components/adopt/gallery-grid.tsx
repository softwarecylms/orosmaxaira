import Image from 'next/image'
import { RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'

type GalleryImage = { src: string; alt: string }

/** Responsive photo grid — 3 → 4 → 6 → 7 tiles per row (7 at desktop = two tidy
 *  rows of the 14 photos). Fast staggered reveal + hover zoom clipped to the
 *  rounded frame. New component (no site equivalent). */
export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  return (
    <RevealStagger
      className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 md:gap-3 xl:grid-cols-7"
      stagger={0.04}
    >
      {images.map((img) => (
        <RevealStaggerItem
          key={img.src}
          className="group relative aspect-[4/5] overflow-hidden rounded-[8px] bg-offwhite"
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            loading="lazy"
            sizes="(min-width:1280px) 14vw, (min-width:768px) 16vw, (min-width:640px) 25vw, 33vw"
            className="object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.06]"
          />
        </RevealStaggerItem>
      ))}
    </RevealStagger>
  )
}
