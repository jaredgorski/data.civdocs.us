function compileCtxFromJson(ctx, scrapedJson) {
  const compileParagraphs = (document, section, paragraphs) => {
    for (let i = 0; i < paragraphs.length; i++) {
      const isLastParagraph = i === paragraphs.length - 1;

      const par = paragraphs[i];

      const paragraph_id = ctx.currParagraphsId++;
      const paragraph_index = i + 1;

      const paragraph = {
        title: section.title,
        subtitle: section.subtitle,
        author: document.author,
        date: document.date,
        document_title: document.title,
        document_id: document.document_id,
        section_id: section.section_id,
        section_index: section.section_index,
        paragraph_id,
        prev_paragraph_id: paragraph_id === 1 ? null : paragraph_id - 1,
        next_paragraph_id: section.is_last_section && isLastParagraph ? null : paragraph_id + 1,
        paragraph_index,
        prev_paragraph_index: paragraph_index === 1 ? null : paragraph_index - 1,
        next_paragraph_index: isLastParagraph ? null : paragraph_index + 1,
        is_last_paragraph: isLastParagraph,
        paragraphs_total: paragraphs.length,
        content: par.content,
      };

      ctx.paragraphsJson.push(paragraph);
    }
  };

  const compileSections = (document, sections) => {
    for (let i = 0; i < sections.length; i++) {
      const isLastSection = i === sections.length - 1;

      const sec = sections[i];
      const paragraphs = sec.paragraphs;

      const section_id = ctx.currSectionsId++;
      const section_index = i + 1;

      const section = {
        title: sec.title,
        subtitle: sec.subtitle,
        author: sec.author,
        date: sec.date,
        document_title: document.title,
        document_id: document.document_id,
        section_id,
        prev_section_id: section_id === 1 ? null : section_id - 1,
        next_section_id: isLastSection ? null : section_id + 1,
        section_index,
        prev_section_index: section_index === 1 ? null : section_index - 1,
        next_section_index: isLastSection ? null : section_index + 1,
        is_last_section: isLastSection,
        sections_total: sections.length,
        paragraphs_total: paragraphs.length,
      };

      ctx.sectionsJson.push(section);

      compileParagraphs(document, section, paragraphs);
    }
  };

  const compileDocument = document => {
    const doc = document;
    const sections = doc.sections;

    const document_id = ctx.currDocumentsId++;

    document = {
      title: doc.title,
      description: doc.description,
      author: doc.author,
      date: doc.date,
      document_id,
      source: doc.source,
      citation: doc.citation,
      sections_total: sections.length,
    };

    ctx.documentsJson.push(document);

    compileSections(document, sections);
  }

  compileDocument(scrapedJson);

  return ctx;
}

module.exports = {compileCtxFromJson};
