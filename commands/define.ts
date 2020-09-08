import { Message as MessageSock, MessageEmbed } from 'discord.js';
import { Command } from '../command';
import CommandHandler from '../command-handler';
import { capitalize, getColorByPriority, getDefinedMsg, getHighMsg, MessagePriority, setMessage } from '../utils';
import axios from 'axios';
import config from '../config.json';


type DefinitionText = [string, string|{ t: string; }[][]];
type SenseObj       = { sn: string; dt: DefinitionText };
type PseqObj        = ['sense', SenseObj];
type SenseArray     = ['sense'|'pseq', SenseObj|PseqObj[] ];

interface DefinitionData {
  def: [{ sseq: SenseArray[][] }];
}



class DefineCmd extends Command {

  private _markupEx = /\{\/?[a-z]{2}\}|\{[adlink_]+\||\{[a-z]{2}|\}|\|\}|\|\|/g;
  private _segEx = /\s\{sx\|/g;
  private _colonEx = /\{bc\}/g;
  private _orEx = /[a-z]+\|[a-z]+/g;

  dictionary = axios.create({
    baseURL: 'https://dictionaryapi.com/api/v3/references/collegiate/json/',
    timeout: 5000,
  })


  constructor() {
    super('define');
  }


  async exec(handler: CommandHandler, msgSock: MessageSock, word: string) {
    if (word.length < 4) {
      msgSock.channel.send(
        setMessage('Word Length Too Short', MessagePriority.MEDIUM,
          'Sorry, but I can only define words longer than **3** \
          characters.')
      )
      return;
    }
    const test = 'any of a family (Nephropidae and especially Homarus americanus) of large edible marine decapod crustaceans that have stalked eyes, a pair of large claws, and a long abdomen and that include species from coasts on both sides of the North Atlantic and from the Cape of Good Hope'
    msgSock.channel.send(
      new MessageEmbed()
        .setTitle('Test')
        .setDescription('**1.**\n' + this.formatParagraph(test, 60))
    )
    // const timeNow = Date.now();
    // const data = await this.getDefinition(msgSock, word);
    // if (data) {
    //   let [defs, examples] = this.extractDefinitions(data);
    //   defs = this.formatDefs(defs, word);
    //   if (examples.length) examples = this.formatExamples(examples, word);
    //   const message = this.getDefinitionDisplay(word, defs, examples);
    //   message.setFooter(
    //     `\nMerriam Webster Dictionary \u2022 ${Date.now() - timeNow}ms`
    //   );
    //   msgSock.channel.send(message);
    // }
  }


  async getDefinition(msgSock: MessageSock, word: string) {
    const res = await this.dictionary.get(`${word}?key=${config.apiKeys.dictionary}`);
    if (res.status > 200) {
      msgSock.channel.send(
        getHighMsg('Error', res.data)
      )
      return undefined;
    }
    return res.data as DefinitionData[];
  }


  getDefinitionDisplay(word: string, defs: string[][], examples: string[]) {
    const border = '▔▔▔▔▔▔▔▔▔▔▔▔'
    let defStr = '';
    for (let i = 0; i < defs.length; i++) {
      defStr += `**${i + 1}.)**\n${defs[i].join('\n\n')}\n\n`
    }

    return (
      new MessageEmbed()
        .setTitle(capitalize(word))
        .setColor(getColorByPriority(MessagePriority.LOW))
        .setDescription(`${border}\n${defStr}`)
    );
  }


  formatDefs(defs: string[][], word: string) {
    return defs.map(v => (
      this.formatLines(v.map(vv => (
        this.emphasize(word, capitalize(this.filterMarkup(vv)))
      ))
    )));
  }


  formatExamples(examples: string[], word: string) {
    return this.formatLines(examples.map(v => (
      this.emphasize(word, capitalize(this.filterMarkup(v)))
    )))
  }


  emphasize(word: string, def: string) {
    const wordEx = new RegExp(`(${word}|${capitalize(word)})[a-z]*`, 'g')
    const foundWord = def.match(wordEx);
    if (foundWord) {
      return def.replace(foundWord[0], `*${foundWord[0]}*`)
    }
    return def;
  }


  formatLines(defs: string[]) {
    const lineLength = 60;
    const formattedStrings = defs.map(v => {
      if (v.length > lineLength) {
        return this.formatParagraph(v, lineLength);
      }
      return `\u2002\u2002${v}`
    })
    return formattedStrings;
  }


  formatParagraph(para: string, len: number) {
    const lines = Math.floor(para.length / len);
    if (!lines) return para;
    let newPara = '';
    let offset = 0;
    for (let i = 0; i < lines; i++) {
      const pos = (len * i) - offset;
      const indexOfWord = para.substr(pos, len).lastIndexOf(' ');
      const phrase = para.substr(pos, indexOfWord).trim();
      console.log(phrase.length - 60);
      // offset = phrase.length - 60;
      newPara += `\u2002\u2002${phrase}\n`
      if (i + 1 == lines) newPara += `\u2002\u2002${para.split(phrase)[1].trim()}`
    }
    return newPara;
  }


  extractDefinitions(data: DefinitionData[]): [string[][], string[]] {
    const examples: string[] = [];
    const definitions: string[][] = [];
    const defs = data[0].def[0].sseq;

    for (let def of defs) {
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
    const sense: [string, string[]] = ['', [] as string[]];

    // Set definition text
    sense[0] = obj.dt[0][1];
    // Get all examples if they exist at all
    if (obj.dt[1] && typeof obj.dt[1][1] !== 'string') {
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


  filterMarkup(definition: string) {
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
      }, '')
      filtered = filtered.replace(this._orEx, first);
    }

    return filtered;
  }
}

export = DefineCmd;