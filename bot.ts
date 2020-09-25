import { Client, GuildMember, Message, MessageAttachment, MessageEmbed } from "discord.js";
import importFresh from "import-fresh";
import { Command } from "./command";
import CommandHandler from "./command-handler";
import DefineCmd from "./commands/define";
import PingCmd from "./commands/ping";
import ReloadCmd from "./commands/reload";
import TestCmd from "./commands/test";
import config from './config.json';
import axios from 'axios';
import WallCmd from "./commands/wall";
import { SAI } from "@noumenae/sai";
import { RepErrorCode } from "@noumenae/sai/dist/database/repository";
import { saiErrorResponses } from "./constants";
import QuestionCmd from "./commands/question";



export enum MessagePriority {
  LOW,
  MEDIUM,
  HIGH,
  BLACK,
}

export enum Role {
  Everyone = '@everyone',
  Admin = 'Admin',
}



export class Bot {

  private _client        : Client;
  private _commands      : Command[] = [];
  private _cmdHandler    : CommandHandler;

  // In order: matches alias, role, and channel mentions
  private _mentionEx = /<@!?&?#?\d+>/g;
  private _channels  = config.bot.access_channels;
  private _sai       = new SAI('./store', (res) => this._onSaiInit(res))


  get Embed() {
    return MessageEmbed;
  }

  get sai() {
    return this._sai;
  }


  constructor() {
    this._client = new Client();
    this._client.on('message', (msg) => this._onMessage(msg));
    this._populateCommands();
    this._cmdHandler = new CommandHandler(this._commands);
    this._client.login(config.apiKeys.discord);
  }


  private _onSaiInit(resp: Error|null) {
    //
  }



  private async _onMessage(msg: Message) {
    if (!this.isBotMentioned(msg.content)) {
      return this._cmdHandler.find(msg);
    }
    if (this._isQuestionEntry(msg)) return;
    if (this._isQuestion(msg)) return;
  }


  private _isQuestionEntry(msg: Message) {
    if (!this.hasValidRole(msg.member!, Role.Admin)) return false
    ;
    const attachments = msg.attachments.array();
    if (!attachments.length) return false
    ;
    if (attachments[0].url.substr(-3) != '.md') {
      msg.delete();
      return !!msg.channel.send(this.setMedMsg(
        'Oops! :nerd: Your file is missing the `.md` extension.'
      ));
    }
    msg.content = `;question ${attachments[0].url}`;
    this._cmdHandler.find(msg, true);
    return true;
  }


  private _isQuestion(msg: Message) {
    const question = msg.content.replace(this._mentionEx, '').trim();
    const resp = this._sai.ask(question)
    ;
    if (typeof resp == 'number') {
      return void msg.channel.send(this.setMedMsg(
        `:confused: Sorry, I don't understand that question.`
      ));
    }
    if (!resp) {
      return void msg.channel.send(this.setMedMsg(
        `:nerd: That question doesn't match anything in my knowledge-base.`
      ));
    }
    return void msg.channel.send(new this.Embed()
      .setTitle(resp.title)
      .setDescription(`${resp.answer}\u200b\n\u200b`)
      .setColor(this.colorFromPriority(MessagePriority.LOW))
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
    ];
  }


  reloadCmdHandler() {
    this._populateCommands();
    this._cmdHandler = new CommandHandler(this._commands);
  }


  hasValidRole(member: GuildMember, role: Role) {
    if (member.id == config.bot.creatorId) {
      return true;
    }
    return member.roles.cache.some(r => {
      return r.name == role;
    });
  }


  isBotMentioned(content: string) {
    const botId = `<@!${config.bot.id}>`;
    if (!content.includes(botId)) return false;
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


  colorFromPriority(priority: MessagePriority) {
    if (MessagePriority.LOW    == priority) return '#57E0B8';
    if (MessagePriority.MEDIUM == priority) return '#FFD200';
    if (MessagePriority.HIGH   == priority) return '#FF559D';
    if (MessagePriority.BLACK  == priority) return '#6C00FF';
    return '#aaaaaa';
  }


  setLowMsg(content: string, title = '') {
    return this.setMessage(title, MessagePriority.LOW, content);
  }

  setMedMsg(content: string, title = '') {
    return this.setMessage(title, MessagePriority.MEDIUM, content);
  }

  setHighMsg(content: string, title = '') {
    return this.setMessage(title, MessagePriority.HIGH, content);
  }

}