import { Message } from 'discord.js';
import CommandHandler from './command-handler';

export abstract class Command {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  abstract exec(handler: CommandHandler, msg: Message, ...args: string[]): void;
}