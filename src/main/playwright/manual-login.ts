import { chromium } from 'playwright';



export async function loginMatricula(){
    
        const browser = await chromium.launch({ headless: false });
        const context = await browser.newContext();
        const page = await context.newPage();
    await page.goto('https://www.jus.mendoza.gov.ar/tributario/precarga/users.php');

    console.log('🟡 Iniciá sesión manualmente. El navegador se cerrará en 60 segundos.');

    await page.waitForTimeout(60000);

    await context.storageState({ path: 'auth.json' });

    console.log('✅ auth.json guardado');
    await browser.close();

}


