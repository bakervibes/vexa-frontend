<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import CustomPhoneInput from '@/components/custom/custom-phone-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { Button } from '@/components/ui/button'
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

// Mapbox configuration
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''

// Location coordinates (you can change these)
const LOCATION = {
  lng: 2.3912, // Cotonou longitude
  lat: 6.3703, // Cotonou latitude
  zoom: 14,
}

// Business info
const BUSINESS_INFO = {
  name: 'Vexa Store',
  address: 'Cotonou, Bénin',
  phone: '+229 01 66 38 64 36',
  email: 'contact@vexa.com',
}

// Form schema
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

// Handler: Open WhatsApp inbox without message
const handleOpenWhatsApp = () => {
  openWhatsAppChat()
}

// Handler: Send message via WhatsApp Cloud API
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

// Initialize Mapbox map
const initMap = async () => {
  if (!mapContainer.value || !MAPBOX_ACCESS_TOKEN) {
    console.warn('Mapbox token is not configured')
    return
  }

  try {
    // Dynamically import mapbox-gl
    const mapboxgl = await import('mapbox-gl')

    // Import CSS
    await import('mapbox-gl/dist/mapbox-gl.css')

    mapboxgl.default.accessToken = MAPBOX_ACCESS_TOKEN

    map = new mapboxgl.default.Map({
      container: mapContainer.value,
      style: 'mapbox://styles/mapbox/standard',
      center: [LOCATION.lng, LOCATION.lat],
      zoom: LOCATION.zoom,
      attributionControl: false,
      scrollZoom: true,
    })

    // Add navigation controls
    map.addControl(new mapboxgl.default.NavigationControl(), 'top-right')

    // Add marker
    new mapboxgl.default.Marker({ color: '#8B5CF6' })
      .setLngLat([LOCATION.lng, LOCATION.lat])
      .setPopup(
        new mapboxgl.default.Popup({ offset: 25 }).setHTML(
          `<div style="color: black; padding: 8px;">
            <strong>${BUSINESS_INFO.name}</strong><br/>
            ${BUSINESS_INFO.address}
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
  <section class="flex min-h-screen flex-col gap-10 py-12">
    <!-- Header -->
    <div class="container mx-auto px-4 text-center">
      <h1 class="mb-4 text-4xl font-bold text-black md:text-5xl">
        Contactez-nous
      </h1>
      <p class="mx-auto max-w-2xl text-lg text-black/80">
        Nous sommes là pour vous aider. Envoyez-nous un message via WhatsApp et
        nous vous répondrons rapidement.
      </p>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-12">
      <div class="grid items-stretch gap-8 lg:grid-cols-2">
        <!-- Map Section -->
        <div class="order-2 lg:order-1">
          <div class="relative h-full overflow-hidden rounded-2xl shadow-lg">
            <!-- Map Container -->
            <div
              ref="mapContainer"
              class="h-full w-full"
              :class="{
                'flex items-center justify-center bg-gray-800':
                  !MAPBOX_ACCESS_TOKEN,
              }"
            >
              <div
                v-if="!MAPBOX_ACCESS_TOKEN"
                class="p-8 text-center text-gray-400"
              >
                <MapPinIcon class="mx-auto mb-4 h-16 w-16 opacity-50" />
                <p class="text-lg font-medium">Carte non configurée</p>
                <p class="mt-2 text-sm">
                  Ajoutez votre clé API Mapbox dans le fichier .env
                </p>
              </div>
            </div>

            <!-- Location Info Overlay -->
            <div class="absolute right-2 bottom-2 z-10">
              <div
                class="w-fit rounded-xl border border-white/10 bg-gray-300 px-4 py-2 backdrop-blur-lg"
              >
                <div class="flex items-center gap-3">
                  <div class="rounded-full bg-violet-800/20 p-2">
                    <MapPinIcon class="h-5 w-5 text-violet-700" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-black">
                      {{ BUSINESS_INFO.name }}
                    </h3>
                    <p class="text-sm text-gray-700">
                      {{ BUSINESS_INFO.address }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Section -->
        <div class="order-1 px-8 lg:order-2">
          <!-- Contact Info Cards -->
          <div class="mb-8 grid gap-4 sm:grid-cols-2">
            <div class="flex items-center gap-3 rounded-xl bg-gray-300/50 p-4">
              <div class="rounded-full bg-green-500/20 p-2">
                <PhoneIcon class="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p class="text-xs text-gray-800">Téléphone</p>
                <p class="font-medium text-black">
                  {{ BUSINESS_INFO.phone }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3 rounded-xl bg-gray-300/50 p-4">
              <div class="rounded-full bg-blue-500/20 p-2">
                <MailIcon class="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p class="text-xs text-gray-800">Email</p>
                <p class="font-medium text-black">
                  {{ BUSINESS_INFO.email }}
                </p>
              </div>
            </div>
          </div>

          <!-- WhatsApp Form -->
          <div class="mb-6 flex items-center gap-3">
            <div class="rounded-full bg-green-500/20 p-2">
              <MessageCircleIcon class="h-6 w-6 text-green-400" />
            </div>
            <h2 class="text-xl font-semibold text-black">
              Envoyez-nous un message WhatsApp
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
                    label="Full name"
                  />
                </FormControl>
                <FormMessage />
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
                    label="Phone"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ componentField }"
              name="message"
            >
              <FormItem>
                <Label class="font-normal text-gray-600">Message</Label>
                <FormControl>
                  <Textarea
                    v-bind="componentField"
                    rows="4"
                    placeholder="Comment pouvons-nous vous aider ?"
                    class="resize-none border-gray-600 text-black placeholder:text-gray-400 focus:border-violet-500 focus:ring-violet-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <div class="flex flex-col gap-3 sm:flex-row">
              <!-- Button 1: Open WhatsApp (no message) -->
              <Button
                type="button"
                variant="outline"
                class="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                @click="handleOpenWhatsApp"
              >
                <ExternalLinkIcon class="mr-2 h-5 w-5" />
                <span>Ouvrir WhatsApp</span>
              </Button>

              <!-- Button 2: Send via Cloud API -->
              <LoadingButton
                type="submit"
                :loading="isSending"
                class="flex-1 bg-green-600 text-white shadow hover:bg-green-700"
                :disabled="isSending"
              >
                <SendIcon class="mr-2 h-5 w-5" />
                <span>Envoyer le message</span>
              </LoadingButton>
            </div>
          </form>

          <!-- Additional Info -->
          <p class="mt-6 text-center text-sm text-gray-400">
            "Ouvrir WhatsApp" redirige vers notre numéro. "Envoyer le message"
            envoie votre message directement via notre système.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Mapbox GL CSS overrides for dark theme */
:deep(.mapboxgl-popup-content) {
  background: #1f2937;
  color: white;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

:deep(.mapboxgl-popup-tip) {
  border-top-color: #1f2937;
}

:deep(.mapboxgl-ctrl-group) {
  background: #374151;
  border-radius: 8px;
}

:deep(.mapboxgl-ctrl-group button) {
  background-color: transparent;
}

:deep(.mapboxgl-ctrl-group button + button) {
  border-top-color: #4b5563;
}

:deep(.mapboxgl-ctrl button.mapboxgl-ctrl-zoom-in .mapboxgl-ctrl-icon) {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23fff' viewBox='0 0 24 24'%3E%3Cpath d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/%3E%3C/svg%3E");
}

:deep(.mapboxgl-ctrl button.mapboxgl-ctrl-zoom-out .mapboxgl-ctrl-icon) {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23fff' viewBox='0 0 24 24'%3E%3Cpath d='M19 13H5v-2h14v2z'/%3E%3C/svg%3E");
}

:deep(.mapboxgl-ctrl button.mapboxgl-ctrl-compass .mapboxgl-ctrl-icon) {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23fff' viewBox='0 0 24 24'%3E%3Cpath d='M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z'/%3E%3C/svg%3E");
}
</style>
