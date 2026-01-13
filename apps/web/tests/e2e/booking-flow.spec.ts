import { expect, test } from '@playwright/test'

const pad = (value: number) => value.toString().padStart(2, '0')

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  return `${year}-${month}-${day}`
}

test('map shows parking inventory', async ({ page }) => {
  await page.goto('/map')

  await expect(page.getByRole('heading', { name: 'Nearby parking inventory' })).toBeVisible()

  const reserveLinks = page.getByRole('link', { name: 'Reserve' })
  await expect(reserveLinks.first()).toBeVisible()
})

test('driver can sign up, add vehicle, and reserve a spot', async ({ page }) => {
  const uniqueId = Date.now()
  const email = `e2e.driver.${uniqueId}@park-app.demo`
  const password = 'Password123!'
  const plate = `E2E-${uniqueId.toString().slice(-4)}`

  await page.goto('/signup')
  await page.getByLabel('Full name').fill('E2E Driver')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByText('Account created.')).toBeVisible()

  await page.goto('/profile')
  await page.getByPlaceholder('Plate').fill(plate)
  await page.getByRole('button', { name: 'Add vehicle' }).click()
  await expect(page.getByText('Vehicle added')).toBeVisible()

  await page.goto('/map')
  await page.getByRole('link', { name: 'Reserve' }).first().click()

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  await page.getByLabel('Arrival date').fill(formatLocalDate(tomorrow))
  await page.getByLabel('Arrival time').fill('09:30')

  await page.getByLabel('Vehicle').selectOption(plate)
  await page.getByRole('button', { name: 'Confirm reservation' }).click()

  await expect(page.getByText('Reservation confirmed.')).toBeVisible()

  await page.goto('/reservations')
  await expect(page.getByText(/Reservation PARK-/)).toBeVisible()
  await expect(page.getByText(`Vehicle: ${plate}`)).toBeVisible()
})

test('partner can onboard, add parking, set availability, and manage tariffs', async ({ page }) => {
  const uniqueId = Date.now()
  const email = `e2e.partner.${uniqueId}@park-app.demo`
  const password = 'Password123!'
  const locationName = `E2E Garage ${uniqueId}`

  await page.goto('/signup')
  await page.getByLabel('Full name').fill('E2E Partner')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByText('Account created.')).toBeVisible()

  await page.goto('/partner/onboard')
  await page.getByLabel('Operator name').fill('E2E Garages LLC')
  await page.getByLabel('Primary contact').fill('Partner Ops')
  await page.getByRole('button', { name: 'Submit for review' }).click()
  await expect(page.getByText('Partner onboarding received.')).toBeVisible()

  await page.goto('/partner/parking')
  await page.getByPlaceholder('Name').fill(locationName)
  await page.getByPlaceholder('Address').fill('123 Test St')
  await page.getByPlaceholder('Latitude').fill('37.7749')
  await page.getByPlaceholder('Longitude').fill('-122.4194')
  await page.getByPlaceholder('Total spots').fill('20')
  await page.getByPlaceholder('Available spots').fill('18')
  await page.getByPlaceholder('Hourly rate').fill('3.5')
  await page.getByRole('button', { name: 'Add parking' }).click()
  await expect(page.getByText('Parking location created')).toBeVisible()

  await page.goto('/partner/availability')
  await expect(page.getByRole('button', { name: 'Decrease by 1' }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Decrease by 1' }).first().click()
  await expect(page.getByText('Availability updated')).toBeVisible()

  await page.goto('/partner/tariffs')
  await page.getByRole('combobox').selectOption({ label: locationName })
  await page.getByPlaceholder('Base rate').fill('3.5')
  await page.getByPlaceholder('Peak rate').fill('5')
  await page.getByPlaceholder('Peak start').fill('18:00')
  await page.getByPlaceholder('Peak end').fill('22:00')
  await page.getByRole('button', { name: 'Save tariffs' }).click()
  await expect(page.getByText('Tariff saved')).toBeVisible()

  await page.goto('/partner/kpis')
  const kpisMain = page.getByRole('main')
  await expect(page.getByRole('heading', { name: 'Performance KPIs' })).toBeVisible()
  await expect(kpisMain.getByText('Availability')).toBeVisible()
  await expect(kpisMain.getByText('17/20')).toBeVisible()
})
