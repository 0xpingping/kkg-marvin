import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const membershipId = 'TM103540';
const birthDate = '04/10/1995';
const courtNumber = '21';  // Change this if needed

// Format tomorrow's date as YYYY-MM-DD
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const year = tomorrow.getFullYear();
const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
const day = String(tomorrow.getDate()).padStart(2, '0');
const bookingDate = `${year}-${month}-${day}`;

async function waitForSelectorWithRetry(page, selector, timeout = 5000, retryInterval = 1000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = await page.$(selector);
    if (el) return el;
    console.log(`⏳ Waiting for selector ${selector}...`);
    await new Promise(r => setTimeout(r, retryInterval));
  }
  throw new Error(`Timeout waiting for selector: ${selector}`);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(),
    headless: true,
    args: chromium.args,
  });
  const page = await browser.newPage();

  try {
    // Open booking page (outdoor court)
    await page.goto('https://www.klubkelapagading.com/booking/6/tennis-outdor#customer-info', {
      waitUntil: 'networkidle2',
    });

    // Fill membership ID
    const membershipInput = await waitForSelectorWithRetry(page, '#membership_id', 10000);
    await membershipInput.click({clickCount: 3});
    await membershipInput.type(membershipId);

    // Fill birth date
    const birthInput = await waitForSelectorWithRetry(page, 'input[name="tanggal_lahir"]', 10000);
    await birthInput.click({clickCount: 3});
    await birthInput.type(birthDate);

    // Click date button for tomorrow
    const dateSelector = `button.tanggal-booking[data-tanggal="${bookingDate}"]`;
    await waitForSelectorWithRetry(page, dateSelector, 15000);
    await page.click(dateSelector);
    console.log(`Selected booking date: ${bookingDate}`);

    // Wait a bit for the time buttons to load (jamlapangan)
    await page.waitForTimeout(1000);

    // Click court button
    const courtSelector = `button.nomor-lapangan[data-lapangan="${courtNumber}"]`;
    await waitForSelectorWithRetry(page, courtSelector, 15000);
    await page.click(courtSelector);
    console.log(`Selected court number: ${courtNumber}`);

    // Click booking button
    await waitForSelectorWithRetry(page, 'button.btn-booking', 10000);
    await page.click('button.btn-booking');
    console.log('Clicked booking button');

    // Confirm booking
    await waitForSelectorWithRetry(page, 'button.btn-confirm-booking', 10000);
    await page.click('button.btn-confirm-booking');
    console.log('Clicked confirm booking button');

    // Final confirmation (swal2 confirm button)
    await waitForSelectorWithRetry(page, 'button.swal2-confirm.swal2-styled', 10000);
    await page.click('button.swal2-confirm.swal2-styled');
    console.log('Booking confirmed! 🎾');

  } catch (e) {
    console.error('Booking failed:', e.message);
  } finally {
    await browser.close();
  }
})();
