import Bot from '../bot';
import { Command } from '../command';

class DictionaryCmd extends Command {


  constructor(public bot: Bot) {
    super('dictionary', Bot.Role.Everyone);
  }


  _instruction(cmd: string|undefined, word: string|undefined, index: string|undefined) {

    if (this._isCommand(cmd, word, index)) return;
    this._listWords();
  }


  private _isCommand(cmd: string|undefined, word: string|undefined, index: string|undefined) {
    if (cmd == 'add') {
      this._addWord(word, index);
      return true;
    }
    if (cmd == 'del') {
      this._delWord(word);
      return true;
    }
    return false;
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
    this.bot.sai.dictionary.save();
    this.bot.sendLowMsg('', `\`${word}\` Added!`);
  }


  private _delWord(word: string|undefined) {
    if (!word) return this.bot.sendMedMsg(
      'Ooopsie, you forgot to specify the word to delete!'
    );
    const err = this.bot.sai.dictionary.delWord(word);
    if (err) return this.bot.sendException(
      'I tried to delete the word, but...this happened.',
      err.message,
      err.stack!
    );
    this.bot.sai.dictionary.save();
    this.bot.sendLowMsg('', `\`${word}\` Deleted!`);
  }


  private _listWords() {
    const wordStr = this.bot.sai.dictionary.words.reduce((pv, cv, i) => {
      return pv += `${i}: ${cv.join(', ')}\n\n`;
    }, '');
    this.bot.sendLowMsg(
      `\`\`\`\n${wordStr}\n\`\`\``,
      'Word List'
    );
  }
}

export = DictionaryCmd;