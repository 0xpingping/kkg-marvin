import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import dotenv from 'dotenv';

dotenv.config();

const {
  MEMBERSHIP_ID,
  BIRTH_DATE,
  COURT_TIME,
  BOOKING_URL
} = process.env;

const bookingDate = new Date();
bookingDate.setDate(bookingDate.getDate() + 1);
const yyyy = bookingDate.getFullYear();
const mm = String(bookingDate.getMonth() + 1).padStart(2, '0');
const dd = String(bookingDate.getDate()).padStart(2, '0');
const bookingDateStr = `${yyyy}-${mm}-${dd}`;

const browser = await puppeteer.launch({
  args: chromium.args,
  defaultViewport: chromium.defaultViewport,
  executablePath: await chromium.executablePath(),
  headless: chromium.headless,
});

const page = await browser.newPage();
await page.goto(BOOKING_URL, { waitUntil: 'domcontentloaded' });

console.log("🌐 Page opened");

// Wait until the "membership_id" field is visible
let ready = false;
for (let i = 0; i < 60; i++) {
  const exists = await page.$('#membership_id');
  if (exists) {
    ready = true;
    break;
  }
  console.log('⏳ Lapangan not ready yet, retrying...');
  await page.waitForTimeout(1000);
}
if (!ready) {
  console.error('❌ Booking form not available.');
  await browser.close();
  process.exit(1);
}

console.log('✅ Form is ready, filling in...');

// Fill form
await page.type('#membership_id', MEMBERSHIP_ID);
await page.type('input[name="tanggal_lahir"]', BIRTH_DATE);
await page.waitForTimeout(300);
await page.click(`button.tanggal-booking[data-tanggal="${bookingDateStr}"]`);
await page.waitForTimeout(400);
await page.waitForSelector(`button.nomor-lapangan[data-lapangan="${COURT_TIME}"]`, { timeout: 5000 });
await page.click(`button.nomor-lapangan[data-lapangan="${COURT_TIME}"]`);
await page.waitForTimeout(400);

// Click booking and confirm
await page.click('button.btn-booking');
await page.waitForTimeout(400);
await page.click('button.btn-confirm-booking');
await page.waitForTimeout(400);
await page.click('button.swal2-confirm.swal2-styled');

console.log('✅ Booking attempt finished.');

await browser.close();
