import { GuildMember, Message } from 'discord.js';
import Bot from './bot';
import CommandHandler from './command-handler';



export abstract class Command {

  abstract bot: Bot;


  constructor(
    public name: string,
    public role: Bot.Role,
  ) {}


  protected abstract _instruction(handler: CommandHandler, msg: Message, ...args: string[]): void;


  exec(handler: CommandHandler, msg: Message, admin = false, ...args: string[]) {
    if (!admin && !this.bot.hasValidRole(msg.member!, this.role)) {
      return void msg.channel.send(
        this.bot.setMedMsg(
          `Sorry <@${msg.member?.id}>, you do not have the necessary \
          permissions use this command.`
        )
      );
    }
    this._instruction(handler, msg, ...args);
  }
}