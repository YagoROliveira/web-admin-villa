import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Upload, X } from 'lucide-react'
import { Story, statuses } from '../data/schema'
import { useStories } from './stories-provider'

const storyFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SCHEDULED', 'PAUSED', 'CONCLUDED']),
  module: z.string().min(1, 'Módulo é obrigatório'),
  startAt: z.date().optional(),
  endAt: z.date().optional(),
}).refine(data => data.startAt && data.endAt, {
  message: 'Data e hora de início e fim são obrigatórias',
  path: ['startAt']
})

type StoryFormData = z.infer<typeof storyFormSchema>

interface StoryFormProps {
  story?: Story
  onSave: (data: StoryFormData & { imageFiles?: File[] }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function StoryForm({ story, onSave, onCancel, isLoading = false }: StoryFormProps) {
  const { modules } = useStories()
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    story?.images?.map(img => img.url) || []
  )

  const form = useForm<StoryFormData>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      name: story?.name || '',
      status: story?.status || 'ACTIVE',
      module: story?.module || '',
      startAt: story?.startAt ? new Date(story.startAt) : undefined,
      endAt: story?.endAt ? new Date(story.endAt) : undefined,
    },
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files])

      files.forEach(file => {
        const reader = new FileReader()
        reader.onload = () => {
          setImagePreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: StoryFormData) => {
    try {
      await onSave({
        ...data,
        startAt: data.startAt || undefined,
        endAt: data.endAt || undefined,
        imageFiles: imageFiles.length > 0 ? imageFiles : undefined
      })
    } catch (error) {
      console.error('Erro ao salvar story:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Básicas */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Story *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome do story" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statuses.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="module"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Módulo *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o módulo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {modules.map((module) => (
                              <SelectItem key={module.module_type} value={module.module_type}>
                                {module.module_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data e Hora de Início *</FormLabel>
                        <FormControl>
                          <DateTimePicker
                            selected={field.value}
                            onSelect={field.onChange}
                            placeholder="Selecione data e hora de início"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data e Hora de Fim *</FormLabel>
                        <FormControl>
                          <DateTimePicker
                            selected={field.value}
                            onSelect={field.onChange}
                            placeholder="Selecione data e hora de fim"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Imagens */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Imagens do Story</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview das Imagens */}
                {imagePreviews.length > 0 && (
                  <div className="space-y-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload de Arquivos */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Upload de Imagens
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Clique para enviar</span>
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG ou JPEG (múltiplas)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Preview do Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {form.watch('status') && (
                    <Badge variant="secondary">
                      {statuses.find(opt => opt.value === form.watch('status'))?.label}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : story ? 'Atualizar Story' : 'Criar Story'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
