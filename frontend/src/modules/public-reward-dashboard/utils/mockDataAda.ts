// mockAdaData.ts

const startPrice = 82.0
const points = 50
const intervalSeconds = 15

function generateMockAdaData() {
  const data = []
  let price = startPrice

  const startTime = new Date('2024-02-07T08:52:50').getTime()

  for (let i = 0; i < points; i++) {
    // simulate small random walk up/down
    const change = (Math.random() - 0.4) * 0.2
    price = Math.max(0, price + change)

    const timestamp = new Date(startTime + i * intervalSeconds * 1000).toISOString()
    data.push({
      timestamp,
      datum_data: { ADA: parseFloat(price.toFixed(6)) },
      redeemer_data: null,
    })
  }

  return data
}

export const mockAdaData = generateMockAdaData() as any
