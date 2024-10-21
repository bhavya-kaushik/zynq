const fs = require('fs');
const yargs = require('yargs');

const argv = yargs
  .option('c', { alias: 'bytes', type: 'boolean', description: 'Print the byte count' })
  .option('l', { alias: 'lines', type: 'boolean', description: 'Print the line count' })
  .option('w', { alias: 'words', type: 'boolean', description: 'Print the word count' })
  .option('m', { alias: 'chars', type: 'boolean', description: 'Print the character count' })
  .argv;

const input = argv._[0];

function count(fileContent) {
  const lines = fileContent.split('\n').length;
  const words = fileContent.split(/\s+/).filter(Boolean).length;
  const bytes = Buffer.byteLength(fileContent, 'utf8');
  const chars = fileContent.length;

  const counts = {
    lines,
    words,
    bytes,
    chars,
  };

  return counts;
}

function printCounts(fileName, counts) {
  const result = [];

  if (argv.l || (!argv.l && !argv.w && !argv.c && !argv.m)) result.push(counts.lines);
  if (argv.w || (!argv.l && !argv.w && !argv.c && !argv.m)) result.push(counts.words);
  if (argv.c || (!argv.l && !argv.w && !argv.c && !argv.m)) result.push(counts.bytes);
  if (argv.m) result.push(counts.chars);

  result.push(fileName);
  console.log(result.join('\t'));
}

if (input) {
  fs.readFile(input, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error(`File not found: ${input}`);
      } else if (err.code === 'EACCES') {
        console.error(`Permission denied: ${input}`);
      } else {
        console.error(`An error occurred while reading the file: ${err.message}`);
      }
      return;
    }
    const counts = count(data);
    printCounts(input, counts);
  });
} else {
  process.stdin.setEncoding('utf8');
  let data = '';
  process.stdin.on('data', chunk => {
    data += chunk;
  });
  process.stdin.on('error', (err) => {
    console.error(`An error occurred while reading from stdin: ${err.message}`);
  });
  process.stdin.on('end', () => {
    const counts = count(data);
    printCounts('standard input', counts);
  });
}