import { format } from 'date-fns'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type DateTimePickerProps = {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DateTimePicker({
  selected,
  onSelect,
  placeholder = 'Selecione data e hora',
  className
}: DateTimePickerProps) {
  const handleDateSelect = (date: Date | undefined) => {
    if (date && selected) {
      // Preserve existing time when changing date
      const newDate = new Date(date)
      newDate.setHours(selected.getHours())
      newDate.setMinutes(selected.getMinutes())
      onSelect(newDate)
    } else if (date) {
      // Set default time to current time when selecting new date
      const newDate = new Date(date)
      const now = new Date()
      newDate.setHours(now.getHours())
      newDate.setMinutes(now.getMinutes())
      onSelect(newDate)
    } else {
      onSelect(undefined)
    }
  }

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = event.target.value
    if (time && selected) {
      const [hours, minutes] = time.split(':')
      const newDate = new Date(selected)
      newDate.setHours(parseInt(hours, 10))
      newDate.setMinutes(parseInt(minutes, 10))
      onSelect(newDate)
    }
  }

  const formatDateTime = (date: Date) => {
    return format(date, 'dd/MM/yyyy HH:mm')
  }

  const getTimeValue = (date: Date) => {
    return format(date, 'HH:mm')
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          data-empty={!selected}
          className={cn(
            'data-[empty=true]:text-muted-foreground w-full justify-start text-start font-normal',
            className
          )}
        >
          {selected ? (
            formatDateTime(selected)
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className='ms-auto h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <div className='p-3 space-y-3'>
          <Calendar
            mode='single'
            captionLayout='dropdown'
            selected={selected}
            onSelect={handleDateSelect}
            disabled={(date: Date) => date < new Date('1900-01-01')}
            initialFocus
          />
          <div className='border-t pt-3'>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              <label className='text-sm font-medium'>Hora:</label>
              <Input
                type='time'
                value={selected ? getTimeValue(selected) : ''}
                onChange={handleTimeChange}
                className='w-auto'
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}