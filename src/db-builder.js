require('dotenv').config()

const fs = require('fs');
const knex = require('knex');
const util = require('util');

const readFile = util.promisify(fs.readFile);

const GLOBALS = {
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    typeCast: (field, next) => {
      if (field.type !== 'TINY') {
        return next();
      }

      var val = field.string();

      if (val === null) {
        return null;
      }

      return (Number(val) > 0);
    },
  },
  db: {
    schema: process.env.DB_DATABASE,
    tables: [
      {
        name: 'documents',
        columns: {
          'document_id': 'integer',
          'title': 'text',
          'description': 'text',
          'author': 'text',
          'date': 'text',
          'source': 'text',
          'citation': 'text',
          'sections_total': 'integer',
        },
        primary: 'document_id',
      },
      {
        name: 'sections',
        columns: {
          'document_title': 'text',
          'document_id': 'integer',
          'title': 'text',
          'subtitle': 'text',
          'author': 'text',
          'date': 'text',
          'section_id': 'integer',
          'prev_section_id': 'integer',
          'next_section_id': 'integer',
          'section_index': 'integer',
          'prev_section_index': 'integer',
          'next_section_index': 'integer',
          'prev_section_title': 'text',
          'next_section_title': 'text',
          'is_last_section': 'boolean',
          'sections_total': 'integer',
          'paragraphs_total': 'integer',
        },
        primary: 'section_id',
      },
      {
        name: 'paragraphs',
        columns: {
          'document_title': 'text',
          'document_id': 'integer',
          'title': 'text',
          'subtitle': 'text',
          'author': 'text',
          'date': 'text',
          'section_id': 'integer',
          'section_index': 'integer',
          'paragraph_id': 'integer',
          'prev_paragraph_id': 'integer',
          'next_paragraph_id': 'integer',
          'paragraph_index': 'integer',
          'prev_paragraph_index': 'integer',
          'next_paragraph_index': 'integer',
          'is_last_paragraph': 'boolean',
          'paragraphs_total': 'integer',
          'content': 'text'
        },
        primary: 'paragraph_id',
      },
    ],
  },
};

async function createTable(db, table) {
  const tableName = table.name;
  const tableFilePath = `./compiledJson/${tableName}.json`;
  const tableJson = await readFile(tableFilePath)
    .then(res => JSON.parse(res.toString()));

  await db.schema.dropTableIfExists(tableName)
    .then(() => {
      return db.schema.withSchema(GLOBALS.db.schema).createTable(tableName, t => {
        const columns = table.columns;
        const columnKeys = Object.keys(columns);

        for (let i = 0; i < columnKeys.length; i++) {
          const key = columnKeys[i];
          const type = columns[key];

          t[type](key);
        }

        t.primary([table.primary]);
      });
    })
    .then(() => db(tableName).insert(tableJson))
    .catch(err => {
      throw new Error(err)
    });

  // workaround to initiate typeCast from TINYINT to BOOLEAN
  await db(tableName)
    .select()
    .then((rows) => {});
}

async function main() {
  console.log('\n\n\tBUILDING REMOTE SQL FROM JSON...\n');

  try {
    const db = knex({
      client: 'mysql',
      connection: GLOBALS.connection,
      useNullAsDefault: true,
    });

    const tables = GLOBALS.db.tables;

    for (let i = 0; i < tables.length; i++) {
      await createTable(db, tables[i]);
    }

    db.destroy();

    console.log('\n\tREMOTE SQL SUCCESSFULLY BUILT!\n\n');
  } catch (err) {
    console.error(err);
  }
}

main();
