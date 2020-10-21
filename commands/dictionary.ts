import { ParityErrorCode, ParityManager } from '@noumenae/sai/dist/database/parity_manager';
import Bot from '../bot';
import { Command } from '../command';



type strund = string|undefined;




class DictionaryCmd extends Command {

  private _parityMngr: ParityManager;

  get help() { return Strings.getHelp(); }


  constructor(bot: Bot) {
    super(['dictionary', 'dict'], Bot.Role.Admin, bot);
    this._parityMngr = bot.sai.parityManager;
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
      index ? this._parityMngr.addWordToIndex(word, +index)
            : this._parityMngr.addWord(word)
    ;
    if (typeof err == 'number') return this.sendWordOrIndexError(err, word);
    this._parityMngr.save();
    this._bot.sendLowMsg('', `\`${word}\` Added!`);
  }

  private _delWord(word: strund) {
    if (!word) return (
      this._bot.sendMedMsg(Strings.getMissingWord())
    );
    const result = this._parityMngr.delWord(word);
    if (result == ParityErrorCode.WordNotFound) return (
      this._bot.sendMedMsg(Strings.getFailDeleteWord(word))
    );
    this._parityMngr.save();
    this._bot.sendLowMsg('', `\`${word}\` Deleted!`);
  }

  private _listIndex(i: number) {
    const len = this._parityMngr.words.length;
    if (i >= len) return (
      this._bot.sendMedMsg(Strings.getListIndexNoExist())
    );
    this._bot.sendLowMsg(
      `\`\`\`\n${this._parityMngr.words[i].join(', ')}\n\`\`\``,
      `Words at Index [ ${i} ]`
    );
  }

  private _listWords() {
    const wordStr =
      this._parityMngr.words.reduce((str, words, i) => {
        return str += `${i}: ${words.join(', ')}\n\n`;
      }, '')
    ;
    this._bot.sendLowMsg(
      `\`\`\`\n${wordStr}\n\`\`\``,
      'Word List'
    );
  }

  private sendWordOrIndexError(code: ParityErrorCode, wordOrIndex: string) {
    if (code == ParityErrorCode.AlreadyExists)
      return this._bot.sendMedMsg(Strings.getWordExists(wordOrIndex))
    ;
    if (code == ParityErrorCode.IndexNotFound)
      return this._bot.sendMedMsg(Strings.getIndexNotFound(+wordOrIndex))
    ;
    if (code == ParityErrorCode.IndexLessThanZero)
      return this._bot.sendMedMsg(Strings.getInvalidIndex(+wordOrIndex))
    ;
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

  export const getIndexNotFound = (index: number) => (
`Whoops, the index \`${index}\` does not appear to exist
in my database.`
  );

  export const getInvalidIndex = (index: number) => (
`Uh oh, index: \`${index}\` is not a valid index. Were you
trying to enter something else?`
  );

  export const getFailAddWord = () => (
`I tried to add the word, but something bad happened...`
  );

  export const getMissingWord = () => (
`Whoops, you forgot to specify a word!`
  );

  export const getFailDeleteWord = (word: string) => (
`Oops, the word: \`${word}\` does not appear to be in my
database...`
  );

  export const getListIndexNoExist = () => (
`Sorry, that index doesn't exist.`
  );

}
export = DictionaryCmd;