import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { IDoc } from './interfaces/doc.interface';
import { IWord } from './interfaces/word.interface';
import { IWordWeight } from './interfaces/words-weight.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('referat')
  @UseInterceptors(FileInterceptor('file'))
  async getReferat(@UploadedFile() file: Express.Multer.File): Promise<string> {
    const data: string = file.buffer.toString();
    const sentences: string[] = this.appService.parseSentences(data);
    const words: string[] = this.appService.parseWords(data);
    const indexes: Map<string, number> =
      this.appService.findWordsIndexes(words);
    const count: number = this.appService.findMaxCount(indexes);
    const doc: IDoc = await this.appService.addDocument(count);
    const wordsArr: IWord[] = this.appService.getWordsFromMap(doc, indexes);
    await this.appService.addWords(wordsArr);
    const wordsWithWeight: IWordWeight[] =
      await this.appService.findWordsWeight(wordsArr, doc);
    return this.appService.createReferat(wordsWithWeight, sentences);
  }
}
