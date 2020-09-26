import Bot from '../bot';
import { Command } from '../command';

class DictionaryCmd extends Command {


  constructor(public bot: Bot) {
    super('dict', Bot.Role.Everyone);
  }


  _instruction(cmd: string|undefined, word: string|undefined, index: string|undefined) {
    if (!cmd) return this.bot.sendMedMsg(
      'This command requires a sub-command to operate.'
    );
    if (this._isCommand(cmd, word, index)) return;
  }


  private _isCommand(cmd: string, word: string|undefined, index: string|undefined) {
    if (cmd == 'add') {
      this._addWord(word, index);
      return true;
    }
  }


  private _addWord(word: string|undefined, index: string|undefined) {
    if (!word) return this.bot.sendMedMsg(
      'Whoops, you forgot to specify a word to add'
    );
    if (index && isNaN(+index)) return this.bot.sendMedMsg(
      'Oops, the index you provided is not a number.'
    );
    const err =
      index ? this.bot.sai.dictionary.addWordToIndex(word, +index)
            : this.bot.sai.dictionary.addWord(word)
    ;
    if (err) return this.bot.sendException(
      'I tried to add the word, but something bad happened...',
      err.message,
      err.stack!
    );
    this.bot.sendLowMsg('', `\`${word}\` Added to Dictionary!`);
  }
}

export = DictionaryCmd;