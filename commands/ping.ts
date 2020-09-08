import { Message } from 'discord.js';
import { Command } from '../command';
import CommandHandler from '../command-handler';
import { getLowMsg, MessagePriority, setMessage } from '../utils';

class PingCmd extends Command {
  constructor() {
    super('ping');
  }
  exec(handler: CommandHandler, msg: Message) {
    msg.channel.send(
      getLowMsg(`Ping Delay`, `▔▔▔▔▔▔\n\u2002:clock3: ${msg.client.ws.ping}ms`)
    );
  }
}

export = PingCmd;