CREATE TABLE civdocs.documents (
    `title` VARCHAR(14) CHARACTER SET utf8,
    `description` VARCHAR(173) CHARACTER SET utf8,
    `document_id` INT,
    `author` VARCHAR(47) CHARACTER SET utf8,
    `date` VARCHAR(23) CHARACTER SET utf8,
    `source` VARCHAR(50) CHARACTER SET utf8,
    `citation` VARCHAR(197) CHARACTER SET utf8,
    `sections_total` INT,
    PRIMARY KEY(document_id)
);
INSERT INTO civdocs.documents VALUES
    ('The Federalist','A collection of 85 essays written by Alexander Hamilton, John Jay, and James Madison arguing in favor of ratifying the proposed Constitution of the United States of America.',1,'Alexander Hamilton, John Jay, and James Madison','October 1787 - May 1788','https://guides.loc.gov/federalist-papers/full-text','"Federalist Papers: Primary Documents in American History: Full Text of The Federalist Papers." Library of Congress Research Guides, Library of Congress, guides.loc.gov/federalist-papers/full-text.',85);
