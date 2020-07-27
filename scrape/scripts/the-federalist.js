const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

function scrapeFederalist({
  documentsJson,
  sectionsJson,
  paragraphsJson,
  currDocumentsId,
  currSectionsId,
  currParagraphsId,
}) {
  return new Promise(async (resolve, reject) => {
    const document_id = currDocumentsId++;

    let sectionIndexInc = 1;

    const increments = ['1-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-85'];
    for (let x = 0; x < increments.length; x++) {
      const increment = increments[x];
      const isLastIncrement = x === increments.length - 1;
      await axios.get(`https://guides.loc.gov/federalist-papers/text-${increment}`)
        .then(res => {
          if (res.status == 200) {
            const html = res.data;
            const $ = cheerio.load(html);

            $('sup').remove();

            const secSelector = '[class^=s-lg-box-wrapper]';
            const secLength = $(secSelector).length;
            $(secSelector).each((i, el) => {
              if (i === 0) return;

              let author = null;
              let section_id = currSectionsId++;
              let subtitle = '';
              let date = null;

              const title = $(el).find('h2').text().trim() || '';

              const isLastSection = isLastIncrement && i === secLength - 1;
              const section_index = sectionIndexInc++;

              paragraphIndexInc = 1;

              const paragraphsJsonQueue = [];

              const contentBlockEl = $(el).find('.s-lib-box-content');
              const celLength = $(contentBlockEl).find('p').length;
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
                  const paragraph_id = currParagraphsId++;
                  const paragraph_index = paragraphIndexInc++;
                  const isLastParagraph = j === celLength - 1;
                  const paragraph = {
                    author,
                    subtitle,
                    date,
                    title,
                    section_index,
                    document_id,
                    section_id,
                    paragraph_id,
                    next_paragraph_id: isLastIncrement && isLastSection && isLastParagraph ? null : paragraph_id + 1,
                    prev_paragraph_id: paragraph_id === 1 ? null : paragraph_id - 1,
                    paragraph_index,
                    next_paragraph_index: isLastParagraph ? null : paragraph_index + 1,
                    prev_paragraph_index: paragraph_index === 1 ? null : paragraph_index - 1,
                    content: $(cel).text(),
                  };

                  paragraphsJsonQueue.push(paragraph);
                }
              });

              const paragraphs_total = paragraphIndexInc - 1;

              paragraphsJsonQueue.forEach(paragraph => {
                paragraph.paragraphs_total = paragraphs_total;
                paragraphsJson.push(paragraph);
              });

              const section = {
                author,
                date,
                document_id,
                section_id,
                next_section_id: isLastIncrement && isLastSection ? null : section_id + 1,
                prev_section_id: section_id === 1 ? null : section_id - 1,
                section_index,
                next_section_index: isLastSection ? null : section_index + 1,
                prev_section_index: section_index === 1 ? null : section_index - 1,
                paragraphs_total,
                subtitle,
                title,
              };

              sectionsJson.push(section);
            });
          }
        })
        .catch(err => reject(err));
    }

    const sections_total = sectionIndexInc - 1;

    sectionsJson.forEach(section => {
      section.sections_total = sections_total;
    });

    const document = {
      title: 'The Federalist',
      description: 'A collection of 85 essays written by Alexander Hamilton, John Jay, and James Madison arguing in favor of ratifying the proposed Constitution of the United States of America.',
      document_id,
      author: 'Alexander Hamilton, John Jay, and James Madison',
      date: 'October 1787 - May 1788',
      source: 'https://guides.loc.gov/federalist-papers/full-text',
      citation: '"Federalist Papers: Primary Documents in American History: Full Text of The Federalist Papers." Library of Congress Research Guides, Library of Congress, guides.loc.gov/federalist-papers/full-text.',
      sections_total,
    };

    documentsJson.push(document);

    resolve({
      documentsJson,
      sectionsJson,
      paragraphsJson,
      currDocumentsId,
      currSectionsId,
      currParagraphsId,
    });
  });
}

module.exports = scrapeFederalist;
