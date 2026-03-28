import { useState } from 'react'
import {
  MapPin,
  Star,
  Edit2,
  Check,
  X,
  Phone,
  User,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useUserAddresses,
  useUpdateAddress,
  useSetDefaultAddress,
  type Address,
} from '../../hooks/use-user-detail'

interface AddressesTabProps {
  userId: string
}

export function AddressesTab({ userId }: AddressesTabProps) {
  const { data: addresses, isLoading } = useUserAddresses(userId)
  const updateAddress = useUpdateAddress(userId)
  const setDefaultAddress = useSetDefaultAddress(userId)

  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [editForm, setEditForm] = useState({
    label: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
  })

  const startEditing = (addr: Address) => {
    setEditingAddress(addr)
    setEditForm({
      label: addr.label ?? '',
      address: addr.address,
      contactPerson: addr.contactPerson ?? '',
      contactPhone: addr.contactPhone ?? '',
    })
  }

  const handleSave = () => {
    if (!editingAddress) return
    updateAddress.mutate(
      {
        addressId: editingAddress.id,
        data: {
          label: editForm.label || null,
          address: editForm.address,
          contactPerson: editForm.contactPerson || null,
          contactPhone: editForm.contactPhone || null,
        },
      },
      {
        onSuccess: () => setEditingAddress(null),
      },
    )
  }

  const handleSetDefault = (addressId: string) => {
    setDefaultAddress.mutate(addressId)
  }

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-40 w-full' />
        ))}
      </div>
    )
  }

  if (!addresses || addresses.length === 0) {
    return (
      <Card>
        <CardContent className='py-12'>
          <div className='flex flex-col items-center justify-center space-y-3'>
            <MapPin className='text-muted-foreground h-12 w-12' />
            <p className='text-muted-foreground'>Nenhum endereço cadastrado</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className='grid gap-4 md:grid-cols-2'>
        {addresses.map((addr) => (
          <Card
            key={addr.id}
            className={addr.isDefault ? 'border-emerald-500 border-2' : ''}
          >
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-2'>
                  <MapPin className='h-4 w-4 text-emerald-600' />
                  <CardTitle className='text-sm'>
                    {addr.label || 'Endereço'}
                  </CardTitle>
                  {addr.isDefault && (
                    <Badge className='bg-emerald-600 text-xs'>
                      <Star className='mr-1 h-3 w-3' />
                      Principal
                    </Badge>
                  )}
                </div>
                <div className='flex gap-1'>
                  {!addr.isDefault && (
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => handleSetDefault(addr.id)}
                      disabled={setDefaultAddress.isPending}
                      title='Definir como principal'
                    >
                      <Star className='h-4 w-4' />
                    </Button>
                  )}
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => startEditing(addr)}
                  >
                    <Edit2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              <p className='text-foreground'>{addr.address}</p>
              {addr.contactPerson && (
                <p className='text-muted-foreground flex items-center gap-1'>
                  <User className='h-3 w-3' />
                  {addr.contactPerson}
                </p>
              )}
              {addr.contactPhone && (
                <p className='text-muted-foreground flex items-center gap-1'>
                  <Phone className='h-3 w-3' />
                  {addr.contactPhone}
                </p>
              )}
              <p className='text-muted-foreground text-xs'>
                Lat: {addr.latitude.toFixed(6)} | Lng: {addr.longitude.toFixed(6)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Address Dialog */}
      <Dialog
        open={!!editingAddress}
        onOpenChange={(open) => !open && setEditingAddress(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Endereço</DialogTitle>
            <DialogDescription>Atualize as informações do endereço</DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='label'>Nome/Rótulo</Label>
              <Input
                id='label'
                placeholder='Casa, Trabalho...'
                value={editForm.label}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, label: e.target.value }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='address'>Endereço</Label>
              <Input
                id='address'
                placeholder='Rua, número, bairro...'
                value={editForm.address}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, address: e.target.value }))
                }
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='contactPerson'>Pessoa de Contato</Label>
                <Input
                  id='contactPerson'
                  placeholder='Nome...'
                  value={editForm.contactPerson}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, contactPerson: e.target.value }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='contactPhone'>Telefone de Contato</Label>
                <Input
                  id='contactPhone'
                  placeholder='(00) 00000-0000'
                  value={editForm.contactPhone}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, contactPhone: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setEditingAddress(null)}>
              <X className='mr-2 h-4 w-4' />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateAddress.isPending}
            >
              <Check className='mr-2 h-4 w-4' />
              {updateAddress.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
