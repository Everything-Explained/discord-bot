import { Client, DMChannel, GuildMember, Message, MessageEmbed, NewsChannel, TextChannel } from "discord.js";
import importFresh from "import-fresh";
import { Command } from "./command";
import CommandHandler from "./command-handler";
import DefineCmd from "./commands/define";
import PingCmd from "./commands/ping";
import ReloadCmd from "./commands/reload";
import TestCmd from "./commands/test";
import config from './config.json';
import WallCmd from "./commands/wall";
import { SAI } from "@noumenae/sai";
import QuestionCmd from "./commands/question";
import LevelCmd from "./commands/level";


type DiscordChannel = TextChannel|DMChannel|NewsChannel;


class Bot {
  private _commands   : Command[] = [];
  private _cmdHandler : CommandHandler;

  // In order: matches alias, role, and channel mentions
  private _mentionEx = /<@!?&?#?\d+>/g;
  private _channels  = config.bot.access_channels;
  private _sai       = new SAI('./store', (res) => this._onSaiInit(res));

  private _messageHandler = (msg: Message) => {
    return void this._onMessage(msg);
  };


  /* TODO - This might cause async issues down the road.

    If this value is ever changed during an async operation, then
    we'll have to fallback to passing the Message object around.
  */
 curMsg!: Message;

  get Embed() {
    return MessageEmbed;
  }

  get sai() {
    return this._sai;
  }

  get commands() {
    return this._cmdHandler.commands;
  }


  constructor(private _client: Client, private _resetCallback: () => void, reset = false) {
    this._client.on('message', this._messageHandler);
    this._populateCommands();
    this._cmdHandler = new CommandHandler(this._commands, this);
    if (!reset)
      this._client.login(config.apiKeys.discord)
    ;
  }


  private _onSaiInit(resp: Error|null) {
    //
  }

  private async _onMessage(msg: Message) {
    this.curMsg = msg;
    if (!this.isBotMentioned()) {
      return this._cmdHandler.find(msg.content);
    }
    if (this._isQuestionEntry(msg)) return;
    if (this._isQuestion(msg)) return;
  }


  private _isQuestionEntry(msg: Message) {
    if (!this.hasValidRole(msg.member!, Bot.Role.Admin)) return false
    ;
    const attachments = msg.attachments.array();
    if (!attachments.length) return false
    ;
    if (attachments[0].url.substr(-3) != '.md') {
      msg.delete();
      this.sendMedMsg(
        'Oops! :nerd: Your file is missing the `.md` extension.'
      );
    }
    msg.content = `;question ${attachments[0].url}`;
    this._cmdHandler.find(msg.content, true);
    return true;
  }


  private _isQuestion(msg: Message) {
    const question = msg.content.replace(this._mentionEx, '').trim();
    const resp = this._sai.ask(question)
    ;
    if (typeof resp == 'number') {
      return this.sendMedMsg(
        `:confused: Sorry, I don't understand that question.`
      );
    }
    if (!resp) {
      return this.sendMedMsg(
        `:nerd: That question doesn't match anything in my knowledge-base.`
      );
    }
    return void msg.channel.send(new this.Embed()
      .setTitle(resp.title)
      .setDescription(`${resp.answer}\u200b\n\u200b`)
      .setColor(this.colorFromPriority(Bot.MessagePriority.LOW))
      .setFooter(`by ${resp.authors[0]}`)
    );
  }


  private _populateCommands() {
    this._commands = [
      new (importFresh('./commands/ping.js'    ) as typeof PingCmd)(this),
      new (importFresh('./commands/reload.js'  ) as typeof ReloadCmd)(this),
      new (importFresh('./commands/test.js'    ) as typeof TestCmd)(this),
      new (importFresh('./commands/define.js'  ) as typeof DefineCmd)(this),
      new (importFresh('./commands/wall.js'    ) as typeof WallCmd)(this),
      new (importFresh('./commands/question.js') as typeof QuestionCmd)(this),
      new (importFresh('./commands/level.js'   ) as typeof LevelCmd)(this),
    ];
  }


  reset() {
    this.sendHighMsg('', 'Resetting Bot');
    this._client.off('message', this._messageHandler);
    this._resetCallback();
  }


  reloadCmdHandler() {
    this._populateCommands();
    this._cmdHandler = new CommandHandler(this._commands, this);
  }


  hasValidRole(member: GuildMember, role: Bot.Role) {
    if (member.id == config.bot.creatorId) {
      return true;
    }
    return member.roles.cache.some(r => {
      return r.name == role;
    });
  }


  isBotMentioned() {
    const botId = `<@!${config.bot.id}>`;
    if (!this.curMsg.content.includes(botId)) return false;
    return true;
  }


  setMessage(title: string, priority = -1, description: string) {
    return (
      new this.Embed()
        .setTitle(title)
        .setDescription(description)
        .setColor(this.colorFromPriority(priority))
    );
  }


  sendMsg(description: string, title: string, color: string) {
    this.curMsg.channel.send(
      new this.Embed()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
    );
  }


  colorFromPriority(priority: Bot.MessagePriority) {
    const p = Bot.MessagePriority;
    if (p.LOW    == priority) return '#57E0B8';
    if (p.MEDIUM == priority) return '#FFD200';
    if (p.HIGH   == priority) return '#FF559D';
    if (p.BLACK  == priority) return '#6C00FF';
    return '#aaaaaa';
  }


  colorFromLevel(level: Bot.MessageLevel) {
    return Bot.levelColors[level];
  }


  sendLowMsg(content: string, title = '') {
    return void this.curMsg.channel.send(
      this.setMessage(title, Bot.MessagePriority.LOW, content)
    );
  }

  sendMedMsg(content: string, title = '') {
    return void this.curMsg.channel.send(
      this.setMessage(title, Bot.MessagePriority.MEDIUM, content)
    );
  }

  sendHighMsg(content: string, title = '') {
    return void this.curMsg.channel.send(
      this.setMessage(title, Bot.MessagePriority.HIGH, content)
    );
  }


}



namespace Bot {
  export enum MessageLevel {
    WHITE = 0,
    BLUE,
    GREEN,
    YELLOW,
    ORANGE,
    RED,
    CHOCOLATE,
    GRAY,
    BLACK
  }

  export enum MessagePriority {
    LOW = 0,
    MEDIUM,
    HIGH,
    BLACK,
  }

  export enum Role {
    Everyone = '@everyone',
    Admin = 'Admin',
  }

  export const levelColors = [
    '#FEFEFE',
    '#4FB2FF',
    '#00D01D',
    '#FFED56',
    '#FFAE00',
    '#FF4F4F',
    '#A75E00',
    '#888888',
    '#000000',
    '#6C00FF',
  ];
}




export = Bot;

