import { MessageEmbed } from 'discord.js';
import { Command } from '../command';
import { capitalize, getColorByPriority } from '../utils';
import axios from 'axios';
import config from '../config.json';
import Bot, { MessagePriority } from '../bot';


type DefinitionText = [string, string|{ t: string; }[][]];
type SenseObj       = { sn: string; dt: DefinitionText };
type PseqObj        = ['sense', SenseObj];
type SenseArray     = ['sense'|'pseq', SenseObj|PseqObj[] ];

interface DefinitionData {
  def: [{ sseq: SenseArray[][] }];
}



class DefineCmd extends Command {

  private _markupEx = /\{\/?[a-z]{2}\}|\{[adlink_]+\||\{[a-z]{2}|\}|\|\}|\|\|/g;
  private _segEx    = /\s\{sx\|/g;
  private _colonEx  = /\{bc\}/g;
  private _orEx     = /[a-z]+\|[a-z]+/g;

  dictionary = axios.create({
    baseURL: 'https://dictionaryapi.com/api/v3/references/collegiate/json/',
    timeout: 5000,
  })


  constructor(public bot: Bot) {
    super('define', Bot.Role.Everyone);
  }


  async _instruction(word: string) {
    if (word.length < 4) {
      this.bot.sendMedMsg(
        'Sorry, but I can only define words longer than **3** characters.',
        'Word Length Too Short'
      );
      return;
    }
    const timeNow = Date.now();
    const data = await this.getDefinition(word);
    if (data) {
      try {
        let [defs, examples] = this.extractDefinitions(data);
        defs = this.formatDefs(defs, word)
        ;
        if (examples.length) examples = this.formatExamples(examples, word);
        const message = this.getDefinitionDisplay(word, defs, examples);
        message.setFooter(`▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔\n\u2022 ${Date.now() - timeNow}ms`)
        ;
        this.bot.curMsg.channel.send(message);
      }
      catch (err) {
        this.bot.sendException(
          'The DEFINE command has *failed* spectacularly.',
          err.message,
          err.stack
        );
      }
    }
  }


  async getDefinition(word: string) {
    const res = await this.dictionary.get(`${word}?key=${config.apiKeys.dictionary}`)
    ;
    if (res.status > 200) {
      this.bot.sendHighMsg(res.data, 'Error');
      return undefined;
    }
    if (typeof res.data[0] == 'string') {
      this.bot.sendMedMsg(
        `The word: "${word}" was not found.` +
        `\n\n**Suggestions**${this.getSuggestionDisplay(res.data as string[])}`,
        'Not Found',
      );
      return undefined;
    }
    return res.data as DefinitionData[];
  }


  getDefinitionDisplay(word: string, defs: string[][], examples: string[]) {
    const border = '▔▔▔▔▔▔▔▔▔▔▔▔▔';
    let defStr = '';
    for (let i = 0; i < defs.length; i++) {
      if (i > 1) break;
      defStr += `**${i + 1}.)**\n${defs[i].join('\n')}\n\n`;
    }
    if (examples.length)
      defStr += `**Examples**\n${examples.join('\n')}`
    ;
    return (
      new MessageEmbed()
        .setTitle(`${border}\n${capitalize(word)}`)
        .setAuthor(
          'Merriam Webster Dictionary',
          'https://merriam-webster.com/assets/mw/static/app-css-images/logos/MW_logo@2x8kb.png',
          `https://www.merriam-webster.com/dictionary/${word}`
        )
        .setColor(getColorByPriority(MessagePriority.LOW))
        .setDescription(`${defStr}`)
    );
  }


  getSuggestionDisplay(suggestions: string[]) {
    // TODO - Create two MessageEmbed{} fields that show up to 10 words.
    return `\n\u2002\u2002${suggestions.slice(0, 5).join('\n\u2002\u2002')}`;
  }


  formatDefs(defs: string[][], word: string) {
    return defs.map(v => (
      this.formatLines(v.map(vv => (
        this.emphasize(word, capitalize(this._filterMarkup(vv)))
      ))
    )));
  }


  formatExamples(examples: string[], word: string) {
    return this.formatLines(examples.map(v => (
      this.emphasize(word, capitalize(this._filterMarkup(v)))
    )));
  }


  emphasize(word: string, def: string) {
    const wordEx = new RegExp(`(${word}|${capitalize(word)})[a-z]*`, 'g');
    const foundWord = def.match(wordEx);
    if (foundWord) {
      return def.replace(foundWord[0], `*${foundWord[0]}*`);
    }
    return def;
  }


  formatLines(defs: string[]) {
    const lineLength = 60;
    const formattedStrings = defs.map(v => {
      if (v.length > lineLength) {
        return `\u2002**:** ${this.formatParagraph(v, lineLength).trim()}`;
      }
      return `\u2002**:** ${v}`;
    });
    return formattedStrings;
  }


  formatParagraph(para: string, len: number) {
    const lines = Math.floor(para.length / len);
    if (!lines) return para;
    let newPara = '';
    let offset = 0;
    for (let i = 0; i < lines; i++) {
      const pos = (len * i) + offset;
      const indexOfWord = para.substr(pos, len).lastIndexOf(' ');
      const phrase = para.substr(pos, indexOfWord);
      offset += phrase.length - len;
      newPara += `\u2002\u2002${phrase.trim()}\n`;
      if (i + 1 == lines) newPara += `\u2002\u2002${para.split(phrase)[1].trim()}`;
    }
    return newPara;
  }


  extractDefinitions(data: DefinitionData[]): [string[][], string[]] {
    const examples: string[] = [];
    const definitions: string[][] = [];
    const defs = data[0].def[0].sseq;

    for (const def of defs) {
      const localDefs: string[] = [];
      def.forEach(v => {
        const obj = this._getSense(v);
        if (obj) {
          localDefs.push(obj[0]);
          // Empty examples are populated with undefined
          if (obj[1].length && obj[1][0]) examples.push(...obj[1]);
        }
        const pseq = this._getPseq(v);
        if (pseq) localDefs.push(...pseq);
      });
      definitions.push(localDefs);
    }
    return [definitions, examples.length ? examples : []];
  }


  private _getSense(field: SenseArray) {
    if (field[0] != 'sense') return undefined;
    const obj = field[1] as SenseObj;
    const sense: [string, string[]] = ['', [] as string[]]
    ;
    // Set definition text
    sense[0] = obj.dt[0][1];
    // Get all examples if they exist at all
    if (obj.dt[1] && obj.dt[1][0] != 'ca' && typeof obj.dt[1][1] !== 'string') {
      sense[1] = obj.dt[1][1].map(v => v.t);
    }
    return sense;
  }


  private _getPseq(field: SenseArray) {
    if (field[0] != 'pseq') return undefined;
    const obj = field[1] as PseqObj[];
    // Return all definitions in a new Array
    return obj.map(v => v[1].dt[0][1]);
  }


  private _filterMarkup(definition: string) {
    let filtered =
      definition
        .replace(this._colonEx, '')
        .replace(this._segEx, '; ')
        .replace(this._markupEx, '')
    ;
    if (filtered.includes('|')) {
      const first = filtered.split(' ').reduce((pv, v) => {
        return (
          pv += v.includes('|') ? v.split('|')[0] : ''
        );
      }, '');
      filtered = filtered.replace(this._orEx, first);
    }
    return filtered;
  }
}

export = DefineCmd;