const fs = require('fs');

const documentFunctions = [
  require('./scripts/the-federalist'),
  // require('./scripts/the-anti-federalist'),
];

let ctx = {
  documentsJson: [],
  sectionsJson: [],
  paragraphsJson: [],
  currDocumentsId: 1,
  currSectionsId: 1,
  currParagraphsId: 1,
}


async function scrape() {
  for (let i = 0; i < documentFunctions.length; i++) {
    ctx = await documentFunctions[i](ctx);
  }
}

function write() {
  fs.writeFile('documents.json', JSON.stringify(ctx.documentsJson, null, 4), (err)=> console.log('\n\ndocuments successfully written!\n\n'));
  fs.writeFile('sections.json', JSON.stringify(ctx.sectionsJson, null, 4), (err)=> console.log('\n\nsections successfully written!\n\n'));
  fs.writeFile('paragraphs.json', JSON.stringify(ctx.paragraphsJson, null, 4), (err)=> console.log('\n\nparagraphs successfully written!\n\n'));
}

scrape()
  .then(() => write())
  .catch(err => console.error(err));
