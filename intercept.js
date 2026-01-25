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

        // Parse times section for available weekend slots
        if (json.times && Array.isArray(json.times)) {
          const weekendAvailable = json.times.filter(timeSlot => {
            // Check if available is true
            if (!timeSlot.available) return false;

            // Parse the date and check if it's a weekend
            const date = new Date(timeSlot.start || timeSlot.date);
            const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

            return dayOfWeek === 0 || dayOfWeek === 6;
          });

          if (weekendAvailable.length > 0) {
            console.log('\n🎯 Available Weekend Slots Found:');
            weekendAvailable.forEach(slot => {
              const date = new Date(slot.start || slot.date);
              const dayName = date.getDay() === 0 ? 'Sunday' : 'Saturday';
              console.log(`  - ${dayName}, ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`);
              console.log(`    ${JSON.stringify(slot, null, 2)}`);
            });
          } else {
            console.log('\n❌ No available weekend slots found');
          }
        }
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
