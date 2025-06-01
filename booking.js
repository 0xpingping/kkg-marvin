import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const membershipId = 'TM103540';
const birthDate = '04/10/1995';
const courtNumber = '21';

// Calculate tomorrow's date string like '2025-06-02'
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const year = tomorrow.getFullYear();
const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
const day = String(tomorrow.getDate()).padStart(2, '0');
const bookingDate = `${year}-${month}-${day}`;

const url = 'https://www.klubkelapagading.com/booking/6/tennis-outdor#customer-info';

// Helper retry wait function
async function waitForSelectorWithRetry(page, selector, timeout = 15000, interval = 1000) {
  const maxTries = Math.ceil(timeout / interval);
  for (let i = 0; i < maxTries; i++) {
    try {
      await page.waitForSelector(selector, { timeout: interval });
      return;
    } catch {
      console.log(`⏳ Waiting for selector: ${selector}`);
    }
  }
  throw new Error(`Timeout waiting for selector: ${selector}`);
}

(async () => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Fill membership ID
  await page.type('#membership_id', membershipId, { delay: 50 });

  // Fill birth date and trigger change event
  await page.evaluate((bd) => {
    const birthField = document.querySelector('input[name="tanggal_lahir"]');
    if (birthField) {
      birthField.value = bd;
      birthField.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, birthDate);

  // Select the booking date button
  const dateSelector = `button.tanggal-booking[data-tanggal="${bookingDate}"]`;
  await waitForSelectorWithRetry(page, dateSelector);
  await page.click(dateSelector);
  console.log(`Selected date: ${bookingDate}`);

  // Wait for the time slots container or courts container to appear
  // Adjust '.jamlapangan' selector if different on your page
  await waitForSelectorWithRetry(page, '.jamlapangan', 15000, 1000);
  console.log('Time slots loaded, now selecting court');

  // Select court button after date is loaded
  const courtSelector = `button.nomor-lapangan[data-lapangan="${courtNumber}"]`;
  await waitForSelectorWithRetry(page, courtSelector);
  await page.click(courtSelector);
  console.log(`Selected court: ${courtNumber}`);

  // Click booking button
  await waitForSelectorWithRetry(page, 'button.btn-booking');
  await page.click('button.btn-booking');
  console.log('Clicked booking button');

  // Click confirm booking button
  await waitForSelectorWithRetry(page, 'button.btn-confirm-booking');
  await page.click('button.btn-confirm-booking');
  console.log('Confirmed booking');

  // Final confirm alert button (like sweetalert)
  await waitForSelectorWithRetry(page, 'button.swal2-confirm.swal2-styled');
  await page.click('button.swal2-confirm.swal2-styled');
  console.log('Final confirmation done');

  await browser.close();
})();
