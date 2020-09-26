import Bot from '../bot';
import { Command } from '../command';
import axios from 'axios';
import { RepErrorCode } from '@noumenae/sai/dist/database/repository';
import { saiErrorResponses } from '../constants';

class QuestionCmd extends Command {

  /** From urlregex.com */
  private _urlEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/



  constructor(public bot: Bot) {
    super('question', Bot.Role.Admin);
  }



  async _instruction(url: string) {
    if (!this._urlEx.test(url)){
      this.bot.sendMedMsg('Invalid URL for question parsing.');
    }
    const [err, doc] = await this._getQuestionDoc(url);
    if (err) {
      this.bot.sendHighMsg(
        `An Error occurred while interacting with the URL:\n\`${err}\``
      );
    }
    this._parseQuestion(doc);
  }


  private async _getQuestionDoc(url: string): Promise<[error: string, doc: string]> {
    const res = await axios.get(url);
    if (res.status == 200) {
      return ['', res.data];
    }
    return [res.statusText, ''];
  }


  private _parseQuestion(doc: string) {
    this.bot.sai.addQuestion(doc)
      .then(item => {
        const titleWord = item.dateCreated < item.dateEdited ? 'Edited' : 'Added';
        this.bot.sendLowMsg(
          `The following is your *editors* recept:\n\`editId: ${item.ids[0]}\``,
          `Question ${titleWord} Successfully!`
        );
      })
      .catch(err => this._catchParseError(err))
    ;
  }


  private _catchParseError(err: RepErrorCode|NodeJS.ErrnoException) {
    if (typeof err == 'number') {
      const errMsg = saiErrorResponses[err];
      if (!errMsg) {
        return this.bot.sendHighMsg(
          `Code:\`${err}\``,
          'Unknown Parse Error'
        );
      }
      return this.bot.sendMedMsg(errMsg);
    }
    this.bot.sendHighMsg(
      `Error Message:\n\`${err.message}\`\nError Trace:\n\`\`\`\n${err.stack}\n\`\`\``
    );
  }
}

export = QuestionCmd;