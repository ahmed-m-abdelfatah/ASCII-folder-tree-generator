// Get elements
const $input = document.querySelector('#input');
const $output = document.querySelector('#output');
const $downloadBtn = document.querySelector('#download');
const $copyBtn = document.querySelector('#copy');

// Events
$input.addEventListener('input', render);
$copyBtn.addEventListener('click', () => copyToClipboard($output));
$downloadBtn.addEventListener('click', () => downloadBatFile(globalBatFile));

// Logic
const regex = {
  newline: /\r?\n/,
  lineStructure: /^(#+)\s*(.+)$/, // ^(group of ###) (group of anything)$
};

let globalBatFile;

/**
Renders the output based on the input text and sets up the download button for the generated batch file.
@returns {void}
*/
function render() {
  const nodes = parse($input.value);
  const output = gen(nodes).join('\n');
  $output.textContent = output;

  // Generate batFile and combine commands into a single string
  globalBatFile = generateBatFile(nodes);
}

/**
Parses a string of text and returns an array of nested objects representing a tree structure based on the headings.
@param {string} text - The text to parse.
@returns {Array<Object>} - An array of nested objects representing the tree structure.
*/
function parse(text) {
  const nodes = [];
  let current = { level: -1, children: nodes };

  text.split(regex.newline).forEach(line => {
    // Ignore lines that don't start with a "#" symbol.
    if (!regex.lineStructure.test(line)) return;

    // Extract the level and text of the heading.
    const [, hashes, text] = line.match(regex.lineStructure);
    const level = hashes.length;
    const node = { level, text, children: [] };

    // Find the parent node of the current node.
    while (level <= current.level) {
      current = current.parent;
    }

    // Add the current node to the parent's children.
    current.children.push(node);
    node.parent = current;
    current = node;
  });

  // Return the root node of the tree.
  return nodes;
}

/**
Generates a string representation of a tree structure, given an array of nodes.
@param {Array<Object>} nodes - The array of nodes to generate the string representation for.
@param {number} level - The depth level of the current node (defaults to 0).
@param {string} prefix - The prefix string to use for the current node (defaults to an empty string).
@returns {Array<String>} - An array of strings representing the nodes in the tree.
*/
function gen(nodes, level = 0, prefix = '') {
  return nodes.map((node, index) => {
    const isLast = index === nodes.length - 1;
    const line = level ? `${prefix}${isLast ? '└' : '├'}── ` : '';
    const nextPrefix = level ? `${prefix}${isLast ? '    ' : '│   '}` : '';

    // Recursively generate the string representation of the node's children.
    return [`${line}${node.text || ''}`, ...gen(node.children, level + 1, nextPrefix)].join('\n');
  });
}

/**
Copies the text content of the given element to the clipboard using the navigator clipboard API.
@param {HTMLElement} element - The element whose text content should be copied.
@returns {void}
*/
function copyToClipboard(element) {
  navigator.clipboard
    .writeText(element.textContent)
    .then(() => {
      alert('Copied to clipboard!');
    })
    .catch(error => {
      console.error('Failed to copy text: ', error);
    });
}

/**
Generates a batch file that creates folders for each node recursively.
@param {Array<Object>} nodes - The array of nodes to generate the commands for.
@returns {Array<String>} - An array of commands that creates the folders.
*/
function generateBatFile(nodes) {
  const commands = [];

  // Recursively generate commands to create folders for each node
  nodes.forEach(node => {
    const folderName = node.text.trim().replace(/[^\w\s]/gi, ''); // Remove non-alphanumeric characters from folder name
    const command = `mkdir "${folderName}"`;
    commands.push(command);

    if (node.children.length > 0) {
      commands.push(`cd "${folderName}"`);
      commands.push(...generateBatFile(node.children));
      commands.push(`cd ..`);
    }
  });

  return commands;
}

/**
Downloads a .bat file.
@param {string[]} batFile - An array of strings containing the contents of the .bat file to be downloaded.
*/
function downloadBatFile(batFile) {
  const joinedBatFile = batFile.join('\n');

  const blob = new Blob([joinedBatFile], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'GENERATE-FOLDERS.bat';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Set the initial input text and render it.
$input.value = `
This folder structure is useful for civil engineers (designers) who working with BIM.

Notes:
[1] WIB (Work in progress)
[2] EIP (Employers Information Requirements)
[3] RVT (Revit)
[4] CAD (Autocad)
[5] DWG (Autocad)

# PROJECT NAME
## WIB
### CALCULATIONS
#### SAP
#### SAFE
#### ETABS
### REPORT
### RVT
### TEKLA
### CAD
## EIP
### YYMMDD-FOLDER NAME 1
### YYMMDD-FOLDER NAME 2
## PUBLISHED
### CALCULATIONS
#### SAP
#### SAFE
#### ETABS
### DWG
### PDF
### REPORT
### REVIT IFC
`.trim();

render();
