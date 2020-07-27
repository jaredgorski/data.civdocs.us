const fs = require('fs');
const util = require('util');

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

const {compileCtxFromJson} = require('./compile');

const DOCUMENT_NAMES = [
  'the-federalist',
  // 'the-anti-federalist',
];

async function scrape() {
  console.log('\n\n\tSCRAPING...\n');

  async function scrapeAll() {
    for (let i = 0; i < DOCUMENT_NAMES.length; i++) {
      const name = DOCUMENT_NAMES[i];
      const script = require(`./scripts/${name}`);
      const docJson = await script();

      await writeFile(`./docJson/${name}.json`, JSON.stringify(docJson, null, 4), (err)=> console.log(`\n\n${name} successfully scraped and written!\n\n`));
    }
  }

  await scrapeAll()
    .then(() => console.log('\n\tSCRAPE FINISHED\n'))
    .catch(err => console.error(err));
}

async function compile() {
  console.log('\n\n\tCOMPILING...\n');

  async function compileAll(ctx) {
    for (let i = 0; i < DOCUMENT_NAMES.length; i++) {
      const name = DOCUMENT_NAMES[i];
      const docJsonFilePath = `./docJson/${name}.json`;

      const docJson = await readFile(docJsonFilePath)
        .then(res => JSON.parse(res.toString()));

      ctx = compileCtxFromJson(ctx, docJson);
    }

    return ctx;
  }

  async function write(ctx) {
    await writeFile('documents.json', JSON.stringify(ctx.documentsJson, null, 4), (err)=> console.log('\n\ndocuments successfully compiled and written!\n\n'));
    await writeFile('sections.json', JSON.stringify(ctx.sectionsJson, null, 4), (err)=> console.log('\n\nsections successfully compiled and written!\n\n'));
    await writeFile('paragraphs.json', JSON.stringify(ctx.paragraphsJson, null, 4), (err)=> console.log('\n\nparagraphs successfully compiled and written!\n\n'));
  }

  let context = {
    documentsJson: [],
    sectionsJson: [],
    paragraphsJson: [],
    currDocumentsId: 1,
    currSectionsId: 1,
    currParagraphsId: 1,
  }

  await compileAll(context)
    .then(async ctx => await write(ctx))
    .then(() => console.log('\n\tCOMPILE FINISHED\n'))
    .catch(err => console.error(err));
}

async function main() {
  if (process.argv.includes('--scrape')) {
    await scrape();
  }

  if (process.argv.includes('--compile')) {
    await compile();
  }
}

main();
