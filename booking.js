import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const membershipId = 'TM103540';
const birthDate = '04/10/1995';
const courtNumber = '21';

// Tomorrow date in YYYY-MM-DD
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const year = tomorrow.getFullYear();
const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
const day = String(tomorrow.getDate()).padStart(2, '0');
const bookingDate = `${year}-${month}-${day}`;

// Helper: Wait for selector retry loop (up to timeout ms)
async function waitForSelectorWithRetry(page, selector, timeout = 15000, interval = 1000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = await page.$(selector);
    if (el) return el;
    console.log(`⏳ Waiting for selector: ${selector}`);
    await new Promise(r => setTimeout(r, interval));
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
    await page.goto('https://www.klubkelapagading.com/booking/6/tennis-outdor#customer-info', {
      waitUntil: 'networkidle2',
    });

    const membershipInput = await waitForSelectorWithRetry(page, '#membership_id');
    await membershipInput.click({ clickCount: 3 });
    await membershipInput.type(membershipId);

    const birthInput = await waitForSelectorWithRetry(page, 'input[name="tanggal_lahir"]');
    await birthInput.click({ clickCount: 3 });
    await birthInput.type(birthDate);

    const dateSelector = `button.tanggal-booking[data-tanggal="${bookingDate}"]`;
    await waitForSelectorWithRetry(page, dateSelector);
    await page.click(dateSelector);
    console.log(`Selected date: ${bookingDate}`);

    // Small delay so jam lapangan loads
    await page.waitForTimeout(1200);

    const courtSelector = `button.nomor-lapangan[data-lapangan="${courtNumber}"]`;
    await waitForSelectorWithRetry(page, courtSelector);
    await page.click(courtSelector);
    console.log(`Selected court: ${courtNumber}`);

    await waitForSelectorWithRetry(page, 'button.btn-booking');
    await page.click('button.btn-booking');
    console.log('Clicked booking button');

    await waitForSelectorWithRetry(page, 'button.btn-confirm-booking');
    await page.click('button.btn-confirm-booking');
    console.log('Clicked confirm booking button');

    await waitForSelectorWithRetry(page, 'button.swal2-confirm.swal2-styled');
    await page.click('button.swal2-confirm.swal2-styled');
    console.log('Booking complete! 🎾');

  } catch (error) {
    console.error('Booking error:', error.message);
  } finally {
    await browser.close();
  }
})();
