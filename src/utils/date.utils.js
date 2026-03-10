function getMexicoISO() {
  const date = new Date();
  const mexico = new Date(
    date.toLocaleString("en-US", { timeZone: "America/Mexico_City" })
  );
  return mexico.toISOString().replace("Z", "");
}

function getMexicoTimestamp() {
  const date = new Date();
  return date.toLocaleString("en-US", { timeZone: "America/Mexico_City" });
}

module.exports = {
  getMexicoISO,
  getMexicoTimestamp
};