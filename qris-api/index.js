const express = require('express');
const { chromium } = require('playwright');

const app = express();
app.use(express.json());

// ==================
// ROOT
// ==================
app.get('/', (req, res) => {
  res.send('QRIS API RUNNING 🚀');
});

// ==================
// CREATE QRIS
// ==================
app.post('/create-qris', async (req, res) => {
  let browser;

  try {
    const { username, amount } = req.body;

    if (!username || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Parameter kurang'
      });
    }

    // 🔥 Launch browser (FIX REPLIT)
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // 🔥 Random data
    const rand = Math.floor(Math.random() * 9999);
    const sender = "User" + rand;
    const email = `user${rand}@gmail.com`;
    const message = "Donate bang #" + rand;

    console.log("Load halaman Saweria...");

    await page.goto(`https://saweria.co/${username}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // 🔥 Ambil __NEXT_DATA__
    const raw = await page.locator('#__NEXT_DATA__').innerText();
    const json = JSON.parse(raw);

    const user_id = json?.props?.pageProps?.data?.id;

    if (!user_id) {
      throw new Error("User ID tidak ditemukan");
    }

    console.log("User ID:", user_id);

    // 🔥 Payload
    const payload = {
      agree: true,
      notUnderage: true,
      message: message,
      amount: parseInt(amount),
      payment_type: "qris",
      vote: "",
      currency: "IDR",
      customer_info: {
        first_name: sender,
        email: email,
        phone: ""
      }
    };

    console.log("Create payment...");

    const response = await page.request.post(
      `https://backend.saweria.co/donations/${user_id}`,
      {
        data: payload,
        timeout: 60000
      }
    );

    const result = await response.json();

    await browser.close();

    return res.json({
      success: true,
      data: {
        qr_string: result.data.qr_string,
        trx_id: result.data.id
      }
    });

  } catch (err) {

    if (browser) {
      await browser.close();
    }

    console.error("ERROR:", err.message);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ==================
// START SERVER
// ==================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
    // payload
    const payload = {
      agree: true,
      notUnderage: true,
      message: message,
      amount: parseInt(amount),
      payment_type: "qris",
      vote: "",
      currency: "IDR",
      customer_info: {
        first_name: sender,
        email: email,
        phone: ""
      }
    };

    // request ke backend saweria
    const response = await page.request.post(
      `https://backend.saweria.co/donations/${user_id}`,
      { data: payload }
    );

    const result = await response.json();

    await browser.close();

    return res.json({
      success: true,
      data: {
        qr_string: result.data.qr_string,
        trx_id: result.data.id
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.get('/', (req, res) => {
  res.send('QRIS API RUNNING');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
