import { Router } from 'express'

const router = Router()

type ValidateCardBody = {
  nameOnCard?: string
  cardNumber?: string
  expMonth?: number
  expYear?: number
  cvv?: string
  billingPostalCode?: string
}

type ValidationError = { field: keyof ValidateCardBody; message: string }

function normalizeDigits(s: string) {
  return s.replace(/\D/g, '')
}

function luhnCheck(cardNumberDigits: string): boolean {
  let sum = 0
  let shouldDouble = false

  for (let i = cardNumberDigits.length - 1; i >= 0; i--) {
    let digit = Number(cardNumberDigits[i])
    if (Number.isNaN(digit)) return false

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

function guessCardBrand(cardNumberDigits: string): 'amex' | 'other' {
  if (/^3[47]/.test(cardNumberDigits)) return 'amex'
  return 'other'
}

function validateCard(body: ValidateCardBody): ValidationError[] {
  const errors: ValidationError[] = []

  const nameOnCard = (body.nameOnCard ?? '').trim()
  const cardNumber = (body.cardNumber ?? '').trim()
  const expMonth = body.expMonth
  const expYear = body.expYear
  const cvv = (body.cvv ?? '').trim()
  const billingPostalCode = (body.billingPostalCode ?? '').trim()

  if (!nameOnCard) errors.push({ field: 'nameOnCard', message: 'Name is required' })

  const digits = normalizeDigits(cardNumber)
  if (!digits) {
    errors.push({ field: 'cardNumber', message: 'Card number is required' })
  } else if (digits.length < 12 || digits.length > 19) {
    errors.push({ field: 'cardNumber', message: 'Card number length is invalid' })
  } else if (!luhnCheck(digits)) {
    errors.push({ field: 'cardNumber', message: 'Card number is invalid' })
  }

  if (typeof expMonth !== 'number' || !Number.isInteger(expMonth)) {
    errors.push({ field: 'expMonth', message: 'Expiration month is required' })
  } else if (expMonth < 1 || expMonth > 12) {
    errors.push({ field: 'expMonth', message: 'Expiration month must be 1-12' })
  }

  const currentYear = new Date().getFullYear()
  if (typeof expYear !== 'number' || !Number.isInteger(expYear)) {
    errors.push({ field: 'expYear', message: 'Expiration year is required' })
  } else if (expYear < currentYear - 1 || expYear > currentYear + 30) {
    errors.push({ field: 'expYear', message: 'Expiration year is invalid' })
  }

  if (typeof expMonth === 'number' && typeof expYear === 'number') {
    const now = new Date()
    const expDate = new Date(expYear, expMonth, 1)
    if (expDate <= now) {
      errors.push({ field: 'expYear', message: 'Card is expired' })
    }
  }

  const brand = guessCardBrand(digits)
  const cvvDigits = normalizeDigits(cvv)

  if (!cvvDigits) {
    errors.push({ field: 'cvv', message: 'CVV is required' })
  } else if (brand === 'amex') {
    if (cvvDigits.length !== 4) errors.push({ field: 'cvv', message: 'AMEX CVV must be 4 digits' })
  } else {
    if (cvvDigits.length !== 3) errors.push({ field: 'cvv', message: 'CVV must be 3 digits' })
  }

  if (billingPostalCode && !/^[A-Za-z0-9 -]{3,10}$/.test(billingPostalCode)) {
    errors.push({ field: 'billingPostalCode', message: 'Postal code looks invalid' })
  }

  return errors
}

router.post('/', (req, res) => {
  const body = req.body as ValidateCardBody
  const errors = validateCard(body)

  if (errors.length > 0) {
    return res.status(422).json({ valid: false, errors })
  }

  return res.status(200).json({ valid: true })
})

export default router
