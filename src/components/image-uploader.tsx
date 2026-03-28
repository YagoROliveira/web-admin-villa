import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { villamarketApi } from '@/lib/villamarket-api'
import { VM_API } from '@/config/api'

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  accept?: Record<string, string[]>
  maxSize?: number // bytes
  className?: string
  aspectRatio?: 'square' | 'video' | 'banner'
}

export function ImageUploader({
  value,
  onChange,
  label = 'Imagem',
  accept = { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] },
  maxSize = 10 * 1024 * 1024, // 10MB
  className = '',
  aspectRatio = 'square',
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await villamarketApi.post(
      VM_API.ENDPOINTS.MEDIA.UPLOAD,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )

    return data.url
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      // Show local preview immediately
      const localPreview = URL.createObjectURL(file)
      setPreview(localPreview)

      setIsUploading(true)
      try {
        const url = await uploadFile(file)
        onChange(url)
        toast.success('Imagem enviada com sucesso!')
      } catch (error) {
        console.error('Upload failed:', error)
        toast.error('Falha ao enviar imagem. Tente novamente.')
        setPreview(null)
      } finally {
        setIsUploading(false)
      }
    },
    [onChange],
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept,
      maxSize,
      maxFiles: 1,
      multiple: false,
    })

  // Show file rejection errors
  if (fileRejections.length > 0) {
    const errors = fileRejections[0].errors
    errors.forEach((e) => {
      if (e.code === 'file-too-large') {
        toast.error(`Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB`)
      } else if (e.code === 'file-invalid-type') {
        toast.error('Tipo de arquivo não suportado.')
      }
    })
  }

  const displayUrl = preview || value
  const hasImage = !!displayUrl

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setPreview(null)
  }

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[3/1]',
  }

  return (
    <div className={className}>
      {hasImage ? (
        <div className='group relative'>
          <img
            src={displayUrl}
            alt={label}
            className={`w-full rounded-lg border object-cover ${aspectClasses[aspectRatio]}`}
          />
          {isUploading && (
            <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-black/50'>
              <Loader2 className='h-8 w-8 animate-spin text-white' />
            </div>
          )}
          <div className='absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100'>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <Button
                type='button'
                size='icon'
                variant='secondary'
                className='h-8 w-8'
              >
                <Upload className='h-4 w-4' />
              </Button>
            </div>
            <Button
              type='button'
              size='icon'
              variant='destructive'
              className='h-8 w-8'
              onClick={handleRemove}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors ${aspectClasses[aspectRatio]} ${isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          ) : (
            <>
              <ImagePlus className='h-8 w-8 text-muted-foreground' />
              <div className='text-center'>
                <p className='text-sm font-medium'>
                  {isDragActive
                    ? 'Solte a imagem aqui...'
                    : 'Arraste ou clique para enviar'}
                </p>
                <p className='text-xs text-muted-foreground'>
                  JPG, PNG, WebP ou GIF (máx. {maxSize / 1024 / 1024}MB)
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
