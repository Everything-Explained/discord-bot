import Bot from '../bot';
import { Command } from '../command';
import axios from 'axios';
import { RepErrorCode } from '@noumenae/sai/dist/database/repository';
import { saiErrorResponses } from '../constants';

class QuestionCmd extends Command {

  /** From urlregex.com */
  private _urlEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/



  constructor(public bot: Bot) {
    super(['question','qstn'], Bot.Role.Admin);
  }



  async _instruction(urlOrCmd: string, ...args: string[]) {
    if (this._isCommand(urlOrCmd, ...args)) return
    ;
    if (args.length) return this.bot.sendMedMsg(
      `:thinking: I tried really hard, but I don't understand what you want.`
    );
    if (!this._urlEx.test(urlOrCmd)) return this.bot.sendMedMsg(
      'Invalid URL for question parsing.'
    );
    const [err, doc] = await this._getQuestionDoc(urlOrCmd);
    if (err) {
      this.bot.sendHighMsg(
        `An Error occurred while interacting with the URL:\n\`${err}\``
      );
    }
    this._parseQuestion(doc);
  }


  private _isCommand(cmd: string, ...args: string[]) {
    if (cmd == 'find') {
      this._findQuestion(args.join(' ').toLowerCase());
      return true;
    }
    return false;
  }


  private _findQuestion(question: string) {
    const item = this.bot.sai.ask(question);
    if (item == RepErrorCode.Question) {
      return this.bot.sendMedMsg(
        `That's an invalid question. :thinking: Did you ask it correctly?`
      );
    }
    if (!item) {
      return this.bot.sendMedMsg(
        `Sorry, I couldn't find that question in my knowledgebase.`
      );
    }
    this.bot.sendLowMsg(
      `\`\`\`\n${item.ids[0]}\n\`\`\``,
      'ID Found!'
    );
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
          `The following is your *editors* recept:\n\`\`\`\neditId: ${item.ids[0]}\n\`\`\``,
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