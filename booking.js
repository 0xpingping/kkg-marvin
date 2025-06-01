const puppeteer = require('puppeteer');

const membershipId = 'TM103540';
const birthDate = '04/10/1995';
const jamLapangan = '20';

function getBookingDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const url = 'https://www.klubkelapagading.com/booking/4/tennis-indor';
  const bookingDate = getBookingDate();

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('#membership_id');
    await page.type('#membership_id', membershipId);

    await page.waitForSelector('input[name="tanggal_lahir"]');
    await page.type('input[name="tanggal_lahir"]', birthDate);

    await page.evaluate(() => {
      const input = document.querySelector('input[name="tanggal_lahir"]');
      input.dispatchEvent(new Event('change'));
    });

    await page.waitForSelector(`button.tanggal-booking[data-tanggal="${bookingDate}"]`);
    await page.click(`button.tanggal-booking[data-tanggal="${bookingDate}"]`);

    await page.waitForSelector(`button.nomor-lapangan[data-lapangan="${jamLapangan}"]`);
    await page.click(`button.nomor-lapangan[data-lapangan="${jamLapangan}"]`);

    await page.waitForSelector('button.btn-booking');
    await page.click('button.btn-booking');

    await page.waitForSelector('button.btn-confirm-booking');
    await page.click('button.btn-confirm-booking');

    await page.waitForSelector('button.swal2-confirm.swal2-styled');
    await page.click('button.swal2-confirm.swal2-styled');

    console.log('✅ Booking completed!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await browser.close();
  }
})();
