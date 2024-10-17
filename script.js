// API URL to fetch Google Fonts via serverless function
const apiURL = `/api/fonts`;

// Choose which URL to use
// const finalApiURL = apiKey ? apiURL : apiCache;
const finalApiURL = apiURL;

// Function to adjust the margin of the fonts container
function adjustFontsContainerMargin() {
  const controlsDiv = document.getElementById("controls");
  const fontsContainer = document.getElementById("fonts-container");
  const controlsHeight = controlsDiv.offsetHeight;
  fontsContainer.style.marginTop = `${controlsHeight + 20}px`; // 20px extra for some spacing
}

// Create a MutationObserver instance
const observer = new MutationObserver(adjustFontsContainerMargin);

// Configuration of the observer
const config = { attributes: true, childList: true, subtree: true };

// Start observing the target node for configured mutations
const controlsDiv = document.getElementById("controls");
observer.observe(controlsDiv, config);

// Function to initialize font samples
async function initFontSamples() {
  const container = document.getElementById("fonts-container");

  try {
    // Fetch font list from API or cache
    const response = await fetch(finalApiURL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const fontList = data.items;

    // Get selected filters
    const selectedFilters = Array.from(
      document.querySelectorAll('input[name="filter"]:checked')
    ).map((input) => input.value);

    // Define filter criteria
    const filter = {
      features: selectedFilters,
      variants: ["regular", "italic"],
      subsets: ["latin"],
    };

    // Filter fonts based on criteria
    const fontListFiltered = await getFilteredGoogleFonts(fontList, filter);

    if (fontListFiltered.length === 0) {
      throw new Error("No fonts matched the filter criteria.");
    }

    // Extract font family names
    const families = fontListFiltered.map((font) => font.family);

    // Load the filtered fonts using Web Font Loader
    WebFont.load({
      google: {
        families: families.map((font) => `${font}:400`),
      },
      active: function () {
        // Once fonts are loaded, create samples
        fontListFiltered.forEach((font) => {
          createFontSample(font, container);
        });
      },
      inactive: function () {
        container.innerHTML = "<p>Failed to load fonts.</p>";
      },
    });
  } catch (error) {
    console.error("Error fetching or processing font list:", error);
    container.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

function createFontSample(font, container) {
  const textSampleContainer = document.createElement("div");
  textSampleContainer.className = "text-sample-container";

  const fontDiv = document.createElement("div");
  fontDiv.className = "font-sample";

  const fontName = document.createElement("div");
  fontName.className = "font-name";
  fontName.textContent = font.family;
  textSampleContainer.appendChild(fontName);

  const sampleText = document.createElement("div");
  sampleText.className = "sample-text";
  sampleText.style.fontFamily = `'${font.family}', sans-serif`;
  sampleText.textContent = document.getElementById("sample-textarea").value;
  textSampleContainer.appendChild(sampleText);

  fontDiv.appendChild(textSampleContainer);

  const table = createSampleTable();
  table.style.fontFamily = `'${font.family}', sans-serif`;

  fontDiv.appendChild(table);

  container.appendChild(fontDiv);
  updateTableWidthDivs(table);
}

const tableDef = {
  rows: 2,
  cols: 2,
};

const inputs = ["input1", "input2", "input3", "input4"];

function createSampleTable() {
  const table = document.createElement("table");
  table.className = "sample-table";

  for (let i = 0; i < tableDef.rows; i++) {
    const row = table.insertRow();
    for (let j = 0; j < tableDef.cols; j++) {
      const cell = row.insertCell();
      // set to 50% width
      cell.style.width = "50%";
      // cell.position = "relative";
      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.justifyContent = "space-between";
      container.style.width = "100%";
      container.className = "table-cell-container";
      cell.appendChild(container);
      // create div to show the width of the text
      const widthDiv = document.createElement("div");
      widthDiv.className = "width-div";
      widthDiv.style.color = "gray";
      widthDiv.style.fontSize = "10px";
      widthDiv.style.fontFamily = "monospace";
      widthDiv.textContent = cell.textContent.length * 10;
      container.appendChild(widthDiv);
      //create div for the text
      const textDiv = document.createElement("div");
      textDiv.className = "table-text";

      // set the text content
      textDiv.textContent = document.getElementById(
        inputs[i * tableDef.cols + j]
      ).value;

      // append the text div to the cell
      container.appendChild(textDiv);

      // const textWidth = textDiv.
      widthDiv.textContent = `${textDiv.offsetWidth}px x ${textDiv.offsetHeight}px`;
    }
  }
  return table;
}
const textChangeObserver = new MutationObserver(updateWidthDivs);
function addEventListeners() {
  document.querySelectorAll(".table-text").forEach((textDiv) => {
    textChangeObserver.observe(textDiv, { childList: true });
  });
}

// Function to update text in the samples based on input
function updateSampleText() {
  const text = document.getElementById("sample-textarea").value;
  const samples = document.querySelectorAll(".sample-text");
  samples.forEach((sample) => {
    sample.textContent = text;
  });
}

// Function to update the sample tables
function updateSampleTables() {
  const tables = document.querySelectorAll(".sample-table");
  tables.forEach((table) => {
    let i = 0;
    for (let row of table.rows) {
      for (let cell of row.cells) {
        const container = cell.querySelector(".table-cell-container");
        const textDiv = container.querySelector(".table-text");
        textDiv.textContent = document.getElementById(inputs[i]).value;
        const widthDiv = container.querySelector(".width-div");
        i++;
      }
    }
  });
}

function updateTableWidthDivs(table) {
  for (let row of table.rows) {
    for (let cell of row.cells) {
      const container = cell.querySelector(".table-cell-container");
      const textDiv = container.querySelector(".table-text");
      const widthDiv = container.querySelector(".width-div");
      widthDiv.textContent = `${textDiv.offsetWidth}px x ${textDiv.offsetHeight}px`;
    }
  }
}

function updateWidthDivs() {
  const tables = document.querySelectorAll(".sample-table");
  tables.forEach((table) => {
    for (let row of table.rows) {
      for (let cell of row.cells) {
        const container = cell.querySelector(".table-cell-container");
        const textDiv = container.querySelector(".table-text");
        const widthDiv = container.querySelector(".width-div");
        widthDiv.textContent = `${textDiv.offsetWidth}px x ${textDiv.offsetHeight}px`;
      }
    }
  });
}

// Function to apply font feature settings
function applyFeatureSettings() {
  const selectedFeatures = Array.from(
    document.querySelectorAll('input[name="feature"]:checked')
  ).map((input) => input.value);
  const featureString = selectedFeatures
    .map((feature) => `"${feature}" 1`)
    .join(", ");

  // set body font feature settings
  document.body.style.fontFeatureSettings = featureString;
  updateWidthDivs();
}

// Function to filter Google Fonts based on criteria
async function getFilteredGoogleFonts(fontList, filter = {}) {
  const fontListFiltered = [];

  // Merge with defaults
  filter = {
    ...{
      family: [],
      category: [],
      features: [],
      variants: [],
      subsets: [],
      colorCapabilities: [],
      axes: [],
    },
    ...filter,
  };

  for (let i = 0; i < fontList.length; i++) {
    const font = fontList[i];
    const {
      family,
      category,
      files,
      subsets,
      variants,
      axes = [],
      colorCapabilities = [],
    } = font;

    // Apply family filter
    if (filter.family.length && !filter.family.includes(family)) continue;

    // Apply colorCapabilities filter
    if (filter.colorCapabilities.length) {
      if (!colorCapabilities.length) continue;
      const hasColors = filter.colorCapabilities.every((color) =>
        colorCapabilities.includes(color)
      );
      if (!hasColors) continue;
    }

    // Apply axes filter
    const axesNames = axes.map((item) => item.tag);
    if (filter.axes.length) {
      if (!axesNames.length) continue;
      const hasAxes = filter.axes.every((axis) => axesNames.includes(axis));
      if (!hasAxes) continue;
    }

    // Apply category filter
    if (filter.category.length && !filter.category.includes(category)) continue;

    // Apply variants filter
    if (filter.variants.length) {
      const hasVariants = filter.variants.every((variant) =>
        variants.includes(variant)
      );
      if (!hasVariants) continue;
    }

    // Apply subsets filter
    if (filter.subsets.length) {
      const hasSubset = filter.subsets.every((subset) =>
        subsets.includes(subset)
      );
      if (!hasSubset) continue;
    }

    if (filter.features.length === 0) {
      // Get the font features via lib.font
      let fontUrl = files.regular ? files.regular : Object.values(files)[0];
      let features = await getFontFeatures(fontUrl);

      // Check if font matches the features filter
      let hasFeatures = filter.features.every((feature) =>
        features.includes(feature)
      );
      if (!hasFeatures) continue;
    }

    // If the font matches all criteria, add it to the filtered list
    fontListFiltered.push(font);
  }

  return fontListFiltered;
}

// Event listeners
document
  .getElementById("sample-textarea")
  .addEventListener("input", updateSampleText);
document.querySelectorAll(".input-grid input").forEach((input) => {
  input.addEventListener("input", updateSampleTables);
});
document.querySelectorAll('input[name="filter"]').forEach((input) => {
  input.addEventListener("change", initFontSamples);
});
document.querySelectorAll('input[name="feature"]').forEach((input) => {
  input.addEventListener("change", applyFeatureSettings);
});

// Initialize on page load
window.onload = () => {
  initFontSamples();
  adjustFontsContainerMargin(); // Initial adjustment
  updateWidthDivs();
  addEventListeners();
};

// Adjust margin on window resize
window.addEventListener("resize", adjustFontsContainerMargin);
