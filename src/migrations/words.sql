CREATE TABLE IF NOT EXISTS words (
    id VARCHAR(255),
    value VARCHAR(255),
    count INTEGER,
    document_id VARCHAR(255),
    PRIMARY KEY (id),
    FOREIGN KEY (document_id) REFERENCES documents(id));

CREATE INDEX words_value_index ON words(value);
