const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('response', async (response) => {
    const url = response.url();
    
    if (url.includes('api.goldenvolunteer.com/api/v1/opportunity')) {
      console.log('Intercepted URL:', url);
      console.log('Status:', response.status());
      
      try {
        const json = await response.json();
        console.log('Payload:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Response body:', await response.text());
      }
    }
  });

  await page.goto('https://volunteer.chipsonline.org/opportunities/3e2EqMwlXM', {
    waitUntil: 'networkidle'
  });

  await browser.close();
})();
