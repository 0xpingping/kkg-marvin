import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const membershipId = 'TM103540';
const birthDate = '04/10/1995';
const jamLapangan = '21'; // court number
const maxRetryTime = 60 * 1000; // 60 seconds max retry for page ready

function tomorrowDateString() {
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const y = tomorrow.getFullYear();
  const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const d = String(tomorrow.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

(async () => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: true,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();

  const bookingUrl = 'https://www.klubkelapagading.com/booking/6/tennis-outdor#customer-info';
  await page.goto(bookingUrl, { waitUntil: 'networkidle2' });

  const startTime = Date.now();
  let formReady = false;

  console.log('⏳ Waiting for booking form to be ready...');

  while (Date.now() - startTime < maxRetryTime) {
    try {
      await page.waitForSelector('#membership_id', { timeout: 2000 });
      formReady = true;
      break;
    } catch {
      console.log('⏳ Lapangan not ready yet, refreshing page...');
      await page.reload({ waitUntil: 'networkidle2' });
    }
  }

  if (!formReady) {
    console.log('❌ Booking form not available after retrying 60 seconds. Exiting.');
    await browser.close();
    process.exit(1);
  }

  console.log('✅ Booking form ready, filling data...');

  await page.type('#membership_id', membershipId);
  await page.type('input[name="tanggal_lahir"]', birthDate);

  const bookingDate = tomorrowDateString();
  await page.waitForSelector(`button.tanggal-booking[data-tanggal="${bookingDate}"]`, { timeout: 5000 });
  await page.click(`button.tanggal-booking[data-tanggal="${bookingDate}"]`);

  await page.waitForTimeout(500);

  await page.waitForSelector(`button.nomor-lapangan[data-lapangan="${jamLapangan}"]`, { timeout: 5000 });
  await page.click(`button.nomor-lapangan[data-lapangan="${jamLapangan}"]`);

  await page.waitForSelector('button.btn-booking', { timeout: 5000 });
  await page.click('button.btn-booking');

  await page.waitForSelector('button.btn-confirm-booking', { timeout: 5000 });
  await page.click('button.btn-confirm-booking');

  await page.waitForSelector('button.swal2-confirm.swal2-styled', { timeout: 5000 });
  await page.click('button.swal2-confirm.swal2-styled');

  console.log('🎉 Booking process completed.');

  await browser.close();
})();
