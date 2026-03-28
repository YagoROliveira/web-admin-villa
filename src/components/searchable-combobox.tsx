import * as React from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface ComboboxOption {
  value: string
  label: string
  description?: string
}

interface SearchableComboboxProps {
  options: ComboboxOption[]
  value: string
  onValueChange: (value: string) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  isLoading?: boolean
  disabled?: boolean
  className?: string
}

export function SearchableCombobox({
  options,
  value,
  onValueChange,
  searchQuery,
  onSearchChange,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum resultado encontrado.',
  isLoading = false,
  disabled = false,
  className,
}: SearchableComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [internalSearch, setInternalSearch] = React.useState('')

  const search = searchQuery ?? internalSearch
  const setSearch = onSearchChange ?? setInternalSearch

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <span className='truncate'>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[--radix-popover-trigger-width] p-0' align='start'>
        <Command shouldFilter={!onSearchChange}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className='flex items-center justify-center py-6'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span className='ml-2 text-sm text-muted-foreground'>
                  Carregando...
                </span>
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => {
                        onValueChange(
                          option.value === value ? '' : option.value,
                        )
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === option.value
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      <div className='flex flex-col'>
                        <span>{option.label}</span>
                        {option.description && (
                          <span className='text-xs text-muted-foreground'>
                            {option.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
