import { Inject, Injectable } from '@nestjs/common';
import * as Sugar from 'sugar';
import { AppRepository } from './app.repository';
import { IDoc } from './interfaces/doc.interface';
import { v1 as uuidv1 } from 'uuid';
import { IWord } from './interfaces/word.interface';
import { IWordWeight } from './interfaces/words-weight.interface';

@Injectable()
export class AppService {
  constructor(
    @Inject('DATABASE_REPOSITORY') private readonly repository: AppRepository,
  ) {}

  parseParagraph(data: string): string[] {
    return data.toLowerCase().split('\r\n    ');
  }

  parseSentences(data: string): string[] {
    let sentences: string[] = data
      .toLowerCase()
      .replace('\r\n    ', '')
      .split('.');
    sentences = sentences.map((sent) => {
      return sent.replace('\r\n    ', '');
    });
    return sentences.filter((sent) => sent.length > 1);
  }

  parseWords(data: string): string[] {
    return data
      .toLowerCase()
      .replace('.', '')
      .split(' ')
      .filter((word) => word.length > 3)
      .map((word) => {
        return word.replace('.', '').replace('\r\n', '');
      });
  }

  findWordsIndexes(data: string[]): Map<string, number> {
    const indexes = new Map();
    data.forEach((word) => {
      indexes.set(word, Sugar.Array.count(data, word));
    });
    return indexes;
  }

  findMaxCount(indexes: Map<string, number>): number {
    let max_count = 0;
    let isNotEnd = true;
    const iterator1 = indexes.values();
    while (isNotEnd) {
      const value = iterator1.next().value;
      if (!value) {
        isNotEnd = false;
      } else {
        if (value > max_count) {
          max_count = value;
        }
      }
    }
    return max_count;
  }

  async addDocument(count: number): Promise<IDoc> {
    const document: IDoc = {
      id: uuidv1(),
      max_count: count,
    };
    await this.repository.addDocument(document);
    return document;
  }

  getWordsFromMap(doc: IDoc, indexes: Map<string, number>): IWord[] {
    const words: IWord[] = [];
    let isNotEnd = true;
    const iterator1 = indexes.entries();
    while (isNotEnd) {
      const value = iterator1.next().value;
      if (!value) {
        isNotEnd = false;
      } else {
        words.push({
          id: uuidv1(),
          value: value[0],
          count: value[1],
          document_id: doc.id,
        });
      }
    }
    return words;
  }

  async addWords(words: IWord[]): Promise<IWord[]> {
    for (const word of words) {
      await this.repository.addWord(word);
    }
    return words;
  }

  async findWordsWeight(words: IWord[], doc: IDoc): Promise<IWordWeight[]> {
    const weights: IWordWeight[] = [];
    for (const word of words) {
      weights.push({
        value: word.value,
        weight: await this.findWordWeight(word, doc),
      });
    }
    return weights;
  }

  async findWordWeight(word: IWord, doc: IDoc): Promise<number> {
    const tf: number = word.count;
    const tfMax: number = doc.max_count;
    const DB: number = await this.repository.getDocumentsCount();
    const df: number = await this.repository.getDocumentsCountWithWord(
      word.value,
    );
    if (DB !== df) {
      return 0.5 * (1 + tf / tfMax) * Math.log10(DB / df);
    }
    return 0.5 * (1 + tf / tfMax);
  }

  findSentencesWeight(
    sentences: string[],
    words: IWordWeight[],
  ): IWordWeight[] {
    return sentences.map((sentence) => {
      const sentencesWithWeight: IWordWeight = {
        weight: 0,
        value: sentence,
      };
      sentencesWithWeight.weight = this.findSentenceWeight(sentence, words);
      return sentencesWithWeight;
    });
  }

  findSentenceWeight(sentences: string, words: IWordWeight[]): number {
    let weight = 0;
    const sentencesWords: string[] = this.parseWords(sentences);
    sentencesWords.forEach((word) => {
      for (const i of words) {
        if (i.value === word) {
          weight += i.weight;
        }
      }
    });
    return weight;
  }

  createReferat(words: IWordWeight[], sentences: string[]): string {
    const sentencesWithWeights: IWordWeight[] = this.findSentencesWeight(
      sentences,
      words,
    );
    const sortedSentences: IWordWeight[] = sentencesWithWeights.sort(
      (first, second) => {
        if (first.weight > second.weight) {
          return -1;
        }
        return 1;
      },
    );
    let referat: string = '';
    console.log(sortedSentences);
    for (let i = 0; i < 10; i++) {
      referat += `${sortedSentences[i].value}. `;
    }
    return referat;
  }
}
