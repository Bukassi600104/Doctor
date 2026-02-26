/**
 * /doctors — Doctor listing page
 * Server component wrapper: exports metadata, delegates rendering to DoctorsClient.
 */

import type { Metadata } from 'next'
import { DoctorsClient } from './DoctorsClient'

export const metadata: Metadata = {
  title: 'Find a Doctor',
  description: 'Search MDCN-verified Nigerian doctors by specialty, location and availability.',
}

export default function DoctorsPage() {
  return <DoctorsClient />
}
