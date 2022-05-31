let currentToken = "";
let expiresIn = new Date();

async function getWLToken() {
  // curl -u x:y -d grant_type=client_credentials https://www.warcraftlogs.com/oauth/token
  const basic = Buffer.from(`${process.env.WL_ID}:${process.env.WL_SECRET}`).toString("base64");
  const res = await fetch("https://www.warcraftlogs.com/oauth/token", {
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST"
  });

  const data = await res.json();

  if (res.status != 200) {
    throw new Error(`${res.status} - ${res.statusText}\n${data}`);
  }

  currentToken = data.access_token;
  expiresIn = new Date();
  expiresIn = expiresIn.setSeconds(expiresIn.getSeconds() + data.expires_in);
}

// {"query":"{\n\treportData {\n\t\treport(code: \"pmxJZcQ1f37w94jd\") {\n\t\t\tevents(dataType: Casts, abilityID: 28499, useActorIDs: false) {\n\t\t\t\tdata\n\t\t\t\tnextPageTimestamp\n\t\t\t}\n\t\t}\n\t}\n}"}
async function callWLAPI(graphql) {
  if ((new Date()) > expiresIn) {
    await getWLToken();
  }
  console.log(expiresIn);
  return await fetch("https://classic.warcraftlogs.com/api/v2/client", {
    body: JSON.stringify(graphql),
    headers: {
      Authorization: `Bearer ${currentToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });
}

module.exports = { callWLAPI };

