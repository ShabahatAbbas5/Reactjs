const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function createPDF(formData,invoiceNumber, filePath) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000); // Set timeout to 60 seconds

    // Convert amount to a number and format it
    const amount = Number(formData.cost) || 0;
    // Load HTML template and replace placeholders
    let html = fs.readFileSync(path.join(__dirname, 'pdfTemplate.html'), 'utf8');
    html = html
      .replace('{{invoiceNumber}}', invoiceNumber)
      .replace('{{applicantName}}', formData.applicantName)
      .replace('{{applicantEmail}}', formData.applicantEmail)
      .replace('{{applicationDate}}', formData.applicationDate)
      .replace('{{serviceAddress}}', formData.serviceAddress)
      .replace('{{cost}}', amount.toFixed(2));

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: filePath, format: 'A4' });

    console.log('PDF created successfully.');
  } catch (error) {
    console.error('Error creating PDF:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = createPDF;
