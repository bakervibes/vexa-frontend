<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import CustomPhoneInput from '@/components/custom/custom-phone-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  openWhatsAppChat,
  sendWhatsAppMessage,
} from '@/services/contact.service'
import { toTypedSchema } from '@vee-validate/zod'
import {
  ExternalLinkIcon,
  MailIcon,
  MapPinIcon,
  MessageCircleIcon,
  PhoneIcon,
  SendIcon,
} from 'lucide-vue-next'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useForm } from 'vee-validate'
import { onMounted, onUnmounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { z } from 'zod'

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''

const LOCATION = {
  lng: 2.3912,
  lat: 6.3703,
  zoom: 14,
}

const BUSINESS_INFO = {
  name: 'Vexa Store',
  address: 'Cotonou, Bénin',
  phone: '+229 01 66 38 64 36',
  email: 'contact@vexa.com',
}

const contactFormSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().min(8, 'Le numéro de téléphone est invalide'),
  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères'),
})

type ContactFormValues = z.infer<typeof contactFormSchema>

const mapContainer = ref<HTMLDivElement | null>(null)
let map: mapboxgl.Map | null = null
const isSending = ref(false)

const {
  handleSubmit,
  resetForm,
  isSubmitting: _isSubmitting,
  values: _values,
} = useForm<ContactFormValues>({
  validationSchema: toTypedSchema(contactFormSchema),
  initialValues: {
    name: '',
    phone: '',
    message: '',
  },
})

const handleOpenWhatsApp = () => {
  openWhatsAppChat()
}

const onSubmit = handleSubmit(async (formValues) => {
  isSending.value = true
  try {
    await sendWhatsAppMessage(formValues)
    toast.success('Message envoyé avec succès !')
    resetForm()
  } catch (error) {
    console.error('Error sending message:', error)
    toast.error("Erreur lors de l'envoi du message. Veuillez réessayer.")
  } finally {
    isSending.value = false
  }
})

