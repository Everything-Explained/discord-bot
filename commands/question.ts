import { Message } from 'discord.js';
import { Bot, Role } from '../bot';
import { Command } from '../command';
import CommandHandler from '../command-handler';
import axios from 'axios';
import { RepErrorCode } from '@noumenae/sai/dist/database/repository';
import { saiErrorResponses } from '../constants';

class QuestionCmd extends Command {

  /** From urlregex.com */
  private _urlEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/



  constructor(public bot: Bot) {
    super('question', Role.Admin);
  }



  async _instruction(handler: CommandHandler, msg: Message, url: string) {
    if (!this._urlEx.test(url)){
      return void msg.channel.send(
        this.bot.setMedMsg('Invalid URL for question parsing.')
      );
    }
    const [err, doc] = await this._getQuestionDoc(url);
    if (err) {
      return void msg.channel.send(
        `An Error occurred while interacting with the URL:\n\`${err}\``
      );
    }
    this._parseQuestion(msg, doc);
  }


  private async _getQuestionDoc(url: string): Promise<[error: string, doc: string]> {
    const res = await axios.get(url);
    if (res.status == 200) {
      return ['', res.data];
    }
    return [res.statusText, ''];
  }


  private _parseQuestion(msg: Message, doc: string) {
    this.bot.sai.addQuestion(doc)
      .then(item => {
        const titleWord = item.dateCreated < item.dateEdited ? 'Edited' : 'Added';
        msg.channel.send(this.bot.setLowMsg(
          `The following is your *editors* recept:\n\`editId: ${item.ids[0]}\``,
          `Question ${titleWord} Successfully!`
        ));
      })
      .catch(err => this._catchParseError(err, msg))
    ;
  }


  private _catchParseError(err: RepErrorCode|NodeJS.ErrnoException, msg: Message) {
    if (typeof err == 'number') {
      const errMsg = saiErrorResponses[err];
      if (!errMsg) {
        return void msg.channel.send(this.bot.setHighMsg(
          `Code:\`${err}\``,
          'Unknown Parse Error'
        ));
      }
      return void msg.channel.send(this.bot.setMedMsg(errMsg));
    }
    msg.channel.send(this.bot.setHighMsg(
      `Error Message:\n\`${err.message}\`\nError Trace:\n\`\`\`\n${err.stack}\n\`\`\``
    ));
  }
}

export = QuestionCmd;