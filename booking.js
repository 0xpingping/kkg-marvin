import puppeteer from 'puppeteer';

const MEMBERSHIP_ID = 'TM103540';
const COURT_ID = '21'; // Target court
const BASE_URL = 'https://www.klubkelapagading.com/booking/6/tennis-outdor#customer-info';

// Get tomorrow's date in YYYY-MM-DD format
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
const yyyy = tomorrow.getFullYear();
const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
const dd = String(tomorrow.getDate()).padStart(2, '0');
const targetDate = `${yyyy}-${mm}-${dd}`;

try {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  // ✅ Click the date button
  const dateSelector = `button.tanggal-booking[data-tanggal="${targetDate}"]`;
  console.log(`🗓️ Selecting date: ${targetDate}`);
  await page.waitForSelector(dateSelector, { timeout: 10000 });
  await page.click(dateSelector);

  // ✅ Wait for the court/time buttons to load
  const courtSelector = `button.nomor-lapangan[data-lapangan="${COURT_ID}"]`;
  console.log(`⏳ Waiting for court selector: ${courtSelector}`);
  await page.waitForSelector(courtSelector, { timeout: 15000 });
  await page.click(courtSelector);

  // ✅ Wait for membership input
  console.log(`🔐 Waiting for membership input`);
  await page.waitForSelector('input[name="membershipid"]', { timeout: 10000 });
  await page.type('input[name="membershipid"]', MEMBERSHIP_ID);

  // ✅ Click Submit
  console.log(`🚀 Submitting booking`);
  await page.click('button.btn.btn-utama');

  console.log(`✅ Booking submitted`);
  await browser.close();
} catch (err) {
  console.error('❌ Booking failed:', err);
  process.exit(1);
}
