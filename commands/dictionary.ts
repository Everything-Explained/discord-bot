import Bot from '../bot';
import { Command } from '../command';

class DictionaryCmd extends Command {


  constructor(public bot: Bot) {
    super(['dictionary', 'dict'], Bot.Role.Everyone);
  }


  _instruction(cmdOrIndex: string|undefined, word: string|undefined, index: string|undefined) {

    if (this._isCommand(cmdOrIndex, word, index)) return;
    this._listWords();
  }


  private _isCommand(cmdOrIndex: string|undefined, word: string|undefined, index: string|undefined) {
    if (cmdOrIndex == 'add') {
      this._addWord(word, index);
      return true;
    }
    if (cmdOrIndex == 'del') {
      this._delWord(word);
      return true;
    }
    if (cmdOrIndex) {
      const index = +cmdOrIndex;
      if (isNaN(index)) this.bot.sendMedMsg(
        `I don't understand that argument...:thinks:`
      );
      else this._listIndex(index);
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
    if (err) {
      if (err.message.includes('exists')) {
        return this.bot.sendMedMsg(
          `The word \`${word}\` already exists, sorry!`
        );
      }
      return this.bot.sendException(
        'I tried to add the word, but something bad happened...',
        err.message,
        err.stack!
      );
    }
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


  private _listIndex(i: number) {
    const len = this.bot.sai.dictionary.words.length;
    if (i >= len) return this.bot.sendMedMsg(
      "Sorry, that index doesn't exist."
    );
    this.bot.sendLowMsg(
      `\`\`\`\n${this.bot.sai.dictionary.words[i].join(', ')}\n\`\`\``,
      `Words at Index [ ${i} ]`
    );
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