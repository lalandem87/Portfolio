const fs = require("node:fs");
const path = require("node:path");
const icon = require("./icon.js");
const writeDist = require("./dist.js");

function readTextFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    console.error(`Impossible de lire ${filePath}`, error.message);
    process.exit(1);
  }
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(readTextFile(filePath));
  } catch (error) {
    console.error(`Impossible de lire ${filePath} : `, error.message);
    process.exit(1);
  }
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const data = readJsonFile(path.join(__dirname, "data", "site.json"));
const htmlText = readTextFile(path.join(__dirname, "index.html"));

function insert(html, marker, content) {
  const tag = `<!-- @${marker} -->`;
  if (!html.includes(tag)) {
    console.error(`Repère introuvable dans index.html : ${tag}`);
    process.exit(1);
  }

  return html.replace(tag, content);
}

function renderTech(name) {
  return `<li class="tech">${icon("asterisk", 18, 2.4)}${escapeHtml(name)}</li>`;
}

const allTechs = [...new Set(data.stacks.flatMap((group) => group.items))];
const techsHTML = allTechs.map((tech) => renderTech(tech)).join("\n");

function renderMethod(id, iconM, title, desc) {
  return `
  <li class="step">
            <div class="step__head">
              <span class="step__number" aria-hidden="true">${escapeHtml(id)}</span>
              <span class="step__icon">${icon(iconM, 28, 1.6)}</span>
            </div>
            <h3 class="step__title">${escapeHtml(title)}</h3>
            <p class="step__text">
              ${escapeHtml(desc)}
            </p>
          </li>
  `;
}

const methodsHTML = data.method
  .map((step, index) =>
    renderMethod(
      String(index + 1).padStart(2, "0"),
      step.icon,
      step.title,
      step.desc,
    ),
  )
  .join("\n");

function renderProject(name, url, image, desc, tags) {
  if (!image) {
    console.error(`Image manquante pour le projet : ${name}`);
    process.exit(1);
  }

  return `<article class="project">
            <div class="project__preview">
              <img
                src="${escapeHtml(image)}"
                alt="${escapeHtml(name)}"
                width="626"
                height="366"
                loading="lazy"
              />
            </div>
            <div class="project__body">
              <div class="project__head">
                <h3>${escapeHtml(name)}</h3>
                <a
                  href="${escapeHtml(url)}"
                  class="project__link"
                  target="_blank"
                >
                  Voir le site<span class="sr-only"> ${escapeHtml(name)}</span>
                  ${icon("arrow-up-right", 16, 2)}
                </a>
              </div>
              <p class="project__text">
                ${escapeHtml(desc)}
              </p>
              <ul class="project__tags" role="list">
                ${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("\n")}
              </ul>
            </div>
          </article>`;
}

const projectsHTML = data.projects
  .map((project) =>
    renderProject(
      project.name,
      project.url,
      project.image,
      project.desc,
      project.tags,
    ),
  )
  .join("\n");

function renderMyStack(stack) {
  return `
  <div class="stack__row">
                <dt>${escapeHtml(stack.label)}</dt>
                <dd>${stack.items.map((item) => escapeHtml(item)).join(" · ")}</dd>
              </div>
  `;
}

const myStackHTML = data.stacks.map((stack) => renderMyStack(stack)).join("\n");

function renderService(service) {
  return `
  <li class="service">
            <span class="service__icon">
            ${icon(service.icon, 26, 1.8)}
            </span>
            <h3 class="service__title">${escapeHtml(service.name)}</h3>
            <p class="service__text">
             ${escapeHtml(service.desc)}
            </p>
          </li>
  `;
}

const servicesHTML = data.services
  .map((service) => renderService(service))
  .join("\n");

function renderDiploma(diploma) {
  return `
  <li class="diploma">
            <div class="diploma__main">
              <span class="diploma__icon">
              ${icon(diploma.icon, 24, 1.8)}
              </span>
              <div class="diploma__content">
                <h3 class="diploma__title">
                  ${escapeHtml(diploma.name)}
                </h3>
                <p class="diploma__desc">
                  ${escapeHtml(diploma.desc)}
                </p>
              </div>
            </div>
            <time class="diploma__year" datetime="${escapeHtml(diploma.year)}">${escapeHtml(diploma.year)}</time>
          </li>
  `;
}

const diplomasHTML = data.diplomas
  .map((diploma) => renderDiploma(diploma))
  .join("\n");

let html = insert(htmlText, "techs", techsHTML);
html = insert(html, "methods", methodsHTML);
html = insert(html, "projects", projectsHTML);
html = insert(html, "services", servicesHTML);
html = insert(html, "diplomas", diplomasHTML);
html = insert(html, "mystack", myStackHTML);

writeDist(html);
