import Bot, { message_levels } from '../bot';
import { Command } from '../command';
import axios from 'axios';
import { RepErrorCode, RepoItem } from '@noumenae/sai/dist/database/repository';
import { saiErrorResponses } from '../constants';

class QuestionCmd extends Command {

  /** From urlregex.com */
  private _urlEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/


  get help() {
    return (
`**Add Question**
Checks that the \`<url>\` argument is a valid URL. If the
URL is valid, then the bot will try to retrieve an Item
Document resource from the URL and add it to its database.
\`\`\`;question <url>\`\`\`
**Find Question**
Checks that the \`<question>\` argument is a valid question
and if it is, tries to find that question in the database.
\`\`\`;question <question>\`\`\`
**List**
Lists all saved questions and groups them together based
on the document they came from.
\`\`\`;question list\`\`\`
**Question Document**
Generates a raw Item Document from the specified \`<question>\`
if it exists in the database.
\`\`\`;question doc <question>\`\`\``
    );
  }


  constructor(public bot: Bot) {
    super(['question','qstn', 'q'], Bot.Role.Admin);
  }



  _instruction(arg: string, ...args: string[]) {
    if (arg == 'doc')          return this._getRawDoc(args.join(' ').trim());
    if (arg == 'list')         return this._list();
    if (this._urlEx.test(arg)) return void (this._processURL(arg))
    ;
    this._findQuestion([arg, ...args].join(' '));
  }


  private async _processURL(url: string) {
    const [err, doc] = await this._getQuestionDoc(url);
    this.bot.curMsg.delete()
    ;
    if (err) {
      return !this.bot.sendHighMsg(
        `An Error occurred while interacting with the URL:\n\`${err}\``
      );
    }
    this._parseQuestion(doc);
  }


  private _findQuestion(question: string) {
    const item = this.bot.sai.ask(question);
    if (item == RepErrorCode.Question) {
      return this.bot.sendMedMsg(
        'You entered an **Invalid** `URL` or `Question`'
      );
    }
    if (!item) {
      return this.bot.sendMedMsg(
        `Sorry, I couldn't find that question in my database.`
      );
    }
    this._sendQuestionDetails(item);
  }


  private _getRawDoc(question: string) {
    const item = this.bot.sai.ask(question);
    if(item == RepErrorCode.Question) {
      return this.bot.sendMedMsg(
        'That\'s an invalid question.'
      );
    }
    if (!item) {
      return this.bot.sendMedMsg(
        `Sorry, I couldn't find that question in my database.`
      );
    }
    this.bot.sendLowMsg(
      `\`\`\`${this.bot.sai.repository.toItemDoc(item)}\`\`\``,
      'Item Document',
    );
  }


  private _list() {
    const questions =
      this.bot.sai.questions.reduce((pv, cv) => {
        return pv += this._createQuestionList(cv)+ '\n\n';
      }, '')
    ;
    this.bot.sendLowMsg(
      `${questions}`,
      'Available Questions'
    );
  }


  private _sendQuestionDetails(item: RepoItem) {
    const questions = this.bot.sai.repository.questionsFromItem(item);
    this.bot.sendMsg(
      `\`\`\`editId: ${item.ids[0]}\`\`\`\n` +
      `Questions:${this._createQuestionList(questions)}\n` +
      `Answer:\`\`\`${item.answer}\`\`\``,
      `${item.title}`,
      `${message_levels[item.level][2]}`
    );
  }


  private _createQuestionList(questions: string[]) {
    return questions.map(v => `\`\`\`${v}\`\`\``).join('');
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
        this._sendQuestionDetails(item);
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