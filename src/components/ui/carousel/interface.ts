import type { EmblaCarouselType } from 'embla-carousel'
import type useEmblaCarousel from 'embla-carousel-vue'
import type { EmblaCarouselVueType } from 'embla-carousel-vue'
import type { HTMLAttributes, Ref, UnwrapRef } from 'vue'

export type CarouselApi = EmblaCarouselVueType[1]
export type CarouselRef = EmblaCarouselVueType[0]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

export type UnwrapRefCarouselApi = UnwrapRef<CarouselApi>
export type { EmblaCarouselType }

export interface CarouselProps {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: 'horizontal' | 'vertical'
}

export interface CarouselEmits {
  (e: 'init-api', payload: UnwrapRefCarouselApi): void
}

export interface WithClassAsProps {
  class?: HTMLAttributes['class']
}

export interface CarouselState {
  carouselRef: CarouselRef
  carouselApi: CarouselApi
  canScrollPrev: Ref<boolean>
  canScrollNext: Ref<boolean>
  scrollPrev: () => void
  scrollNext: () => void
  orientation: 'horizontal' | 'vertical'
}
