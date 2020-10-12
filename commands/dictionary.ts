import { Dictionary } from '@noumenae/sai/dist/database/dictionary';
import Bot from '../bot';
import { Command } from '../command';


type strund = string|undefined;


class DictionaryCmd extends Command {

  private _dictionary: Dictionary;

  get help() { return Strings.getHelp(); }


  constructor(bot: Bot) {
    super(['dictionary', 'dict'], Bot.Role.Admin, bot);
    this._dictionary = bot.sai.dictionary;
  }


  _instructions(arg: strund, word: strund, index: strund) {
    if (!arg) return (
      this._bot.sendMedMsg(Strings.getMissingArg(this.aliases[1]))
    );
    if (arg == 'add')  return this._addWord(word, index);
    if (arg == 'del')  return this._delWord(word);
    if (arg == 'list') return this._listWords()
    ;
    if (isNaN(+arg))
      return this._bot.sendMedMsg(Strings.getArgNaN())
    ;
    this._listIndex(+arg);
  }


  private _addWord(word: strund, index: strund) {
    if (!word) return (
      this._bot.sendMedMsg(Strings.getMissingWord())
    );
    if (index && isNaN(+index)) return (
      this._bot.sendMedMsg(Strings.getIndexNaN(index))
    );
    const err =
      index ? this._dictionary.addWordToIndex(word, +index)
            : this._dictionary.addWord(word)
    ;
    if (err) return this.sendWordExistsOrException(err, word);
    this._bot.sai.dictionary.save();
    this._bot.sendLowMsg('', `\`${word}\` Added!`);
  }


  private _delWord(word: strund) {
    if (!word) return (
      this._bot.sendMedMsg(Strings.getMissingWord())
    );
    const err = this._dictionary.delWord(word);
    if (err) return (
      this._bot.sendException(
        Strings.getFailDeleteWord(),
        err.message,
        err.stack!
      )
    );
    this._bot.sai.dictionary.save();
    this._bot.sendLowMsg('', `\`${word}\` Deleted!`);
  }


  private _listIndex(i: number) {
    const len = this._bot.sai.dictionary.words.length;
    if (i >= len) return (
      this._bot.sendMedMsg(Strings.getListIndexNoExist())
    );
    this._bot.sendLowMsg(
      `\`\`\`\n${this._bot.sai.dictionary.words[i].join(', ')}\n\`\`\``,
      `Words at Index [ ${i} ]`
    );
  }


  private _listWords() {
    const wordsList = this._bot.sai.dictionary.words;
    const wordStr =
      wordsList.reduce((str, words, i) => {
        return str += `${i}: ${words.join(', ')}\n\n`;
      }, '')
    ;
    this._bot.sendLowMsg(
      `\`\`\`\n${wordStr}\n\`\`\``,
      'Word List'
    );
  }


  private sendWordExistsOrException(err: Error, word: string) {
    if (err.message.includes('exists')) return (
      this._bot.sendMedMsg(Strings.getWordExists(word))
    );
    this._bot.sendException(
      Strings.getFailAddWord(),
      err.message,
      err.stack!
    );
  }

}


namespace Strings {
  export const getHelp = () => (
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

  export const getArgNaN = () => (
`I don't understand that argument...:thinking:`
  );

  export const getMissingArg = (cmd: string) => (
`This command requires sub-commands to work. If you need
help type \`;help ${cmd}\` for a list of all valid sub-commands.`
  );

  export const getIndexNaN = (index: number|string) => (
`Oops, the index you provided: \`${index}\` is not a number.`
  );

  export const getWordExists = (word: string) => (
`Umm..the word \`${word}\` already exists.`
  );

  export const getFailAddWord = () => (
`I tried to add the word, but something bad happened...`
  );

  export const getMissingWord = () => (
`Whoops, you forgot to specify a word!`
  );

  export const getFailDeleteWord = () => (
`I tried to delete the word, but...this happened.`
  );

  export const getListIndexNoExist = () => (
`Sorry, that index doesn't exist.`
  );

}
export = DictionaryCmd;