import Bot from '../bot';
import { Command } from '../command';


type strund = string|undefined;


class DictionaryCmd extends Command {

  get help() {
    return Strings.help();
  }


  constructor(bot: Bot) {
    super(['dictionary', 'dict'], Bot.Role.Admin, bot);
  }


  _instructions(arg: strund, word: strund, index: strund) {
    if (arg == 'add')  return this._addWord(word, index);
    if (arg == 'del')  return this._delWord(word);
    if (arg == 'list') return this._listWords()
    ;
    if (arg) {
      const index = +arg;
      if (isNaN(index)) return this._bot.sendMedMsg(
        Strings.argNaN()
      );
      this._listIndex(index);
    }
  }


  private _addWord(word: strund, index: strund) {
    if (!word) return this._bot.sendMedMsg(
      Strings.missingWord()
    );
    if (index && isNaN(+index)) return this._bot.sendMedMsg(
      Strings.indexNaN(index)
    );
    const err =
      index ? this._bot.sai.dictionary.addWordToIndex(word, +index)
            : this._bot.sai.dictionary.addWord(word)
    ;
    if (err) {
      if (err.message.includes('exists')) {
        return this._bot.sendMedMsg(
          Strings.wordExists(word)
        );
      }
      return this._bot.sendException(
        Strings.failAddWord(),
        err.message,
        err.stack!
      );
    }
    this._bot.sai.dictionary.save();
    this._bot.sendLowMsg('', `\`${word}\` Added!`);
  }


  private _delWord(word: strund) {
    if (!word) return this._bot.sendMedMsg(
      Strings.missingWord()
    );
    const err = this._bot.sai.dictionary.delWord(word);
    if (err) return this._bot.sendException(
      Strings.failDeleteWord(),
      err.message,
      err.stack!
    );
    this._bot.sai.dictionary.save();
    this._bot.sendLowMsg('', `\`${word}\` Deleted!`);
  }


  private _listIndex(i: number) {
    const len = this._bot.sai.dictionary.words.length;
    if (i >= len) return this._bot.sendMedMsg(
      Strings.listIndexNoExist()
    );
    this._bot.sendLowMsg(
      `\`\`\`\n${this._bot.sai.dictionary.words[i].join(', ')}\n\`\`\``,
      `Words at Index [ ${i} ]`
    );
  }


  private _listWords() {
    const wordsList = this._bot.sai.dictionary.words
    ;
    const wordStr = wordsList.reduce((str, words, i) => {
        return str += `${i}: ${words.join(', ')}\n\n`;
      }, '')
    ;
    this._bot.sendLowMsg(
      `\`\`\`\n${wordStr}\n\`\`\``,
      'Word List'
    );
  }

}


namespace Strings {
  export const help = () => (
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

  export const argNaN = () => (
`I don't understand that argument...:thinking:`
  );

  export const indexNaN = (index: number|string) => (
`Oops, the index you provided: \`${index}\` is not a number.`
  );

  export const wordExists = (word: string) => (
`Umm..the word \`${word}\` already exists.`
  );

  export const failAddWord = () => (
`I tried to add the word, but something bad happened...`
  );

  export const missingWord = () => (
`Whoops, you forgot to specify a word!`
  );

  export const failDeleteWord = () => (
`I tried to delete the word, but...this happened.`
  );

  export const listIndexNoExist = () => (
`Sorry, that index doesn't exist.`
  );

}
export = DictionaryCmd;