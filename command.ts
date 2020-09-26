import { GuildMember, Message } from 'discord.js';
import Bot from './bot';
import CommandHandler from './command-handler';



export abstract class Command {

  abstract bot: Bot;


  constructor(
    public name: string,
    public role: Bot.Role,
  ) {}


  protected abstract _instruction(...args: string[]): void;


  exec(handler: CommandHandler, admin = false, ...args: string[]) {
    const msg = this.bot.curMsg;
    if (!admin && !this.bot.hasValidRole(msg.member!, this.role)) {
      return void this.bot.sendMedMsg(
        `Sorry <@${msg.member?.id}>, you do not have the necessary \
        permissions use this command.`
      );
    }
    this._instruction(...args);
  }
}