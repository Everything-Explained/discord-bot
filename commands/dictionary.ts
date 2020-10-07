import Bot from '../bot';
import { Command } from '../command';


type strund = string|undefined;


class DictionaryCmd extends Command {

  get help() {
    return (
`**List Words**
Will list all words grouped by their index.
\`\`\`;dictionary list\`\`\`
**Words at Index**
Lists all words at a specific \`<index>\`.
\`\`\`;dictionary <index>\`\`\`
**Add Word**
Will add a \`<word>\` to the dictionary. If an \`<index>\` is provided,
then it will add a \`<word>\` to that \`<index>\`, if it exists. The
\`<index>\` is a number that correlates directly to a specific
location of words in the database. *Listing the words will show you
their index position.*
\`\`\`;dictionary add <word>\`\`\` \`\`\`;dictionary add <word> <index>\`\`\`
**Delete Word**
Will delete a \`<word>\` if it exists.
\`\`\`;dictionary del <word>\`\`\``
    );
  }


  constructor(public bot: Bot) {
    super(['dictionary', 'dict'], Bot.Role.Admin);
  }


  _instruction(arg: strund, word: strund, index: strund) {
    if (arg == 'add')  return this._addWord(word, index);
    if (arg == 'del')  return this._delWord(word);
    if (arg == 'list') return this._listWords()
    ;
    if (arg) {
      const index = +arg;
      if (isNaN(index)) return this.bot.sendMedMsg(
        `I don't understand that argument...:thinks:`
      );
      this._listIndex(index);
    }
  }


  private _addWord(word: strund, index: strund) {
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


  private _delWord(word: strund) {
    if (!word) return this.bot.sendMedMsg(
      'Oopsie, you forgot to specify the word to delete!'
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
    const wordsList = this.bot.sai.dictionary.words
    ;
    const wordStr = wordsList.reduce((str, words, i) => {
        return str += `${i}: ${words.join(', ')}\n\n`;
      }, '')
    ;
    this.bot.sendLowMsg(
      `\`\`\`\n${wordStr}\n\`\`\``,
      'Word List'
    );
  }
}

export = DictionaryCmd;