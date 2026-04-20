const http = require('http');

const data = JSON.stringify({
  name: "Antique Temple Necklace",
  price: "0",
  weight: "50",
  purity: "Antique (Traditional Jewellery)",
  makingCharges: "500",
  gst: "3",
  image: "https://images.unsplash.com/photo-1599643478524-fb66f70d00f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  category: "Temple Jewellery",
  subcategory: "Necklace",
  quantity: 10
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/products',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
