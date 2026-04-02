const express = require('express');
const { chromium } = require('playwright');

const app = express();
app.use(express.json());

app.post('/create-qris', async (req, res) => {
  try {
    const { username, amount } = req.body;

    if (!username || !amount) {
      return res.status(400).json({ error: 'Parameter kurang' });
    }

    const browser = await chromium.launch({
      headless: true
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // random data
    const rand = Math.floor(Math.random() * 9999);
    const sender = "User" + rand;
    const email = `user${rand}@gmail.com`;
    const message = "Donate #" + rand;

    // load halaman
    await page.goto(`https://saweria.co/${username}`, {
      waitUntil: 'domcontentloaded'
    });

    // ambil user_id
    const data = await page.locator('#__NEXT_DATA__').innerText();
    const json = JSON.parse(data);
    const user_id = json.props.pageProps.data.id;

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
