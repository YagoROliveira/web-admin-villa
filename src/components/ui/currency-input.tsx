import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Formats a numeric value (in reais) to BRL display string: "1.234,56"
 */
function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Convert display string back to cents (integer).
 * Strips everything except digits.
 */
function toCents(display: string): number {
  return parseInt(display.replace(/\D/g, '') || '0', 10)
}

export interface CurrencyInputProps
  extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'type'> {
  /** Numeric value in reais (e.g. 12.5 = R$ 12,50) */
  value?: number | string | null
  /** Callback with numeric value in reais */
  onChange?: (value: number) => void
  /** Show "R$ " prefix inside the field (default: true) */
  showPrefix?: boolean
}

/**
 * Currency input that auto-formats as BRL (R$).
 * Digits fill from right like a payment terminal:
 *  0,00 → 0,01 → 0,12 → 1,23 → 12,34
 *
 * Works with react-hook-form via value/onChange.
 */
const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, showPrefix = true, disabled, ...props }, ref) => {
    const numericValue = value != null ? Number(value) : 0
    const display = formatBRL(isNaN(numericValue) ? 0 : numericValue)

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      // Allow navigation / accessibility keys
      if (
        e.key === 'Tab' ||
        e.key === 'Escape' ||
        e.key === 'Enter' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.ctrlKey ||
        e.metaKey
      ) {
        return
      }

      e.preventDefault()

      const currentCents = toCents(display)

      if (e.key === 'Backspace' || e.key === 'Delete') {
        // Remove last digit
        const newCents = Math.floor(currentCents / 10)
        onChange?.(newCents / 100)
        return
      }

      // Only accept digits
      if (!/^\d$/.test(e.key)) return

      const digit = parseInt(e.key, 10)
      const newCents = currentCents * 10 + digit

      // Cap at 999.999.999,99 (avoid overflow)
      if (newCents > 99999999999) return

      onChange?.(newCents / 100)
    }

    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
      e.preventDefault()
      const text = e.clipboardData.getData('text')
      // Try to parse pasted value as number
      const cleaned = text.replace(/[^\d.,]/g, '').replace(',', '.')
      const parsed = parseFloat(cleaned)
      if (!isNaN(parsed) && parsed >= 0) {
        onChange?.(Math.round(parsed * 100) / 100)
      }
    }

    return (
      <div className={cn('relative flex items-center', disabled && 'opacity-50')}>
        {showPrefix && (
          <span className='text-muted-foreground pointer-events-none absolute left-3 text-sm'>
            R$
          </span>
        )}
        <input
          ref={ref}
          type='text'
          inputMode='numeric'
          data-slot='input'
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            showPrefix && 'pl-10',
            'text-right',
            className,
          )}
          value={display}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          readOnly={false}
          disabled={disabled}
          {...props}
          // Prevent the normal onChange from firing (we handle via onKeyDown)
          onChange={() => { }}
        />
      </div>
    )
  },
)

CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput, formatBRL }
