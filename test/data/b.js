module.exports = function (n) { 
  return [
    requireFile('b.html'),
    (n * 42)
  ].join("\n");
};