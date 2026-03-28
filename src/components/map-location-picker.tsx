import { useCallback, useEffect, useRef, useState } from 'react'
import { MapPin, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// Leaflet CSS is imported once at mount
import 'leaflet/dist/leaflet.css'

interface MapLocationPickerProps {
  latitude: number
  longitude: number
  onLocationChange: (lat: number, lng: number) => void
}

// Default center: Brazil
const DEFAULT_LAT = -15.7801
const DEFAULT_LNG = -47.9292
const DEFAULT_ZOOM = 4
const DETAIL_ZOOM = 15

export function MapLocationPicker({
  latitude,
  longitude,
  onLocationChange,
}: MapLocationPickerProps) {
  const [open, setOpen] = useState(false)
  const [tempLat, setTempLat] = useState(latitude || DEFAULT_LAT)
  const [tempLng, setTempLng] = useState(longitude || DEFAULT_LNG)
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMapRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null)

  const hasCoords = latitude !== 0 || longitude !== 0

  // Initialize map when dialog opens
  useEffect(() => {
    if (!open || !mapRef.current) return

    // Dynamic import to avoid SSR issues
    let cancelled = false

    const initMap = async () => {
      const L = await import('leaflet')

      if (cancelled || !mapRef.current) return

      // Fix default marker icon
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      // Clean up previous map
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }

      const initialLat = latitude || DEFAULT_LAT
      const initialLng = longitude || DEFAULT_LNG
      const initialZoom = hasCoords ? DETAIL_ZOOM : DEFAULT_ZOOM

      const map = L.map(mapRef.current).setView(
        [initialLat, initialLng],
        initialZoom,
      )

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Place marker if coords exist
      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
      }).addTo(map)

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        setTempLat(pos.lat)
        setTempLng(pos.lng)
      })

      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        setTempLat(lat)
        setTempLng(lng)
      })

      leafletMapRef.current = map
      markerRef.current = marker

      setTempLat(initialLat)
      setTempLng(initialLng)

      // Force resize after dialog renders
      setTimeout(() => map.invalidateSize(), 100)
    }

    initMap()

    return () => {
      cancelled = true
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        setTempLat(lat)
        setTempLng(lng)

        if (leafletMapRef.current && markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
          leafletMapRef.current.setView([lat, lng], DETAIL_ZOOM)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
      },
    )
  }, [])

  const handleConfirm = () => {
    onLocationChange(
      Math.round(tempLat * 1_000_000) / 1_000_000,
      Math.round(tempLng * 1_000_000) / 1_000_000,
    )
    setOpen(false)
  }

  return (
    <div className='space-y-3'>
      {/* Preview of current coordinates */}
      {hasCoords && (
        <div className='flex items-center gap-2 rounded-lg border bg-muted/50 p-3'>
          <MapPin className='h-4 w-4 text-primary' />
          <div className='text-sm'>
            <span className='font-medium'>Lat:</span> {latitude.toFixed(6)},{' '}
            <span className='font-medium'>Lng:</span> {longitude.toFixed(6)}
          </div>
        </div>
      )}

      {/* Open Map Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type='button' variant='outline' className='w-full'>
            <MapPin className='mr-2 h-4 w-4' />
            {hasCoords ? 'Alterar Localização' : 'Adicionar Localização'}
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[700px]'>
          <DialogHeader>
            <DialogTitle>Selecionar Localização</DialogTitle>
            <DialogDescription>
              Clique no mapa ou arraste o marcador para definir a localização da
              loja.
            </DialogDescription>
          </DialogHeader>

          {/* Map container */}
          <div className='space-y-3'>
            <div
              ref={mapRef}
              className='h-[400px] w-full rounded-lg border'
              style={{ zIndex: 0 }}
            />

            {/* Coords display */}
            <div className='flex items-center justify-between gap-4'>
              <div className='flex gap-4 text-sm text-muted-foreground'>
                <span>
                  <strong>Lat:</strong> {tempLat.toFixed(6)}
                </span>
                <span>
                  <strong>Lng:</strong> {tempLng.toFixed(6)}
                </span>
              </div>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={handleUseMyLocation}
              >
                <Navigation className='mr-2 h-4 w-4' />
                Minha localização
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type='button' onClick={handleConfirm}>
              Confirmar Localização
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
