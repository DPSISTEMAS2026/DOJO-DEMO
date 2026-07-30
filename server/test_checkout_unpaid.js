import fetch from 'node-fetch';

async function test() {
  const payload = {
    student: {
      id: 128, // PRUEBA DP, Sede 2
      name: "PRUEBA DP",
      email: "d.diazaraya7@gmail.com",
      sedeId: 2
    },
    amount: 36391,
    withSurcharge: true
  };

  try {
    console.log("Sending request to https://dojo-demo-server.onrender.com/api/checkout...");
    const response = await fetch("https://dojo-demo-server.onrender.com/api/checkout", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "accept-encoding": "identity" // Prevent gzip chunking errors in test
      },
      body: JSON.stringify(payload)
    });

    console.log(`Response Status: ${response.status}`);
    const text = await response.text();
    console.log("Response Body:");
    console.log(text);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
