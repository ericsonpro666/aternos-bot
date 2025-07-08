
const puppeteer = require("puppeteer");
const { Client, GatewayIntentBits } = require("discord.js");

const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD || "";
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once("ready", () => {
  console.log("🤖 Bot iniciado");
  checkAternos();
  setInterval(checkAternos, 1000 * 60 * 5);
});

async function checkAternos() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  try {
    await page.goto("https://aternos.org/go/", { waitUntil: "networkidle2" });
    await page.goto("https://aternos.org/accounts/", { waitUntil: "networkidle2" });

    await page.type("#user", USER);
    await page.type("#password", PASSWORD);
    await page.click("#login");
    await page.waitForTimeout(4000);

    await page.goto("https://aternos.org/server/", { waitUntil: "networkidle2" });

    const status = await page.evaluate(() => {
      return document.querySelector("#server-status").innerText.trim();
    });

    if (status.includes("offline")) {
      await page.click("#start");
      const channel = await client.channels.fetch(CHANNEL_ID);
      channel.send("🟢 Servidor Aternos encendido automáticamente.");
      console.log("Servidor encendido.");
    } else {
      console.log("El servidor ya está encendido o en cola.");
    }
  } catch (err) {
    console.error("Error al iniciar el servidor:", err);
  } finally {
    await browser.close();
  }
}

client.login(DISCORD_TOKEN);
