import { Message } from 'discord.js';
import { Command } from '../command';
import CommandHandler from '../command-handler';
import { MessagePriority, setMessage } from '../utils';

class TestCmd extends Command {
  constructor() {
    super('test');
  }
  exec(handler: CommandHandler, msg: Message) {
    const str1 = 'This is a nice long sausage, that should be forced onto the next line with a new line character.';
    const str2 = 'Here we go with another very long line to see if it works as expected for the sausage of doom.'
    const str3 = 'This is a typically small definition line that will not cut.'
    msg.channel.send(
      setMessage('Definition', MessagePriority.LOW,
        `▔▔▔▔▔▔▔▔▔▔▔▔\n**1.**\n${this.formatLines([str1, str2, str3]).join('\n\n')}`)
    );
  }

  formatLines(strs: string[]) {
    const lineLength = 70;
    const formattedStrings = strs.map(v => {
      if (v.length > lineLength) {
        const indexOfWord = v.substr(0, lineLength).lastIndexOf(' ');
        const firstLine = v.substr(0, indexOfWord).trim();
        const lastLine = v.split(v.substr(0, indexOfWord))[1].trim();
        return `\u2002\u2002${firstLine}\n\u2002\u2002${lastLine}`
      }
      return `\u2002\u2002${v}`;
    })
    return formattedStrings;
  }
}

export = TestCmd;