const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

const DOC = {
  title: 'The Federalist',
  description: 'A collection of 85 essays written by Alexander Hamilton, John Jay, and James Madison arguing in favor of ratifying the proposed Constitution of the United States of America.',
  author: 'Alexander Hamilton, John Jay, and James Madison',
  date: 'October 1787 - May 1788',
  source: 'https://guides.loc.gov/federalist-papers/full-text',
  citation: '"Federalist Papers: Primary Documents in American History: Full Text of The Federalist Papers." Library of Congress Research Guides, Library of Congress, guides.loc.gov/federalist-papers/full-text.',
}

function scrape() {
  return new Promise(async (resolve, reject) => {
    let sections = [];

    const increments = ['1-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-85'];
    for (let i = 0; i < increments.length; i++) {
      const increment = increments[i];
      await axios.get(`https://guides.loc.gov/federalist-papers/text-${increment}`)
        .then(res => {
          if (res.status == 200) {
            const html = res.data;
            const $ = cheerio.load(html);

            $('sup').remove();

            const secSelector = '[class^=s-lg-box-wrapper]';
            $(secSelector).each((i, el) => {
              if (i === 0) return;

              let author = null;
              let subtitle = '';
              let date = null;
              let paragraphs = [];

              const title = $(el).find('h2').text().trim() || '';

              const contentBlockEl = $(el).find('.s-lib-box-content');
              $(contentBlockEl).find('p').each((j, cel) => {
                if (j === 0) {
                  subtitle = $(cel).find('strong').text().trim();
                } else if (!date && !author) {
                  const potentialDate = $(cel).text().replace(/.*\n/, '').replace(/\./, '').trim();

                  if (moment(potentialDate).isValid()) {
                    date = potentialDate;
                  } else if ($(cel).text().includes('Author:')) {
                    author = $(cel).find('strong').text().trim().replace(/HamiltonJames/, 'Hamilton, James');
                  };
                } else if (!author) {
                  if ($(cel).text().includes('Author:')) {
                    author = $(cel).find('strong').text().trim().replace(/HamiltonJames/, 'Hamilton, James');
                  }
                } else if (author) {
                  const paragraph = { content: $(cel).text() };

                  paragraphs.push(paragraph);
                }
              });

              const section = {
                subtitle,
                paragraphs
              };

              sections.push(section);
            });
          }
        })
        .catch(err => reject(err));
    }

    const document = Object.assign(
      {},
      DOC,
      { sections },
    );

    resolve(document);
  });
}

module.exports = scrape;
