import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:5173", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Click on the Register link to go to the registration page.
        frame = context.pages[-1]
        # Click on the Register link in the top navigation to go to the registration page.
        elem = frame.locator('xpath=html/body/div/div[2]/header/div/div/div/a[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Submit the registration form with all required fields empty to check for error messages.
        frame = context.pages[-1]
        # Click the Create Account button to submit the form with missing required fields.
        elem = frame.locator('xpath=html/body/div/div[2]/main/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill the Email Address field with an invalid email format and submit the form to check for email validation error.
        frame = context.pages[-1]
        # Input invalid email format into Email Address field.
        elem = frame.locator('xpath=html/body/div/div[2]/main/div/div/div/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('invalid-email-format')
        

        frame = context.pages[-1]
        # Input password to bypass password required validation for this test.
        elem = frame.locator('xpath=html/body/div/div[2]/main/div/div/div/form/div[2]/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('123456')
        

        frame = context.pages[-1]
        # Input company name to bypass company name required validation for this test.
        elem = frame.locator('xpath=html/body/div/div[2]/main/div/div/div/form/div[3]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Test Company')
        

        frame = context.pages[-1]
        # Input phone number to bypass phone number required validation for this test.
        elem = frame.locator('xpath=html/body/div/div[2]/main/div/div/div/form/div[3]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('5551234567')
        

        frame = context.pages[-1]
        # Input USDOT Number to bypass USDOT required validation for this test.
        elem = frame.locator('xpath=html/body/div/div[2]/main/div/div/div/form/div[4]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('1234567')
        

        frame = context.pages[-1]
        # Input EIN to bypass EIN required validation for this test.
        elem = frame.locator('xpath=html/body/div/div[2]/main/div/div/div/form/div[4]/div[3]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('12-3456789')
        

        frame = context.pages[-1]
        # Click Create Account button to submit form with invalid email format.
        elem = frame.locator('xpath=html/body/div/div[2]/main/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Submit the registration form with a weak password to verify password strength validation error.
        frame = context.pages[-1]
        # Input weak password to test password strength validation.
        elem = frame.locator('xpath=html/body/div/div[2]/main/div/div/div/form/div[2]/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('123')
        

        frame = context.pages[-1]
        # Click Create Account button to submit form with weak password.
        elem = frame.locator('xpath=html/body/div/div[2]/main/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Try a stronger password input and resubmit to confirm if any password validation triggers, or check for other validation errors.
        frame = context.pages[-1]
        # Input a stronger password to check if password validation triggers.
        elem = frame.locator('xpath=html/body/div/div[2]/main/div/div/div/form/div[2]/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('StrongPass123!')
        

        frame = context.pages[-1]
        # Click Create Account button to resubmit form with stronger password.
        elem = frame.locator('xpath=html/body/div/div[2]/main/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Correct the email format to a valid email and submit with weak password to isolate password validation check.
        frame = context.pages[-1]
        # Input valid email format to isolate password validation.
        elem = frame.locator('xpath=html/body/div/div[2]/main/div/div/div/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('broker@gmail.com')
        

        frame = context.pages[-1]
        # Input weak password to test password strength validation.
        elem = frame.locator('xpath=html/body/div/div[2]/main/div/div/div/form/div[2]/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('123')
        

        frame = context.pages[-1]
        # Click Create Account button to submit form with valid email and weak password.
        elem = frame.locator('xpath=html/body/div/div[2]/main/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Join CargoLume today').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Account Type').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Email Address *').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Password *').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Company Name *').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Phone Number *').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=USDOT Number *').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=EIN *').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Create Account').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    