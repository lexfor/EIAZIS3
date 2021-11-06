import { Inject, Injectable } from '@nestjs/common';
import { IWord } from './interfaces/word.interface';
import { IDoc } from './interfaces/doc.interface';

@Injectable()
export class AppRepository {
  constructor(@Inject('DATABASE_POOL') private pool) {}
  async addWord(word: IWord) {
    const sql = `INSERT INTO words (id, value, count, document_id) VALUES
                 ($1, $2, $3, $4);`;
    await this.pool.query(sql, [
      word.id,
      word.value,
      word.count,
      word.document_id,
    ]);
  }

  async addDocument(document: IDoc) {
    const sql = `INSERT INTO documents (id, max_count) VALUES
                 ($1, $2);`;
    await this.pool.query(sql, [document.id, document.max_count]);
  }

  async getDocumentsCount(): Promise<number> {
    const sql = `SELECT COUNT(*) FROM documents`;
    const { rows } = await this.pool.query(sql);
    const [result] = rows;
    return result.count;
  }

  async getDocumentMaxCount(id: string): Promise<number> {
    const sql = `SELECT max_count FROM documents
                    WHERE id = $1`;
    const { rows } = await this.pool.query(sql, [id]);
    const [result] = rows;
    return result;
  }

  async getDocumentsCountWithWord(word: string): Promise<number> {
    const sql = `SELECT COUNT(*) FROM documents
                    INNER JOIN words ON words.document_id = documents.id
                    WHERE words.value = $1`;
    const { rows } = await this.pool.query(sql, [word]);
    const [result] = rows;
    return result.count;
  }
}
