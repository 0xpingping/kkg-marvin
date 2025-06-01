// booking.js
import puppeteer from 'puppeteer';

const MEMBERSHIP_ID = 'TM103540';
const TARGET_COURT = '21'; // You can change this to 20, 21, etc.

function getTargetDateString() {
  const now = new Date();
  now.setDate(now.getDate() + 1); // tomorrow
  return now.toISOString().split('T')[0]; // format: YYYY-MM-DD
}

async function runBooking() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🌐 Opening booking page...');
    await page.goto('https://www.klubkelapagading.com/booking/6/tennis-outdor#customer-info', {
      waitUntil: 'networkidle2'
    });

    const targetDate = getTargetDateString();
    console.log(`📅 Targeting date: ${targetDate}`);

    // Wait and click the correct date button
    await page.waitForSelector(`button.tanggal-booking[data-tanggal="${targetDate}"]`, { timeout: 10000 });
    await page.click(`button.tanggal-booking[data-tanggal="${targetDate}"]`);
    console.log('✅ Date selected');

    // Wait for jamlapangan to appear
    await page.waitForSelector('.jamlapangan', { timeout: 10000 });

    // Wait for and click court
    const courtSelector = `button.nomor-lapangan[data-lapangan="${TARGET_COURT}"]`;
    console.log(`⏳ Waiting for selector: ${courtSelector}`);
    await page.waitForSelector(courtSelector, { timeout: 15000 });
    await page.click(courtSelector);
    console.log('✅ Court selected');

    // Fill in membership ID
    await page.waitForSelector('#memberID', { timeout: 5000 });
    await page.type('#memberID', MEMBERSHIP_ID);
    console.log('✅ Membership ID entered');

    // Click booking button
    const bookButtonSelector = 'button.btn-pesan';
    await page.waitForSelector(bookButtonSelector, { timeout: 5000 });
    await page.click(bookButtonSelector);
    console.log('🎉 Booking submitted!');
  } catch (error) {
    console.error('Booking failed:', error);
  } finally {
    await browser.close();
  }
}

runBooking();
