import puppeteer from 'puppeteer';

const membershipId = 'TM103540';
const birthDate = '04/10/1995';
const jamLapangan = '21';  // court number
const url = 'https://www.klubkelapagading.com/booking/6/tennis-outdor';

async function runBooking() {
  // Calculate tomorrow's date in YYYY-MM-DD format
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const bookingDate = `${year}-${month}-${day}`;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Fill membership ID and birthdate
    await page.waitForSelector('#membership_id', { timeout: 10000 });
    await page.type('#membership_id', membershipId, { delay: 30 });

    await page.waitForSelector('input[name="tanggal_lahir"]', { timeout: 10000 });
    await page.type('input[name="tanggal_lahir"]', birthDate, { delay: 30 });
    await page.evaluate(() => {
      const input = document.querySelector('input[name="tanggal_lahir"]');
      input.dispatchEvent(new Event('change'));
    });

    // Wait for and click the booking date button
    const bookingDateSelector = `button.tanggal-booking[data-tanggal="${bookingDate}"]`;
    await page.waitForSelector(bookingDateSelector, { timeout: 15000 });
    await page.click(bookingDateSelector);

    // Wait for time slot buttons to load after date selection
    await page.waitForSelector('button.nomor-lapangan', { timeout: 15000 });

    // Select desired court time button
    const lapanganSelector = `button.nomor-lapangan[data-lapangan="${jamLapangan}"]`;
    await page.waitForSelector(lapanganSelector, { timeout: 15000 });
    await page.click(lapanganSelector);

    // Click booking button
    const bookingBtnSelector = 'button.btn-booking';
    await page.waitForSelector(bookingBtnSelector, { timeout: 10000 });
    await page.click(bookingBtnSelector);

    // Click confirm booking button
    const confirmBtnSelector = 'button.btn-confirm-booking';
    await page.waitForSelector(confirmBtnSelector, { timeout: 10000 });
    await page.click(confirmBtnSelector);

    // Final confirmation (SweetAlert2)
    const finalConfirmSelector = 'button.swal2-confirm.swal2-styled';
    await page.waitForSelector(finalConfirmSelector, { timeout: 10000 });
    await page.click(finalConfirmSelector);

    console.log('Booking process completed!');
  } catch (e) {
    console.error('Booking failed:', e);
  } finally {
    await browser.close();
  }
}

runBooking();
