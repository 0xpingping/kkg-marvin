const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    defaultViewport: chromium.defaultViewport,
  });

  const page = await browser.newPage();

  const bookingUrl = 'https://www.klubkelapagading.com/booking/6/tennis-outdor'; // OUTDOOR
  const membershipId = 'TM103540';
  const birthDate = '04/10/1995';
  const jamLapangan = '21'; // court hour

  // === Step 1: Calculate tomorrow's date in YYYY-MM-DD format ===
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  let year = tomorrow.getFullYear();
  let month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  let day = String(tomorrow.getDate()).padStart(2, '0');
  let bookingDate = `${year}-${month}-${day}`;

  console.log(`📅 Target booking date: ${bookingDate}`);

  // === Step 2: Load the booking page ===
  await page.goto(bookingUrl, { waitUntil: 'networkidle2' });

  // === Step 3: Wait for form to load ===
  await page.waitForSelector('#membership_id');
  await page.type('#membership_id', membershipId);

  await page.waitForSelector('input[name="tanggal_lahir"]');
  await page.type('input[name="tanggal_lahir"]', birthDate);

  console.log('✅ Membership data filled');

  // === Step 4: Click booking date ===
  await page.waitForSelector(`button.tanggal-booking[data-tanggal="${bookingDate}"]`, { timeout: 5000 });
  await page.click(`button.tanggal-booking[data-tanggal="${bookingDate}"]`);

  console.log('📅 Booking date selected, waiting for lapangan...');

  // === Step 5: Wait and retry until lapangan is available ===
  let lapanganFound = false;
  while (!lapanganFound) {
    try {
      await page.waitForSelector(`button.nomor-lapangan[data-lapangan="${jamLapangan}"]`, { timeout: 1000 });
      await page.click(`button.nomor-lapangan[data-lapangan="${jamLapangan}"]`);
      lapanganFound = true;
      console.log('✅ Lapangan selected');
    } catch {
      console.log('⏳ Lapangan not ready yet, retrying...');
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForSelector('#membership_id');
      await page.type('#membership_id', membershipId);
      await page.waitForSelector('input[name="tanggal_lahir"]');
      await page.type('input[name="tanggal_lahir"]', birthDate);
      await page.waitForSelector(`button.tanggal-booking[data-tanggal="${bookingDate}"]`);
      await page.click(`button.tanggal-booking[data-tanggal="${bookingDate}"]`);
    }
  }

  // === Step 6: Click booking button ===
  await page.waitForSelector('button.btn-booking', { timeout: 3000 });
  await page.click('button.btn-booking');
  console.log('🚀 Booking button clicked');

  // === Step 7: Confirm booking ===
  await page.waitForSelector('button.btn-confirm-booking', { timeout: 3000 });
  await page.click('button.btn-confirm-booking');
  console.log('🔒 Confirm clicked');

  // === Step 8: Final Swal confirmation ===
  await page.waitForSelector('button.swal2-confirm.swal2-styled', { timeout: 3000 });
  await page.click('button.swal2-confirm.swal2-styled');
  console.log('🎉 Final confirmation done!');

  await browser.close();
})();
