import axios from 'axios'

const DEFAULT_TAX_RATE = 0.1
const ZIP_TAX_API_KEY = process.env.ZIP_TAX_API_KEY

type ZipTaxResult = {
    taxSales?: number
    taxUse?: number
}

type ZipTaxResponse = {
    rCode?: number
    results?: ZipTaxResult[]
}

export async function getTaxRateForZip(zip: string): Promise<number> {
    if (!ZIP_TAX_API_KEY) {
        console.warn('ZIP_TAX_API_KEY not set, using default tax rate')
        return DEFAULT_TAX_RATE
    }

    try {
        const res = await axios.get<ZipTaxResponse>(
            'https://api.zip-tax.com/request/v60',
            {
                params: {
                    key: ZIP_TAX_API_KEY,
                    postalcode: zip, // <– by postal code
                    format: 'json',
                    countryCode: 'USA',
                },
            }
        )

        const data = res.data

        // Basic success check
        if (
            data.rCode !== 100 ||
            !Array.isArray(data.results) ||
            data.results.length === 0
        ) {
            console.warn('Zip-Tax: no valid results, using default rate', data)
            return DEFAULT_TAX_RATE
        }

        const first = data.results[0]
        const taxSales =
            typeof first.taxSales === 'number' ? first.taxSales : NaN
        const taxUse = typeof first.taxUse === 'number' ? first.taxUse : NaN

        // Prefer taxSales, fall back to taxUse
        let rate = Number.isFinite(taxSales) && taxSales >= 0 ? taxSales : NaN
        if (!Number.isFinite(rate) && Number.isFinite(taxUse) && taxUse >= 0) {
            rate = taxUse
        }

        if (Number.isFinite(rate) && rate >= 0 && rate < 1.5) {
            return rate
        }

        console.warn('Zip-Tax: unexpected tax rate value, using default', {
            taxSales,
            taxUse,
        })
        return DEFAULT_TAX_RATE
    } catch (err) {
        console.error(
            'Error fetching tax rate from Zip-Tax, using default',
            err
        )
        return DEFAULT_TAX_RATE
    }
}