const initMap = async () => {
  if (!mapContainer.value || !MAPBOX_ACCESS_TOKEN) {
    console.warn('Mapbox token is not configured')
    return
  }

  try {
    const mapboxgl = await import('mapbox-gl')

    await import('mapbox-gl/dist/mapbox-gl.css')

    mapboxgl.default.accessToken = MAPBOX_ACCESS_TOKEN

    map = new mapboxgl.default.Map({
      container: mapContainer.value,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [LOCATION.lng, LOCATION.lat],
      zoom: LOCATION.zoom,
      attributionControl: false,
      scrollZoom: true,
    })

    map.addControl(new mapboxgl.default.NavigationControl(), 'top-right')

    new mapboxgl.default.Marker({ color: '#C8A97E' })
      .setLngLat([LOCATION.lng, LOCATION.lat])
      .setPopup(
        new mapboxgl.default.Popup({ offset: 25 }).setHTML(
          `<div style="color: #E8E8E8; padding: 12px; background: #141414;">
            <strong style="color: #C8A97E;">${BUSINESS_INFO.name}</strong><br/>
            <span style="color: #555;">${BUSINESS_INFO.address}</span>
          </div>`,
        ),
      )
      .addTo(map)
  } catch (error) {
    console.error('Error initializing map:', error)
  }
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
</script>

<template>
  <section class="flex min-h-screen flex-col gap-10 py-24">
    <div class="mx-auto px-6 text-center">
      <div class="text-gold mb-6 text-xs tracking-[0.3em] uppercase">
        Contact
      </div>

      <h1 class="font-display text-text mb-4 text-5xl font-light md:text-6xl">
        Contactez
        <span class="italic">-nous</span>
      </h1>

      <div class="bg-gold/60 mx-auto my-8 h-px w-16" />

      <p
        class="mx-auto max-w-lg text-sm leading-relaxed text-[#555] md:text-base"
      >
        Nous sommes là pour vous aider. Envoyez-nous un message via WhatsApp.
      </p>
    </div>

    <div class="mx-auto w-full max-w-6xl px-6 py-12">
      <div class="grid items-stretch gap-8 lg:grid-cols-2">
        <div class="order-2 lg:order-1">
          <div
            class="border-border-noir bg-surface relative h-full min-h-[400px] overflow-hidden border"
          >
            <div
              ref="mapContainer"
              class="h-full w-full"
              :class="{
                'bg-surface flex items-center justify-center':
                  !MAPBOX_ACCESS_TOKEN,
              }"
            >
              <div
                v-if="!MAPBOX_ACCESS_TOKEN"
                class="p-8 text-center text-[#555]"
              >
                <MapPinIcon class="mx-auto mb-4 h-16 w-16 opacity-30" />
                <p class="text-sm">Carte non configurée</p>
                <p class="mt-2 text-xs text-[#555]">
                  Ajoutez votre clé API Mapbox
                </p>
              </div>
            </div>

            <div class="absolute right-3 bottom-3 z-10">
              <div
                class="bg-noir/90 border-border-noir border px-4 py-3 backdrop-blur-sm"
              >
                <div class="flex items-center gap-3">
                  <MapPinIcon class="text-gold h-5 w-5" />
                  <div>
                    <h3 class="text-text text-sm font-light">
                      {{ BUSINESS_INFO.name }}
                    </h3>
                    <p class="text-xs text-[#555]">
                      {{ BUSINESS_INFO.address }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="order-1 lg:order-2">
          <div class="mb-8 grid gap-4 sm:grid-cols-2">
            <div
              class="border-border-noir bg-surface flex items-center gap-3 border p-4"
            >
              <PhoneIcon class="text-gold h-5 w-5" />
              <div>
                <p class="text-xs text-[#555]">Téléphone</p>
                <p class="text-text text-sm">
                  {{ BUSINESS_INFO.phone }}
                </p>
              </div>
            </div>
            <div
              class="border-border-noir bg-surface flex items-center gap-3 border p-4"
            >
              <MailIcon class="text-gold h-5 w-5" />
              <div>
                <p class="text-xs text-[#555]">Email</p>
                <p class="text-text text-sm">
                  {{ BUSINESS_INFO.email }}
                </p>
              </div>
            </div>
          </div>

          <div class="mb-6 flex items-center gap-3">
            <MessageCircleIcon class="text-gold h-6 w-6" />
            <h2 class="font-display text-text text-xl font-light">
              Envoyez un message WhatsApp
            </h2>
          </div>

          <form
            @submit="onSubmit"
            class="space-y-6"
          >
            <FormField
              v-slot="{ componentField }"
              name="name"
            >
              <FormItem>
                <FormControl>
                  <CustomInput
                    v-bind="componentField"
                    type="text"
                    label="Nom complet"
                  />
                </FormControl>
                <FormMessage class="text-gold" />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ componentField }"
              name="phone"
            >
              <FormItem>
                <FormControl>
                  <CustomPhoneInput
                    v-bind="componentField"
                    type="text"
                    label="Téléphone"
                  />
                </FormControl>
                <FormMessage class="text-gold" />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ componentField }"
              name="message"
            >
              <FormItem>
                <Label class="text-xs tracking-widest text-[#555] uppercase">
                  Message
                </Label>
                <FormControl>
                  <Textarea
                    v-bind="componentField"
                    rows="4"
                    placeholder="Comment pouvons-nous vous aider ?"
                    class="focus:border-gold/40 text-text border-border-noir bg-surface resize-none border placeholder:text-[#555] focus:ring-0"
                  />
                </FormControl>
                <FormMessage class="text-gold" />
              </FormItem>
            </FormField>

            <div class="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                class="border-gold/40 text-gold hover:bg-gold hover:text-noir flex flex-1 items-center justify-center gap-2 border px-5 py-3 text-xs tracking-widest uppercase transition-all"
                @click="handleOpenWhatsApp"
              >
                <ExternalLinkIcon class="h-4 w-4" />
                <span>Ouvrir WhatsApp</span>
              </button>

              <LoadingButton
                type="submit"
                :loading="isSending"
                class="bg-gold text-noir flex flex-1 items-center justify-center gap-2 px-5 py-3 text-xs tracking-widest uppercase transition-all hover:bg-[#B8995E]"
                :disabled="isSending"
              >
                <SendIcon class="h-4 w-4" />
                <span>Envoyer</span>
              </LoadingButton>
            </div>
          </form>

          <p class="mt-6 text-center text-xs text-[#555]">
            "Ouvrir WhatsApp" redirige vers notre numéro. "Envoyer" transmet
            votre message via notre système.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
:deep(.mapboxgl-popup-content) {
  background: #141414;
  color: #e8e8e8;
  padding: 0;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

:deep(.mapboxgl-popup-tip) {
  border-top-color: #141414;
}

:deep(.mapboxgl-ctrl-group) {
  background: #141414;
  border: 1px solid #1e1e1e;
}

:deep(.mapboxgl-ctrl-group button) {
  background-color: transparent;
  border-top-color: #1e1e1e;
}

:deep(.mapboxgl-ctrl button.mapboxgl-ctrl-zoom-in .mapboxgl-ctrl-icon) {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23C8A97E' viewBox='0 0 24 24'%3E%3Cpath d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/%3E%3C/svg%3E");
}

:deep(.mapboxgl-ctrl button.mapboxgl-ctrl-zoom-out .mapboxgl-ctrl-icon) {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23C8A97E' viewBox='0 0 24 24'%3E%3Cpath d='M19 13H5v-2h14v2z'/%3E%3C/svg%3E");
}

:deep(.mapboxgl-ctrl button.mapboxgl-ctrl-compass .mapboxgl-ctrl-icon) {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23C8A97E' viewBox='0 0 24 24'%3E%3Cpath d='M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z'/%3E%3C/svg%3E");
}
</style>
