import { TextChannel } from 'discord.js';
import Bot from '../bot';
import { Command } from '../command';

class TestCmd extends Command {

  get help() {
    return (
`This command could literally do **ANY**thing and should only
be called if you know what it does.`
    );
  }


  constructor(public bot: Bot) {
    super(['test'], Bot.Role.Admin);
  }


  _instructions(...args: string[]) {
    this.bot.sendLowMsg('hello');
  }
}

export = TestCmd;