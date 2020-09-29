import Bot from '../bot';
import { Command } from '../command';

class TestCmd extends Command {

  constructor(public bot: Bot) {
    super(['test'], Bot.Role.Admin);
  }

  _help() {
    this.bot.sendLowMsg(
      'This command could literally do **ANY**thing and should only ' +
      'be called if you know what it does.',
      'Test Command'
    );
  }


  _instruction(...args: string[]) {
    console.log('hello world');
  }
}

export = TestCmd;