fetch("http://localhost:3000/api/auth/callback/credentials", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: "email=admin%40burizalsayur.com&password=110879"
}).then(res => console.log(res.status)).catch(console.error);
