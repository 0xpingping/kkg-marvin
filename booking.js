const puppeteer = require('puppeteer');

const membershipId = 'TM103540';
const birthDate = '04/10/1995';
const jamLapangan = '21'; // lapangan number
const bookingUrl = 'https://www.klubkelapagading.com/booking/6/tennis-outdor';

// Date logic
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const year = tomorrow.getFullYear();
const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
const day = String(tomorrow.getDate()).padStart(2, '0');
const bookingDate = `${year}-${month}-${day}`;

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Wait for booking form to appear
  console.log('🚦 Waiting for booking to open...');
  while (true) {
    try {
      await page.goto(bookingUrl, { waitUntil: 'domcontentloaded' });

      const inputExists = await page.$('#membership_id');
      if (inputExists) break;

      console.log('⏳ Not open yet, retrying...');
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.log('❌ Error loading page, retrying...');
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log('✅ Booking page is open. Proceeding...');

  // Fill membership ID
  await page.type('#membership_id', membershipId);

  // Fill birth date
  await page.type('input[name="tanggal_lahir"]', birthDate);
  await page.keyboard.press('Enter');

  // Wait for available date buttons
  await page.waitForSelector(`button.tanggal-booking[data-tanggal="${bookingDate}"]`, { timeout: 5000 });
  await page.click(`button.tanggal-booking[data-tanggal="${bookingDate}"]`);

  // Wait and click time slot
  await page.waitForSelector(`button.nomor-lapangan[data-lapangan="${jamLapangan}"]`, { timeout: 5000 });
  await page.click(`button.nomor-lapangan[data-lapangan="${jamLapangan}"]`);

  // Click booking
  await page.waitForSelector('button.btn-booking', { timeout: 5000 });
  await page.click('button.btn-booking');

  // Confirm booking
  await page.waitForSelector('button.btn-confirm-booking', { timeout: 5000 });
  await page.click('button.btn-confirm-booking');

  // Final confirmation
  await page.waitForSelector('button.swal2-confirm.swal2-styled', { timeout: 5000 });
  await page.click('button.swal2-confirm.swal2-styled');

  console.log('🎉 Booking submitted!');

  await browser.close();
})();
