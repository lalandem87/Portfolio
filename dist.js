const fs = require("node:fs");
const path = require("node:path");

const distDir = path.join(__dirname, "dist");

function writeDist(html) {
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });

  fs.writeFileSync(path.join(distDir, "index.html"), html);
  fs.copyFileSync(
    path.join(__dirname, "style.css"),
    path.join(distDir, "style.css"),
  );

  if (fs.existsSync(path.join(__dirname, "assets"))) {
    fs.cpSync(path.join(__dirname, "assets"), path.join(distDir, "assets"), {
      recursive: true,
    });
  }

  console.log("Build terminée : dist/index.html");
}

module.exports = writeDist;
