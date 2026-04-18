require('dotenv').config()

const admin = require('firebase-admin');
const serviceAccount = require('./civdocs-us-firebase-adminsdk-2bezh-0ad2211729.json');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { doc, getFirestore, setDoc } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');

const GLOBALS = {
  appConfig: {
    credential: admin.credential.applicationDefault(),
  },
  collections: process.env.COLLECTIONS.split(','),
};

const readFile = util.promisify(fs.readFile);

async function createCollection(db, collectionName) {
  const collectionFilePath = path.join(__dirname, './compiledJson/', `${collectionName}.json`);
  const collectionJson = await readFile(collectionFilePath)
    .then(res => JSON.parse(res.toString()));

  for (let i = 0; i < collectionJson.length; i++) {
    const document = collectionJson[i];
    const snakeCaseTitle = document.title.toLowerCase().replace(/\s/g, '_');

    console.log({ collectionName, snakeCaseTitle });
    await setDoc(doc(db, collectionName, snakeCaseTitle), document);
  }
}

async function main() {
  console.log('\n\n\tBUILDING REMOTE FIRESTORE FROM JSON...\n');

  try {
    admin.initializeApp(GLOBALS.appConfig);

    const db = admin.firestore();

    const collections = GLOBALS.collections;

    for (let i = 0; i < collections.length; i++) {
      await createCollection(db, collections[i]);
    }

    console.log('\n\tREMOTE FIRESTORE SUCCESSFULLY BUILT!\n\n');
  } catch (err) {
    console.error(err);
  }
}

main();
