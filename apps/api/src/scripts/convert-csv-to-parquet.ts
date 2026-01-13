import path from 'node:path'

import { convertTransactionsCsvToParquet } from '../services/csv-to-parquet.js'

const inputCsvPath =
  process.env.INPUT_CSV ?? path.resolve(process.cwd(), '../../Parking_Transactions.csv')
const outputDir = process.env.OUTPUT_DIR ?? path.resolve(process.cwd(), '../../data/partitions')

const main = async () => {
  const result = await convertTransactionsCsvToParquet({
    inputCsvPath,
    outputDir,
  })

  console.log('Done', result)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
