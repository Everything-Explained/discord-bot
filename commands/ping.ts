import Bot from '../bot';
import { Command } from '../command';

class PingCmd extends Command {
  constructor(public bot: Bot) {
    super(['ping'], Bot.Role.Admin);
  }
  _instruction() {
    const sock = this.bot.curMsg.client.ws;
    this.bot.sendLowMsg(`\u2002:clock3: ${sock.ping}ms`);
  }
}

export = PingCmd;