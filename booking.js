import puppeteer from 'puppeteer';

async function bookTennisCourt() {
  const membershipId = 'TM103540';
  const birthDate = '04/10/1995'; // dd/mm/yyyy format as per your site
  const jamLapangan = '21'; // court time slot
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const bookingDate = `${year}-${month}-${day}`; // e.g., "2025-06-02"

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto('https://www.klubkelapagading.com/booking/6/tennis-outdor#customer-info', {
    waitUntil: 'networkidle0',
  });

  // Fill membership ID
  await page.waitForSelector('#membership_id');
  await page.type('#membership_id', membershipId);

  // Fill birth date
  await page.waitForSelector('input[name="tanggal_lahir"]');
  await page.type('input[name="tanggal_lahir"]', birthDate);

  // Click the date button for bookingDate
  const dateSelector = `button.tanggal-booking[data-tanggal="${bookingDate}"]`;
  await page.waitForSelector(dateSelector, { timeout: 10000 });
  await page.click(dateSelector);

  // Wait for time slots buttons to load (at least one)
  await page.waitForSelector('button.nomor-lapangan', { timeout: 15000 });

  // Click the time slot button for your chosen court
  const timeSelector = `button.nomor-lapangan[data-lapangan="${jamLapangan}"]`;
  await page.waitForSelector(timeSelector, { timeout: 10000 });
  await page.click(timeSelector);

  // Click booking button
  await page.waitForSelector('button.btn-booking', { timeout: 10000 });
  await page.click('button.btn-booking');

  // Click confirm booking button
  await page.waitForSelector('button.btn-confirm-booking', { timeout: 10000 });
  await page.click('button.btn-confirm-booking');

  // Click final confirmation Swal button
  await page.waitForSelector('button.swal2-confirm.swal2-styled', { timeout: 10000 });
  await page.click('button.swal2-confirm.swal2-styled');

  console.log('Booking attempted.');

  await browser.close();
}

bookTennisCourt().catch((e) => {
  console.error('Booking failed:', e);
  process.exit(1);
});
