import { useCallback, useEffect, useRef, useState } from 'react'
import { MapPin, Trash2, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

import 'leaflet/dist/leaflet.css'

export interface PolygonPoint {
  lat: number
  lng: number
}

interface PolygonMapPickerProps {
  /** Current polygon points */
  value: PolygonPoint[]
  /** Called whenever the polygon changes */
  onChange: (points: PolygonPoint[]) => void
  /** Map height */
  height?: number
}

// Default center: Brazil
const DEFAULT_LAT = -15.7801
const DEFAULT_LNG = -47.9292
const DEFAULT_ZOOM = 4
const POLY_ZOOM = 13

export function PolygonMapPicker({
  value,
  onChange,
  height = 420,
}: PolygonMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const polygonRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null)
  const [ready, setReady] = useState(false)

  // Redraw polygon + markers from points
  const redraw = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (L: any, map: any, pts: PolygonPoint[]) => {
      // Remove old polygon
      if (polygonRef.current) {
        map.removeLayer(polygonRef.current)
        polygonRef.current = null
      }
      // Remove old markers
      markersRef.current.forEach((m) => map.removeLayer(m))
      markersRef.current = []

      if (pts.length === 0) return

      // Draw markers
      pts.forEach((pt, idx) => {
        const marker = L.circleMarker([pt.lat, pt.lng], {
          radius: 7,
          color: '#2563eb',
          fillColor: idx === 0 ? '#16a34a' : '#3b82f6',
          fillOpacity: 0.9,
          weight: 2,
        })
          .addTo(map)
          .bindTooltip(`#${idx + 1}`, {
            permanent: false,
            direction: 'top',
          })

        markersRef.current.push(marker)
      })

      // Draw polygon if >= 3 points
      if (pts.length >= 3) {
        const latlngs = pts.map((p) => [p.lat, p.lng])
        polygonRef.current = L.polygon(latlngs, {
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.15,
          weight: 2,
        }).addTo(map)
      }
    },
    [],
  )

  // Init map
  useEffect(() => {
    if (!mapRef.current) return
    let cancelled = false

    const initMap = async () => {
      const L = await import('leaflet')
      if (cancelled || !mapRef.current) return

      // Clean up previous
      if (leafletRef.current) {
        leafletRef.current.remove()
        leafletRef.current = null
      }

      LRef.current = L

      const center: [number, number] =
        value.length > 0
          ? [
            value.reduce((s, p) => s + p.lat, 0) / value.length,
            value.reduce((s, p) => s + p.lng, 0) / value.length,
          ]
          : [DEFAULT_LAT, DEFAULT_LNG]

      const zoom = value.length > 0 ? POLY_ZOOM : DEFAULT_ZOOM

      const map = L.map(mapRef.current).setView(center, zoom)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Click handler — add point
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.on('click', (e: any) => {
        const newPt: PolygonPoint = {
          lat: Math.round(e.latlng.lat * 1_000_000) / 1_000_000,
          lng: Math.round(e.latlng.lng * 1_000_000) / 1_000_000,
        }
        // We read latest value via a function ref trick
        onChange([...value, newPt])
      })

      leafletRef.current = map

      // Draw initial polygon
      redraw(L, map, value)

      // Fit bounds if polygon exists
      if (value.length >= 3) {
        const bounds = L.latLngBounds(value.map((p) => [p.lat, p.lng]))
        map.fitBounds(bounds, { padding: [40, 40] })
      }

      setReady(true)
      setTimeout(() => map.invalidateSize(), 100)
    }

    initMap()

    return () => {
      cancelled = true
      if (leafletRef.current) {
        leafletRef.current.remove()
        leafletRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-register the click handler whenever value changes so it sees latest state
  useEffect(() => {
    const map = leafletRef.current
    if (!map) return

    // Remove old click handler and add new one
    map.off('click')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.on('click', (e: any) => {
      const newPt: PolygonPoint = {
        lat: Math.round(e.latlng.lat * 1_000_000) / 1_000_000,
        lng: Math.round(e.latlng.lng * 1_000_000) / 1_000_000,
      }
      onChange([...value, newPt])
    })
  }, [value, onChange])

  // Redraw when value changes (after map is ready)
  useEffect(() => {
    if (!ready || !LRef.current || !leafletRef.current) return
    redraw(LRef.current, leafletRef.current, value)
  }, [value, ready, redraw])

  const handleUndo = () => {
    if (value.length === 0) return
    onChange(value.slice(0, -1))
  }

  const handleClear = () => {
    onChange([])
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2'>
        <span className='text-sm text-muted-foreground'>
          <MapPin className='mr-1 inline h-3.5 w-3.5' />
          Clique no mapa para adicionar pontos do polígono.{' '}
          {value.length < 3 && (
            <span className='font-medium text-amber-600'>
              Mínimo 3 pontos. ({value.length}/3)
            </span>
          )}
          {value.length >= 3 && (
            <span className='font-medium text-green-600'>
              {value.length} pontos
            </span>
          )}
        </span>
        <div className='ml-auto flex gap-1'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleUndo}
            disabled={value.length === 0}
          >
            <Undo2 className='mr-1 h-3.5 w-3.5' /> Desfazer
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleClear}
            disabled={value.length === 0}
          >
            <Trash2 className='mr-1 h-3.5 w-3.5' /> Limpar
          </Button>
        </div>
      </div>
      <div
        ref={mapRef}
        style={{ height, width: '100%' }}
        className='rounded-lg border'
      />
    </div>
  )
}
