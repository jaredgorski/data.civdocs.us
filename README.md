<div align="center">
  <h1>
    🇺🇸 data.civdocs.us
  </h1>
</div>

This repository contains the necessary materials for scraping and compiling data from civdocs.us sources into JSON data and then building the remote SQL database.

```
src/
  compiledJson/           // compiled JSON files with merged data from scraped JSON
    documents.json
    paragraphs.json
    sections.json
  scrapedJson/            // individual JSON files from scraping, stored for repeated use
    ...
  scripts/                // individual scripts for scraping documents into JSON files for compilation
    ...
  compile.js              // utility logic yielding compiled JSON from scraped JSON
  db-builder.js           // contains logic for building remote SQL database from compiled JSON
  index.js                // top-level logic
exec.sh                   // main script
```

<div align="center">
  <h2>
    Usage
  </h2>
</div>

```shell
$ ./exec.sh [ -s | -c | -p ]
```

Command  | Info
-------- | --------
**-s** SCRAPE | Execute scrape scripts currently uncommented in index.js DOCUMENT_NAMES
**-c** COMPILE | Execute compilation from scrapedJson
**-p** PRODUCTION | Build production database (defaults to local credentials)

_Note: this program assumes `src/.env` `src/.env-local`, and `src/.env-production` files containing the required database credentials._

## Repo links
- [civdocs.us](https://github.com/jaredgorski/civdocs.us)
- [api.civdocs.us](https://github.com/jaredgorski/api.civdocs.us)
