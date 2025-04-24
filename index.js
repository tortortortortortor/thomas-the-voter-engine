const puppeteer = require('puppeteer');

async function vote() {
    const browser = await puppeteer.launch({
        headless: false
    });

    let page = null;

    try {
        page = await browser.newPage();
        
        console.log('Navigating to the voting page...');
        await page.goto('https://hyggeligste.no/2025/nominert/Thomas-Larsen-Viergo-AS/19783', {
            waitUntil: 'domcontentloaded' // Firefox doesn't support networkidle0
        });
        
        // Clear storage before proceeding
        await page.evaluate(() => {
            try {
                localStorage.clear();
                sessionStorage.clear();
            } catch (e) {
                // Ignore storage errors
            }
        });
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        console.log('Looking for cookie acceptance button...');
        const cookieButtonClicked = await page.evaluate(() => {
            try {
                const buttons = Array.from(document.querySelectorAll('button'));
                const cookieButton = buttons.find(button => 
                    button.textContent.trim() === 'Godkjenn nødvendige'
                );
                if (cookieButton) {
                    cookieButton.click();
                    return true;
                }
            } catch (e) {
                console.error('Error clicking cookie button:', e);
            }
            return false;
        });

        if (cookieButtonClicked) {
            console.log('Cookie button clicked successfully');
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            console.log('Cookie button not found or could not be clicked');
        }

        console.log('Looking for vote button...');
        const voteButtonClicked = await page.evaluate(() => {
            try {
                const buttons = Array.from(document.querySelectorAll('button'));
                const voteButton = buttons.find(button => 
                    button.textContent.trim() === 'Stem på Thomas Larsen'
                );
                if (voteButton) {
                    voteButton.click();
                    return true;
                }
            } catch (e) {
                console.error('Error clicking vote button:', e);
            }
            return false;
        });

        if (voteButtonClicked) {
            console.log('Vote button clicked successfully!');
            
            // Wait before clicking "NEI"
            console.log('Waiting before clicking NEI...');
            await new Promise(resolve => setTimeout(resolve, 15000));
            
            // Click the "NEI" button with error handling
            try {
                const neiButtonClicked = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const neiButton = buttons.find(button => 
                        button.textContent.trim() === 'NEI'
                    );
                    if (neiButton) {
                        neiButton.click();
                        return true;
                    }
                    return false;
                });

                if (neiButtonClicked) {
                    console.log('NEI button clicked successfully');
                } else {
                    console.log('NEI button not found or could not be clicked');
                }
            } catch (error) {
                console.log('Error while clicking NEI button, continuing anyway...');
            }
        } else {
            console.log('Vote button not found or could not be clicked');
        }
        
        // Wait 3 seconds before closing
        console.log('Waiting 3 seconds before closing...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Close the browser
        await browser.close();
        
        // Restart the process
        console.log('Restarting the voting process...');
        vote();
        
    } catch (error) {
        console.error('Error:', error);
        try {
            if (page) {
                await page.screenshot({ path: 'error-screenshot.png' });
                console.log('Error screenshot saved as error-screenshot.png');
            }
        } catch (screenshotError) {
            console.log('Could not save error screenshot');
        }
        
        // Close browser and restart on error
        if (browser) {
            await browser.close();
        }
        console.log('Restarting after error...');
        vote();
    }
}

vote(); 